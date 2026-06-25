import { championImageUrl, NO_BAN_ICON_URL } from '../lib/ddragon';
import { TEAM_STYLES } from '../lib/teamColors';
import { isEmptyBan } from '../lib/draft';

interface BanSlotProps {
  position: 'right' | 'left';
  ddragonId: string | null;
}

export function BanSlot({ position, ddragonId }: BanSlotProps) {
  const clip =
    position === 'left'
      ? '[clip-path:polygon(75%_0%,0%_0%,25%_100%,100%_100%)]'
      : '[clip-path:polygon(25%_0%,100%_0%,75%_100%,0%_100%)]';

  const bg = TEAM_STYLES[position === 'left' ? 'blue' : 'red'].ban;
  const emptyBan = ddragonId !== null && isEmptyBan(ddragonId);
  const hasChampion = ddragonId !== null && !emptyBan;

  return (
    <div className={`${clip} ${bg} aspect-square w-28 overflow-hidden`}>
      {hasChampion && (
        <img
          src={championImageUrl(ddragonId)}
          alt={ddragonId}
          className="w-full h-full object-cover grayscale"
        />
      )}
      {emptyBan && (
        <img
          src={NO_BAN_ICON_URL}
          alt="Sin baneo"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
