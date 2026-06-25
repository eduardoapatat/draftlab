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
import { t } from '../lib/i18n';

interface PasswordDialogProps {
  open: boolean;
  error: boolean;
  onSubmit: (password: string) => void;
  onSkip: () => void;
}

export function PasswordDialog({
  open,
  error,
  onSubmit,
  onSkip,
}: PasswordDialogProps) {
  const [password, setPassword] = useState('');

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t('auth.title')}</DialogTitle>
          <DialogDescription>{t('auth.desc')}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password.trim() === '') return;
            onSubmit(password);
          }}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="join-password">{t('auth.password')}</Label>
            <Input
              id="join-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-400">{t('auth.error')}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onSkip}>
              {t('auth.spectator')}
            </Button>
            <Button type="submit" disabled={password.trim() === ''}>
              {t('auth.enter')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
