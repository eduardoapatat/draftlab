import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TEAM_STYLES } from '../lib/teamColors';
import type { Team } from '../lib/draft';
import { t } from '../lib/i18n';

interface StartDialogProps {
  open: boolean;
  onSubmit: (
    blueName: string,
    redName: string,
    password: string,
    side: Team
  ) => void;
}

export function StartDialog({ open, onSubmit }: StartDialogProps) {
  const [blue, setBlue] = useState('');
  const [red, setRed] = useState('');
  const [password, setPassword] = useState('');
  const [side, setSide] = useState<Team>('blue');

  const canStart = blue.trim() !== '' && red.trim() !== '';

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t('setup.title')}</DialogTitle>
          <DialogDescription>{t('setup.desc')}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canStart) return;
            onSubmit(blue.trim(), red.trim(), password, side);
          }}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="blue">{t('setup.blue')}</Label>
            <Input
              id="blue"
              value={blue}
              onChange={(e) => setBlue(e.target.value)}
              placeholder="Blue Team"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="red">{t('setup.red')}</Label>
            <Input
              id="red"
              value={red}
              onChange={(e) => setRed(e.target.value)}
              placeholder="Red Team"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t('setup.password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('setup.passwordPlaceholder')}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t('setup.side')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <SideButton
                team="blue"
                label={t('setup.sideBlue')}
                selected={side === 'blue'}
                onClick={() => setSide('blue')}
              />
              <SideButton
                team="red"
                label={t('setup.sideRed')}
                selected={side === 'red'}
                onClick={() => setSide('red')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!canStart}>
              {t('setup.start')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface SideButtonProps {
  team: Team;
  label: string;
  selected: boolean;
  onClick: () => void;
}

function SideButton({ team, label, selected, onClick }: SideButtonProps) {
  const bg = TEAM_STYLES[team].plate;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${bg} rounded px-3 py-2 text-sm font-semibold text-white transition ${
        selected
          ? 'ring-2 ring-white ring-offset-2 ring-offset-background'
          : 'opacity-50 hover:opacity-80'
      }`}
    >
      {label}
    </button>
  );
}
