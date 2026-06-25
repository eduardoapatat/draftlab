import { Button } from '@/components/ui/button';
import { goToNewRoom } from '../lib/room';
import { stepPhase, type Phase, type Role } from '../lib/draft';
import { t } from '../lib/i18n';

interface TopBarProps {
  roomId: string;
  role: Role;
  waitingForOpponent: boolean;
  phase: Phase;
  currentStep: number;
  reorderRemaining: number;
  live: boolean;
}

export function TopBar({
  roomId,
  waitingForOpponent,
  phase,
  currentStep,
  reorderRemaining,
  live,
  role,
}: TopBarProps) {
  return (
    <div className="relative shrink-0 flex items-center justify-between gap-4 border-b border-white/10 bg-black/40 px-6 py-3 text-sm">
      <div className="flex items-center gap-2 font-mono text-white/80">
        <span>
          {t('top.room')} <b className="text-white">{roomId}</b>
        </span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
        <PhaseLabel phase={phase} currentStep={currentStep} live={live} />
        <TurnStatus
          waitingForOpponent={waitingForOpponent}
          phase={phase}
          reorderRemaining={reorderRemaining}
          role={role}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
        >
          {t('top.copy')}
        </Button>
        <Button variant="secondary" onClick={goToNewRoom}>
          {t('top.newRoom')}
        </Button>
      </div>
    </div>
  );
}

function PhaseLabel({
  phase,
  currentStep,
  live,
}: Pick<TopBarProps, 'phase' | 'currentStep' | 'live'>) {
  if (phase === 'reorder') {
    return (
      <span className="font-semibold uppercase tracking-wide text-white/70">
        {t('phase.reorder')}
      </span>
    );
  }

  if (phase !== 'draft' || !live) return null;

  const current = stepPhase(currentStep);
  if (!current) return null;

  const label =
    current.type === 'ban'
      ? t('phase.ban', { n: current.round })
      : t('phase.pick', { n: current.round });

  return (
    <span className="font-semibold uppercase tracking-wide text-white/70">
      {label}
    </span>
  );
}

function TurnStatus({
  waitingForOpponent,
  phase,
  reorderRemaining,
  role,
}: Pick<
  TopBarProps,
  'waitingForOpponent' | 'phase' | 'reorderRemaining' | 'role'
>) {
  if (phase === 'done') {
    return (
      <span className="rounded-lg bg-gold px-4 py-1.5 text-sm font-bold text-black">
        {t('top.complete')}
      </span>
    );
  }

  if (phase === 'reorder') {
    const hint =
      role === 'spectator'
        ? t('top.reorderSpectator')
        : t('top.reorderCaptain');
    return (
      <span className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-bold text-gold">
        {hint} · {reorderRemaining}s
      </span>
    );
  }

  if (waitingForOpponent) {
    return (
      <span className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-bold text-gold">
        {t('top.waiting')}
      </span>
    );
  }

  return null;
}
