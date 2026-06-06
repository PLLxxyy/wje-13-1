import { useCallback, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

export function useGameLoop() {
  const processingRef = useRef(false);
  const store = useGameStore();

  const processMatches = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    store.setAnimating(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    let combo = 0;
    while (true) {
      const matches = store.checkMatches();
      if (matches.length === 0) break;
      combo++;
      store.applyMatchScore(matches, combo);
      await new Promise((resolve) => setTimeout(resolve, 300));
      store.dropGems();
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    store.setCombo(0);
    store.setAnimating(false);
    processingRef.current = false;
  }, [store]);

  return { processMatches };
}
