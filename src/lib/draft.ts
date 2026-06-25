export type Team = 'blue' | 'red';
export type Role = Team | 'spectator';
export type ActionType = 'ban' | 'pick';
export type Phase = 'draft' | 'reorder' | 'done';

export interface DraftStep {
  team: Team;
  type: ActionType;
}

export const TURN_MS = 30_000;
export const REORDER_MS = 60_000;
export const TURN_SECONDS = TURN_MS / 1000;

export const LANE_COUNT = 5;
export const DEFAULT_LANE_ORDER = [0, 1, 2, 3, 4];

export const EMPTY_BAN = '';

export function isEmptyBan(value: string | null): boolean {
  return value === EMPTY_BAN;
}

export const DRAFT_SEQUENCE: DraftStep[] = [
  { team: 'blue', type: 'ban' },
  { team: 'red', type: 'ban' },
  { team: 'blue', type: 'ban' },
  { team: 'red', type: 'ban' },
  { team: 'blue', type: 'ban' },
  { team: 'red', type: 'ban' },
  { team: 'blue', type: 'pick' },
  { team: 'red', type: 'pick' },
  { team: 'red', type: 'pick' },
  { team: 'blue', type: 'pick' },
  { team: 'blue', type: 'pick' },
  { team: 'red', type: 'pick' },
  { team: 'red', type: 'ban' },
  { team: 'blue', type: 'ban' },
  { team: 'red', type: 'ban' },
  { team: 'blue', type: 'ban' },
  { team: 'red', type: 'pick' },
  { team: 'blue', type: 'pick' },
  { team: 'blue', type: 'pick' },
  { team: 'red', type: 'pick' },
];

export interface StepPhase {
  type: ActionType;
  round: number;
}

const STEP_PHASES: StepPhase[] = buildStepPhases();

function buildStepPhases(): StepPhase[] {
  const counters: Record<ActionType, number> = { ban: 0, pick: 0 };
  const phases: StepPhase[] = [];
  let previous: ActionType | null = null;

  for (const step of DRAFT_SEQUENCE) {
    if (step.type !== previous) {
      counters[step.type] += 1;
      previous = step.type;
    }
    phases.push({ type: step.type, round: counters[step.type] });
  }
  return phases;
}

export function stepPhase(step: number): StepPhase | null {
  return STEP_PHASES[step] ?? null;
}
