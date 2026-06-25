import type { Phase, Role, Team } from './draft';

export interface StateMessage {
  type: 'state';
  selections: (string | null)[];
  deadline: number | null;
  currentStep: number;
  configured: boolean;
  started: boolean;
  blueName: string | null;
  redName: string | null;
  hasPassword: boolean;
  phase: Phase;
  blueOrder: number[];
  redOrder: number[];
  paused: boolean;
  blueReady: boolean;
  redReady: boolean;
}

export interface SelfMessage {
  type: 'self';
  team: Role;
  authed: boolean;
}

export interface AuthFailedMessage {
  type: 'authFailed';
}

export type ServerMessage = StateMessage | SelfMessage | AuthFailedMessage;

export interface PickMessage {
  type: 'pick';
  ddragonId: string;
}

export interface SetupMessage {
  type: 'setup';
  blueName: string;
  redName: string;
  password: string;
  side: Team;
}

export interface AuthMessage {
  type: 'auth';
  password: string;
}

export interface ReorderMessage {
  type: 'reorder';
  order: number[];
}

export interface SkipBanMessage {
  type: 'skipBan';
}

export interface ReadyMessage {
  type: 'ready';
}

export type ClientMessage =
  | PickMessage
  | SetupMessage
  | AuthMessage
  | ReorderMessage
  | SkipBanMessage
  | ReadyMessage;
