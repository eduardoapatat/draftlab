import { Check } from 'lucide-react';
import { TEAM_STYLES } from '../lib/teamColors';
import type { Role, Team } from '../lib/draft';
import { t } from '../lib/i18n';

interface MatchStatusProps {
  mode: 'ready' | 'turn';
  role: Role;
  blueName: string;
  redName: string;
  blueReady: boolean;
  redReady: boolean;
  activeTeam: Team | null;
  onReady: () => void;
}

export function MatchStatus({
  mode,
  role,
  blueName,
  redName,
  blueReady,
  redReady,
  activeTeam,
  onReady,
}: MatchStatusProps) {
  if (mode === 'turn') {
    if (!activeTeam) return null;
    const color = TEAM_STYLES[activeTeam].color;
    const name = activeTeam === 'blue' ? blueName : redName;
    return (
      <div
        className="text-2xl font-bold uppercase tracking-wide"
        style={{ color }}
      >
        {t('turn.of', { name })}
      </div>
    );
  }

  const myReady =
    role === 'blue' ? blueReady : role === 'red' ? redReady : true;
  const isCaptain = role === 'blue' || role === 'red';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-5 text-base">
        <TeamStatus name={blueName} side="blue" ready={blueReady} />
        <span className="text-white/20">·</span>
        <TeamStatus name={redName} side="red" ready={redReady} />
      </div>

      {isCaptain && !myReady && (
        <button
          onClick={onReady}
          className="rounded-lg bg-gold px-6 py-2 text-base font-semibold text-black transition-colors hover:bg-gold-bright"
        >
          {t('ready.button')}
        </button>
      )}
    </div>
  );
}

interface TeamStatusProps {
  name: string;
  side: 'blue' | 'red';
  ready: boolean;
}

function TeamStatus({ name, side, ready }: TeamStatusProps) {
  const dot = TEAM_STYLES[side].plate;
  return (
    <div className="flex items-center gap-2">
      <span className={`size-3 rounded-full ${dot}`} />
      <span className="font-medium text-white/80">{name}</span>
      {ready ? (
        <span className="flex items-center gap-1 font-semibold text-gold">
          <Check className="size-5" />
          {t('ready.ready')}
        </span>
      ) : (
        <span className="text-white/40">{t('ready.waiting')}</span>
      )}
    </div>
  );
}
