import { isValidRoomId, newRoomId, normalizeRoomId } from './roomId';

export function getRoomId(): string | null {
  const fromPath = window.location.pathname.replace(/^\/+/, '').trim();
  if (!fromPath) return null;
  return isValidRoomId(fromPath) ? fromPath : null;
}

export function goToNewRoom(): void {
  window.location.href = `/${newRoomId()}`;
}

export function joinRoom(code: string): void {
  const id = normalizeRoomId(code);
  if (isValidRoomId(id)) window.location.href = `/${id}`;
}
