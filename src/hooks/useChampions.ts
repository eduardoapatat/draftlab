import { useEffect, useState } from 'react';
import { fetchChampions } from '../lib/ddragon';
import type { Champion } from '../types/champion';

export function useChampions() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchChampions()
      .then((data) => {
        if (!cancelled) setChampions(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { champions, loading, error };
}
