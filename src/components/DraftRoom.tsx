import { useState } from 'react';
import { ChampionGrid } from './ChampionGrid';
import { TeamPanel } from './TeamPanel';
import { BanBar } from './BanBar';
import { DraftHeader } from './DraftHeader';
import { StartDialog } from './StartDialog';
import { PasswordDialog } from './PasswordDialog';
import { TopBar } from './TopBar';
import { Loader2 } from 'lucide-react';
import { useDraft } from '../hooks/useDraft';
import { useChampions } from '../hooks/useChampions';
import { useCountdown } from '../hooks/useCountdown';
import { t } from '../lib/i18n';

interface DraftRoomProps {
  roomId: string;
}

export function DraftRoom({ roomId }: DraftRoomProps) {
  const draft = useDraft(roomId);
  const { champions, loading, error } = useChampions();
  const remaining = useCountdown(draft.deadline);

  const [skipAuth, setSkipAuth] = useState(false);

  const live = draft.started && !draft.paused;
  const activeTeam = live ? (draft.currentTurn?.team ?? null) : null;

  const showSetup = draft.synced && !draft.configured;
  const showPassword =
    draft.synced &&
    draft.configured &&
    draft.hasPassword &&
    !draft.authed &&
    !skipAuth;

  const reordering = draft.phase === 'reorder';
  const showLanes = draft.phase === 'reorder' || draft.phase === 'done';
  const inBanPhase = live && draft.currentTurn?.type === 'ban';
  const canSkipBan = inBanPhase && draft.isMyTurn;

  const inLobby =
    draft.synced && draft.configured && !draft.started && !draft.isComplete;
  const waitingForOpponent = inLobby || (draft.started && draft.paused);

  return (
    <div className="h-screen flex flex-col">
      <StartDialog open={showSetup} onSubmit={draft.setup} />
      <PasswordDialog
        open={showPassword}
        error={draft.authError}
        onSubmit={draft.auth}
        onSkip={() => setSkipAuth(true)}
      />
      <TopBar
        roomId={roomId}
        role={draft.role}
        waitingForOpponent={waitingForOpponent}
        phase={draft.phase}
        currentStep={draft.currentStep}
        reorderRemaining={remaining}
        live={live}
      />
      <div className="shrink-0 pt-4 px-16">
        <DraftHeader
          activeTeam={activeTeam}
          remaining={remaining}
          blueName={draft.blueName}
          redName={draft.redName}
        />
      </div>
      <div className="flex flex-1 min-h-0 py-6 h-full px-16">
        <div className="flex w-full h-full items-center">
          <div className="shrink-0 flex">
            <TeamPanel
              picks={draft.slotsFor('blue', 'pick')}
              order={draft.blueOrder}
              side="blue"
              editable={reordering && draft.role === 'blue'}
              showLanes={showLanes}
              onReorder={draft.reorder}
            />
          </div>
          <div className="flex-1 h-full min-h-0 mx-6">
            {error && (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-red-400">
                  {t('champions.error', { message: error })}
                </p>
              </div>
            )}
            {!error && (!draft.synced || loading) && (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-10 animate-spin text-gold" />
              </div>
            )}
            {!error && draft.synced && !loading && (
              <ChampionGrid
                champions={champions}
                usedIds={draft.usedIds}
                canPick={draft.isMyTurn}
                showNoBan={inBanPhase}
                canSkipBan={canSkipBan}
                onSelect={draft.select}
                onSkipBan={draft.skipBan}
              />
            )}
          </div>
          <div className="shrink-0 flex">
            <TeamPanel
              picks={draft.slotsFor('red', 'pick')}
              order={draft.redOrder}
              side="red"
              editable={reordering && draft.role === 'red'}
              showLanes={showLanes}
              onReorder={draft.reorder}
            />
          </div>
        </div>
      </div>
      <div className="shrink-0 pb-8 px-16">
        <BanBar
          blueBans={draft.slotsFor('blue', 'ban')}
          redBans={draft.slotsFor('red', 'ban')}
          status={{
            show: inLobby || activeTeam !== null,
            mode: inLobby ? 'ready' : 'turn',
            role: draft.role,
            blueName: draft.blueName,
            redName: draft.redName,
            blueReady: draft.blueReady,
            redReady: draft.redReady,
            activeTeam,
            onReady: draft.ready,
          }}
        />
      </div>
    </div>
  );
}
