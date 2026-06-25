import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Champion } from '../types/champion';
import { ChampionCard, CardButton } from './ChampionCard';
import { NO_BAN_ICON_URL } from '../lib/ddragon';
import { t } from '../lib/i18n';

interface ChampionGridProps {
  champions: Champion[];
  usedIds: Set<string>;
  canPick: boolean;
  showNoBan: boolean;
  canSkipBan: boolean;
  onSelect: (ddragonId: string) => void;
  onSkipBan: () => void;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function ChampionGrid({
  champions,
  usedIds,
  canPick,
  showNoBan,
  canSkipBan,
  onSelect,
  onSkipBan,
}: ChampionGridProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (q === '') return champions;
    return champions.filter((c) => normalize(c.name).includes(q));
  }, [champions, query]);

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-8 pb-3 flex justify-end">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full rounded-lg border border-gold/40 bg-black/30 py-2 pl-9 pr-3 text-sm text-gold placeholder:text-gold/40 outline-none transition-colors focus:border-gold/80"
          />
        </div>
      </div>

      <div className="overflow-auto flex-1 min-h-0 scroll-gold">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-x-6 gap-y-2 w-full px-8 py-2">
          {showNoBan && (
            <CardButton
              imageUrl={NO_BAN_ICON_URL}
              label={t('ban.skip')}
              disabled={!canSkipBan}
              onClick={onSkipBan}
            />
          )}
          {filtered.map((c) => (
            <ChampionCard
              key={c.id}
              champion={c}
              disabled={!canPick || usedIds.has(c.ddragonId)}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
