import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { goToNewRoom, joinRoom } from '../lib/room';
import { t } from '../lib/i18n';

export function Home() {
  const [code, setCode] = useState('');

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-10">
      <h1 className="text-6xl font-bold tracking-tight">{t('home.title')}</h1>

      <div className="flex flex-col gap-4 w-72">
        <Button onClick={goToNewRoom} size="lg" className="w-full">
          {t('home.create')}
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          {t('home.or')}
          <div className="h-px flex-1 bg-border" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            joinRoom(code);
          }}
          className="flex gap-2"
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('home.codePlaceholder')}
          />
          <Button type="submit" variant="outline" disabled={code.trim() === ''}>
            {t('home.join')}
          </Button>
        </form>
      </div>
    </div>
  );
}
