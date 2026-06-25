import { championCenteredSplashUrl } from '../lib/ddragon';
import { getChampionArt } from '../lib/championArt';
import { TEAM_STYLES } from '../lib/teamColors';
import type { Team } from '../lib/draft';

interface PickSlotProps {
  playerName: string;
  ddragonId: string | null;
  side: Team;
}

export function PickSlot({ playerName, ddragonId, side }: PickSlotProps) {
  const art = ddragonId ? getChampionArt(ddragonId, side) : null;
  const borderSide = side === 'blue' ? 'borderRight' : 'borderLeft';

  return (
    <div
      className="relative overflow-hidden w-full aspect-3/1 bg-neutral-800"
      style={{ [borderSide]: `4px solid ${TEAM_STYLES[side].color}` }}
    >
      {ddragonId && art && (
        <img
          className="absolute object-cover w-full h-full"
          style={{
            objectPosition: art.position,
            transform: `scaleX(${art.scaleX}) scaleY(${art.scaleY})`,
          }}
          src={championCenteredSplashUrl(ddragonId)}
          alt={ddragonId}
        />
      )}
      <p className="absolute right-0 px-4 py-2 bottom-0 text-xl font-mono text-center text-white text-shadow-[0_0_8px_#000,0_0_6px_#000,0_0_12px_#000]">
        {playerName}
      </p>
    </div>
  );
}
