import type { ClientMessage } from './protocol';

const MAX_NAME_LENGTH = 40;
const MAX_PASSWORD_LENGTH = 100;
const MAX_DDRAGON_ID_LENGTH = 40;

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function clampString(v: unknown, max: number): string {
  return isString(v) ? v.slice(0, max) : '';
}

export function parseClientMessage(raw: string): ClientMessage | null {
  if (raw.length > 2000) return null;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== 'object' || data === null) return null;
  const msg = data as Record<string, unknown>;

  switch (msg.type) {
    case 'pick':
      if (!isString(msg.ddragonId)) return null;
      return {
        type: 'pick',
        ddragonId: msg.ddragonId.slice(0, MAX_DDRAGON_ID_LENGTH),
      };

    case 'setup':
      return {
        type: 'setup',
        blueName: clampString(msg.blueName, MAX_NAME_LENGTH),
        redName: clampString(msg.redName, MAX_NAME_LENGTH),
        password: clampString(msg.password, MAX_PASSWORD_LENGTH),
        side: msg.side === 'red' ? 'red' : 'blue',
      };

    case 'auth':
      return {
        type: 'auth',
        password: clampString(msg.password, MAX_PASSWORD_LENGTH),
      };

    case 'reorder':
      if (!Array.isArray(msg.order)) return null;
      return { type: 'reorder', order: msg.order };

    case 'skipBan':
      return { type: 'skipBan' };

    case 'ready':
      return { type: 'ready' };

    default:
      return null;
  }
}
