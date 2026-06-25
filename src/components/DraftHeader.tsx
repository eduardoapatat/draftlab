import { TeamHeader } from './TeamHeader';
import type { Team } from '../lib/draft';

interface DraftHeaderProps {
  activeTeam: Team | null;
  remaining: number;
  blueName: string;
  redName: string;
}

export function DraftHeader({
  activeTeam,
  remaining,
  blueName,
  redName,
}: DraftHeaderProps) {
  const blueTimer = activeTeam === 'blue' ? String(remaining) : '';
  const redTimer = activeTeam === 'red' ? String(remaining) : '';

  return (
    <div className="flex w-full items-center [&>*+*]:-ml-4">
      <TeamHeader position="left" team="blue" name={blueName} timer={blueTimer} />
      <div className="[clip-path:polygon(0_0,100%_0,calc(100%-20px)_100%,20px_100%)] bg-neutral-700 w-40 h-16 shrink-0">
        <div className="flex w-full items-center justify-center h-full">
          <p className="text-3xl">VS</p>
        </div>
      </div>
      <TeamHeader position="right" team="red" name={redName} timer={redTimer} />
    </div>
  );
}
