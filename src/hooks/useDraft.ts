import { useEffect, useMemo, useRef, useState } from 'react';
import PartySocket from 'partysocket';
import {
  DEFAULT_LANE_ORDER,
  DRAFT_SEQUENCE,
  EMPTY_BAN,
  type ActionType,
  type Phase,
  type Role,
  type Team,
} from '../lib/draft';
import { getClientId } from '../lib/clientId';
import type { ClientMessage, ServerMessage } from '../lib/protocol';

interface ServerState {
  selections: (string | null)[];
  deadline: number | null;
  configured: boolean;
  started: boolean;
  blueName: string;
  redName: string;
  hasPassword: boolean;
  phase: Phase;
  blueOrder: number[];
  redOrder: number[];
  paused: boolean;
  blueReady: boolean;
  redReady: boolean;
}

interface SelfState {
  role: Role;
  authed: boolean;
}

const INITIAL_SERVER_STATE: ServerState = {
  selections: DRAFT_SEQUENCE.map(() => null),
  deadline: null,
  configured: false,
  started: false,
  blueName: 'Blue Team',
  redName: 'Red Team',
  hasPassword: false,
  phase: 'draft',
  blueOrder: [...DEFAULT_LANE_ORDER],
  redOrder: [...DEFAULT_LANE_ORDER],
  paused: false,
  blueReady: false,
  redReady: false,
};

const INITIAL_SELF_STATE: SelfState = {
  role: 'spectator',
  authed: false,
};

export function useDraft(roomId: string) {
  const [server, setServer] = useState<ServerState>(INITIAL_SERVER_STATE);
  const [self, setSelf] = useState<SelfState>(INITIAL_SELF_STATE);
  const [synced, setSynced] = useState(false);
  const [authError, setAuthError] = useState(false);
  const socketRef = useRef<PartySocket | null>(null);

  useEffect(() => {
    const socket = new PartySocket({
      host: import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999',
      room: roomId,
      id: getClientId(),
    });
    socketRef.current = socket;

    socket.addEventListener('message', (e) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      if (msg.type === 'state') {
        setServer({
          selections: msg.selections,
          deadline: msg.deadline,
          configured: msg.configured,
          started: msg.started,
          blueName: msg.blueName ?? INITIAL_SERVER_STATE.blueName,
          redName: msg.redName ?? INITIAL_SERVER_STATE.redName,
          hasPassword: msg.hasPassword,
          phase: msg.phase,
          blueOrder: msg.blueOrder,
          redOrder: msg.redOrder,
          paused: msg.paused,
          blueReady: msg.blueReady,
          redReady: msg.redReady,
        });
        setSynced(true);
      } else if (msg.type === 'self') {
        setSelf({ role: msg.team, authed: msg.authed });
      } else if (msg.type === 'authFailed') {
        setAuthError(true);
      }
    });

    return () => socket.close();
  }, [roomId]);

  function send(message: ClientMessage) {
    socketRef.current?.send(JSON.stringify(message));
  }

  const derived = useMemo(() => {
    const { selections } = server;
    const currentStep = selections.findIndex((s) => s === null);
    const isComplete = currentStep === -1;
    const currentTurn = isComplete ? null : DRAFT_SEQUENCE[currentStep];
    const usedIds = new Set(
      selections.filter((s): s is string => s !== null && s !== EMPTY_BAN)
    );
    const isMyTurn = !isComplete && currentTurn?.team === self.role;
    return { currentStep, isComplete, currentTurn, usedIds, isMyTurn };
  }, [server, self.role]);

  function slotsFor(team: Team, type: ActionType): (string | null)[] {
    return DRAFT_SEQUENCE.map((step, i) =>
      step.team === team && step.type === type ? server.selections[i] : undefined
    ).filter((v): v is string | null => v !== undefined);
  }

  function select(ddragonId: string) {
    send({ type: 'pick', ddragonId });
  }

  function setup(blueName: string, redName: string, password: string, side: Team) {
    send({ type: 'setup', blueName, redName, password, side });
  }

  function auth(password: string) {
    setAuthError(false);
    send({ type: 'auth', password });
  }

  function reorder(order: number[]) {
    send({ type: 'reorder', order });
  }

  function skipBan() {
    send({ type: 'skipBan' });
  }

  function ready() {
    send({ type: 'ready' });
  }

  return {
    ...derived,
    slotsFor,
    select,
    setup,
    auth,
    reorder,
    skipBan,
    ready,
    role: self.role,
    authed: self.authed,
    deadline: server.deadline,
    configured: server.configured,
    started: server.started,
    blueName: server.blueName,
    redName: server.redName,
    hasPassword: server.hasPassword,
    phase: server.phase,
    blueOrder: server.blueOrder,
    redOrder: server.redOrder,
    paused: server.paused,
    blueReady: server.blueReady,
    redReady: server.redReady,
    synced,
    authError,
  };
}
