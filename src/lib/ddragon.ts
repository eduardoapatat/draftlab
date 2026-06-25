import type { Champion } from '../types/champion';

const DDRAGON_VERSION = '16.12.1';
const DDRAGON_LOCALE = 'es_MX';

const BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion`;

export function championImageUrl(ddragonId: string): string {
  return `${BASE}/${ddragonId}.png`;
}

const SPLASH_BASE =
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash';

export function championSplashUrl(ddragonId: string, skin = 0): string {
  return `${SPLASH_BASE}/${ddragonId}_${skin}.jpg`;
}

export function championCenteredSplashUrl(ddragonId: string): string {
  return `https://cdn.communitydragon.org/latest/champion/${ddragonId}/splash-art/centered`;
}

export const NO_BAN_ICON_URL =
  'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png';

interface DDragonChampion {
  id: string;
  name: string;
  title: string;
  tags: string[];
}

interface ChampionJsonResponse {
  data: Record<string, DDragonChampion>;
}

export async function fetchChampions(): Promise<Champion[]> {
  const url = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/${DDRAGON_LOCALE}/champion.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`DDragon respondió ${res.status}`);
  }
  const json: ChampionJsonResponse = await res.json();

  return Object.values(json.data)
    .map((c) => ({
      id: c.id,
      name: c.name,
      title: c.title,
      ddragonId: c.id,
      tags: c.tags,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

