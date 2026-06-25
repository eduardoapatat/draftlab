import { BanSlot } from './BanSlot';
import { MatchStatus } from './MatchStatus';
import type { Role, Team } from '../lib/draft';

interface BanBarProps {
  blueBans: (string | null)[];
  redBans: (string | null)[];
  status: {
    show: boolean;
    mode: 'ready' | 'turn';
    role: Role;
    blueName: string;
    redName: string;
    blueReady: boolean;
    redReady: boolean;
    activeTeam: Team | null;
    onReady: () => void;
  };
}

export function BanBar({ blueBans, redBans, status }: BanBarProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex gap-2">
        <div className="flex [&>div+div]:-ml-6">
          {blueBans.slice(0, 3).map((id, i) => (
            <BanSlot key={i} position="left" ddragonId={id} />
          ))}
        </div>
        <div className="flex [&>div+div]:-ml-6">
          {blueBans.slice(3, 5).map((id, i) => (
            <BanSlot key={i + 3} position="left" ddragonId={id} />
          ))}
        </div>
      </div>
      {status.show && (
        <div className="flex flex-1 justify-center px-6">
          <MatchStatus
            mode={status.mode}
            role={status.role}
            blueName={status.blueName}
            redName={status.redName}
            blueReady={status.blueReady}
            redReady={status.redReady}
            activeTeam={status.activeTeam}
            onReady={status.onReady}
          />
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex [&>div+div]:-ml-6">
          {redBans.slice(0, 3).map((id, i) => (
            <BanSlot key={i} position="right" ddragonId={id} />
          ))}
        </div>
        <div className="flex [&>div+div]:-ml-6">
          {redBans.slice(3, 5).map((id, i) => (
            <BanSlot key={i + 3} position="right" ddragonId={id} />
          ))}
        </div>
      </div>
    </div>
  );
}
