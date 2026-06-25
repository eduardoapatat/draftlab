import type { Team } from './draft';

export interface ChampionArt {
  position?: string;
  scale?: number;
  flipBlue?: boolean;
  flipRed?: boolean;
}

const DEFAULT_ART = {
  position: '50% 0%',
  scale: 2.1,
} as const;

export const CHAMPION_ART: Record<string, ChampionArt> = {
  TahmKench: { position: '10% 10%', scale: 2.25 },
  Nami: { position: '10% 0%', scale: 2.25 },
};

export interface ResolvedArt {
  position: string;
  scaleX: number;
  scaleY: number;
}

export function getChampionArt(ddragonId: string, side: Team): ResolvedArt {
  const override = CHAMPION_ART[ddragonId];

  const position = override?.position ?? DEFAULT_ART.position;
  const scale = override?.scale ?? DEFAULT_ART.scale;

  const flip =
    side === 'blue' ? override?.flipBlue === true : override?.flipRed === true;

  return {
    position,
    scaleX: flip ? -scale : scale,
    scaleY: scale,
  };
}
