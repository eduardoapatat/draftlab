const ROOM_ID_PATTERN = /^[a-z0-9]{4,16}$/;

export function isValidRoomId(id: string): boolean {
  return ROOM_ID_PATTERN.test(id);
}

export function normalizeRoomId(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 16);
}

export function newRoomId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}
