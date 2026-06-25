import type * as Party from 'partykit/server';
import {
  DEFAULT_LANE_ORDER,
  DRAFT_SEQUENCE,
  EMPTY_BAN,
  LANE_COUNT,
  REORDER_MS,
  TURN_MS,
  type ActionType,
  type Phase,
  type Role,
  type Team,
} from '../src/lib/draft';
import { fetchChampions } from '../src/lib/ddragon';
import { isValidRoomId } from '../src/lib/roomId';
import { parseClientMessage } from '../src/lib/parseClientMessage';
import type {
  AuthFailedMessage,
  SelfMessage,
  StateMessage,
} from '../src/lib/protocol';
import { RateLimiter } from './rateLimiter';

const MAX_AUTH_ATTEMPTS = 10;

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export default class DraftServer implements Party.Server {
  selections: (string | null)[] = DRAFT_SEQUENCE.map(() => null);
  deadline: number | null = null;
  timer: ReturnType<typeof setTimeout> | null = null;
  pool: string[] = [];
  assignments = new Map<string, Role>();

  blueName: string | null = null;
  redName: string | null = null;
  password: string | null = null;
  creatorId: string | null = null;
  creatorSide: Team = 'blue';
  authed = new Set<string>();

  phase: Phase = 'draft';
  blueOrder: number[] = [...DEFAULT_LANE_ORDER];
  redOrder: number[] = [...DEFAULT_LANE_ORDER];

  rateLimiter = new RateLimiter(20, 1000);
  authAttempts = new Map<string, number>();

  paused = false;
  remainingMs: number | null = null;

  blueReady = false;
  redReady = false;

  constructor(readonly room: Party.Room) {}

  started = false;

  get configured(): boolean {
    return this.blueName !== null;
  }

  bothCaptainsPresent(): boolean {
    const liveIds = new Set([...this.room.getConnections()].map((c) => c.id));
    const teams = new Set<Role>();
    for (const [id, team] of this.assignments) {
      if (liveIds.has(id)) teams.add(team);
    }
    return teams.has('blue') && teams.has('red');
  }

  presence(): string {
    const liveIds = new Set([...this.room.getConnections()].map((c) => c.id));
    let blue = '-';
    let red = '-';
    let spectators = 0;
    for (const [id, team] of this.assignments) {
      if (!liveIds.has(id)) continue;
      if (team === 'blue') blue = 'blue';
      else if (team === 'red') red = 'red';
      else spectators += 1;
    }
    return `blue=${blue} red=${red} spectators=${spectators}`;
  }

  log(event: string): void {
    const phase = this.paused ? `${this.phase}(paused)` : this.phase;
    console.log(
      `[${this.room.id}] ${event} | phase=${phase} step=${this.currentStep()} | ${this.presence()}`
    );
  }

  tryStart() {
    if (this.started) return;
    if (!this.configured) return;
    if (this.currentStep() === -1) return;
    if (!this.bothCaptainsPresent()) return;
    if (!this.blueReady || !this.redReady) return;
    this.started = true;
    this.startTurn();
    this.log('draft started');
    this.room.broadcast(JSON.stringify(this.stateMsg()));
  }

  handleReady(sender: Party.Connection) {
    if (this.started) return;
    const team = this.assignments.get(sender.id);
    if (team === 'blue') this.blueReady = true;
    else if (team === 'red') this.redReady = true;
    else return;
    this.log(`ready ${team}`);
    this.room.broadcast(JSON.stringify(this.stateMsg()));
    this.tryStart();
  }

  pauseIfIncomplete() {
    if (!this.started || this.paused) return;
    if (this.phase !== 'draft' && this.phase !== 'reorder') return;
    if (this.bothCaptainsPresent()) return;

    this.paused = true;
    if (this.deadline !== null) {
      this.remainingMs = Math.max(0, this.deadline - Date.now());
    }
    this.deadline = null;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.log('paused (captain missing)');
    this.room.broadcast(JSON.stringify(this.stateMsg()));
  }

  resumeIfReady() {
    if (!this.paused) return;
    if (!this.bothCaptainsPresent()) return;

    this.paused = false;
    const ms = this.remainingMs ?? TURN_MS;
    this.remainingMs = null;
    this.deadline = Date.now() + ms;
    if (this.timer) clearTimeout(this.timer);
    const onExpire =
      this.phase === 'reorder'
        ? () => this.onReorderTimeout()
        : () => this.onTimeout();
    this.timer = setTimeout(onExpire, ms);
    this.log('resumed');
    this.room.broadcast(JSON.stringify(this.stateMsg()));
  }

  async onStart() {
    const champs = await fetchChampions();
    this.pool = champs.map((c) => c.ddragonId);
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    if (!this.isAllowedOrigin(ctx.request)) {
      conn.close(1008, 'origin not allowed');
      return;
    }
    if (!isValidRoomId(this.room.id)) {
      conn.close(1008, 'invalid room');
      return;
    }
    this.recomputeRoles();
    conn.send(JSON.stringify(this.stateMsg()));
    this.log(`connect ${conn.id}`);
    this.tryStart();
    this.resumeIfReady();
  }

  isAllowedOrigin(request: Party.Request): boolean {
    const allowed = this.room.env.ALLOWED_ORIGIN;
    if (typeof allowed !== 'string' || allowed === '') return true;
    const origin = request.headers.get('origin');
    return origin === allowed;
  }

  onMessage(raw: string, sender: Party.Connection) {
    if (!this.rateLimiter.allow(sender.id)) return;

    const msg = parseClientMessage(raw);
    if (msg === null) return;

    if (msg.type === 'pick') {
      this.handlePick(sender, msg.ddragonId);
    } else if (msg.type === 'setup') {
      this.handleSetup(sender, msg.blueName, msg.redName, msg.password, msg.side);
    } else if (msg.type === 'auth') {
      this.handleAuth(sender, msg.password);
    } else if (msg.type === 'reorder') {
      this.handleReorder(sender, msg.order);
    } else if (msg.type === 'skipBan') {
      this.handleSkipBan(sender);
    } else if (msg.type === 'ready') {
      this.handleReady(sender);
    }
  }

  onClose(conn: Party.Connection) {
    this.rateLimiter.forget(conn.id);
    this.authAttempts.delete(conn.id);
    if ([...this.room.getConnections()].length === 0) {
      this.resetDraft();
      console.log(`[${this.room.id}] room empty -> draft reset`);
    } else {
      this.recomputeRoles();
      this.log(`disconnect ${conn.id}`);
      this.pauseIfIncomplete();
    }
  }

  currentStep(): number {
    return this.selections.findIndex((s) => s === null);
  }

  recomputeRoles() {
    const conns = [...this.room.getConnections()];
    const liveIds = new Set(conns.map((c) => c.id));

    const takenNow = (): Set<Role> => {
      const taken = new Set<Role>();
      for (const [id, team] of this.assignments) {
        if (liveIds.has(id) && team !== 'spectator') taken.add(team);
      }
      return taken;
    };

    if (this.creatorId !== null && liveIds.has(this.creatorId)) {
      this.assignments.set(this.creatorId, this.creatorSide);
    }

    const owner: Partial<Record<'blue' | 'red', string>> = {};
    if (this.creatorId !== null && liveIds.has(this.creatorId)) {
      owner[this.creatorSide] = this.creatorId;
    }
    for (const conn of conns) {
      const team = this.assignments.get(conn.id);
      if (team !== 'blue' && team !== 'red') continue;
      if (owner[team] === undefined) {
        owner[team] = conn.id;
      } else if (owner[team] !== conn.id) {
        this.assignments.set(conn.id, 'spectator');
      }
    }

    for (const conn of conns) {
      if (!this.assignments.has(conn.id)) {
        const eligible = this.password === null || this.authed.has(conn.id);
        let team: Role = 'spectator';
        if (eligible) {
          const taken = takenNow();
          team = !taken.has('blue')
            ? 'blue'
            : !taken.has('red')
              ? 'red'
              : 'spectator';
        }
        this.assignments.set(conn.id, team);
      }
    }

    if (!this.started) {
      const present = takenNow();
      if (!present.has('blue')) this.blueReady = false;
      if (!present.has('red')) this.redReady = false;
    }

    for (const conn of conns) {
      const self: SelfMessage = {
        type: 'self',
        team: this.assignments.get(conn.id) ?? 'spectator',
        authed: this.authed.has(conn.id),
      };
      conn.send(JSON.stringify(self));
    }
  }

  resetDraft() {
    this.selections = DRAFT_SEQUENCE.map(() => null);
    this.deadline = null;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.assignments.clear();
    this.authed.clear();
    this.blueName = null;
    this.redName = null;
    this.password = null;
    this.creatorId = null;
    this.creatorSide = 'blue';
    this.started = false;
    this.paused = false;
    this.remainingMs = null;
    this.blueReady = false;
    this.redReady = false;
    this.phase = 'draft';
    this.blueOrder = [...DEFAULT_LANE_ORDER];
    this.redOrder = [...DEFAULT_LANE_ORDER];
  }

  handleSetup(
    sender: Party.Connection,
    blueName: string,
    redName: string,
    password: string,
    side: Team
  ) {
    if (this.configured) return;
    this.blueName = (blueName || 'Blue Team').trim().slice(0, 30);
    this.redName = (redName || 'Red Team').trim().slice(0, 30);
    this.password = password ? password : null;

    this.creatorId = sender.id;
    this.creatorSide = side === 'red' ? 'red' : 'blue';

    for (const conn of this.room.getConnections()) this.authed.add(conn.id);

    this.assignments.clear();
    this.recomputeRoles();
    this.log(
      `configured "${this.blueName}" vs "${this.redName}" password=${this.password !== null} creator=${this.creatorSide}`
    );
    this.room.broadcast(JSON.stringify(this.stateMsg()));
    this.tryStart();
  }

  handleAuth(sender: Party.Connection, password: string) {
    if (this.password === null) return;

    const attempts = this.authAttempts.get(sender.id) ?? 0;
    if (attempts >= MAX_AUTH_ATTEMPTS) {
      sender.send(JSON.stringify({ type: 'authFailed' } satisfies AuthFailedMessage));
      return;
    }

    if (!constantTimeEqual(password, this.password)) {
      this.authAttempts.set(sender.id, attempts + 1);
      sender.send(JSON.stringify({ type: 'authFailed' } satisfies AuthFailedMessage));
      return;
    }

    this.authAttempts.delete(sender.id);
    this.authed.add(sender.id);
    this.assignments.delete(sender.id);
    this.recomputeRoles();
    this.tryStart();
  }

  startTurn() {
    if (this.currentStep() === -1) {
      this.deadline = null;
      return;
    }
    this.deadline = Date.now() + TURN_MS;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.onTimeout(), TURN_MS);
  }

  currentType(): ActionType | null {
    const step = this.currentStep();
    return step === -1 ? null : DRAFT_SEQUENCE[step].type;
  }

  onTimeout() {
    if (this.currentStep() === -1) return;
    if (this.currentType() === 'ban') {
      this.applyPick(EMPTY_BAN);
      return;
    }
    const used = this.usedSet();
    const free = this.pool.filter((id) => !used.has(id));
    const pick = free[Math.floor(Math.random() * free.length)];
    this.applyPick(pick);
  }

  handlePick(sender: Party.Connection, ddragonId: string) {
    if (!this.configured || this.paused) return;
    if (this.currentStep() === -1) return;
    if (ddragonId === EMPTY_BAN) return;
    const senderTeam = this.assignments.get(sender.id);
    const turnTeam = DRAFT_SEQUENCE[this.currentStep()].team;
    if (senderTeam !== turnTeam) return;
    if (this.usedSet().has(ddragonId)) return;
    if (!this.pool.includes(ddragonId)) return;
    this.applyPick(ddragonId);
  }

  handleSkipBan(sender: Party.Connection) {
    if (!this.configured || this.paused) return;
    const step = this.currentStep();
    if (step === -1) return;
    if (DRAFT_SEQUENCE[step].type !== 'ban') return;
    const senderTeam = this.assignments.get(sender.id);
    if (senderTeam !== DRAFT_SEQUENCE[step].team) return;
    this.applyPick(EMPTY_BAN);
  }

  applyPick(ddragonId: string) {
    const step = this.currentStep();
    if (step === -1) return;
    this.selections[step] = ddragonId;

    if (this.currentStep() === -1) {
      this.startReorder();
    } else {
      this.startTurn();
    }

    this.room.broadcast(JSON.stringify(this.stateMsg()));
  }

  startReorder() {
    this.phase = 'reorder';
    this.deadline = Date.now() + REORDER_MS;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.onReorderTimeout(), REORDER_MS);
    this.log('picks complete -> reorder phase');
  }

  onReorderTimeout() {
    this.phase = 'done';
    this.deadline = null;
    this.timer = null;
    this.log('draft done');
    this.room.broadcast(JSON.stringify(this.stateMsg()));
  }

  handleReorder(sender: Party.Connection, order: unknown) {
    if (this.phase !== 'reorder') return;
    const team = this.assignments.get(sender.id);
    if (team !== 'blue' && team !== 'red') return;
    if (!this.isValidOrder(order)) return;

    if (team === 'blue') this.blueOrder = order;
    else this.redOrder = order;

    this.room.broadcast(JSON.stringify(this.stateMsg()));
  }

  isValidOrder(order: unknown): order is number[] {
    if (!Array.isArray(order) || order.length !== LANE_COUNT) return false;
    const seen = new Set<number>();
    for (const n of order) {
      if (!Number.isInteger(n) || n < 0 || n >= LANE_COUNT || seen.has(n)) {
        return false;
      }
      seen.add(n);
    }
    return true;
  }

  usedSet(): Set<string> {
    return new Set(
      this.selections.filter(
        (s): s is string => s !== null && s !== EMPTY_BAN
      )
    );
  }

  stateMsg(): StateMessage {
    return {
      type: 'state',
      selections: this.selections,
      deadline: this.deadline,
      currentStep: this.currentStep(),
      configured: this.configured,
      started: this.started,
      blueName: this.blueName,
      redName: this.redName,
      hasPassword: this.password !== null,
      phase: this.phase,
      blueOrder: this.blueOrder,
      redOrder: this.redOrder,
      paused: this.paused,
      blueReady: this.blueReady,
      redReady: this.redReady,
    };
  }
}
