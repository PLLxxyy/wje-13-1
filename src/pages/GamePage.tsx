import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import GameBoard from '@/components/GameBoard';
import GameHeader from '@/components/GameHeader';
import GameOverlay from '@/components/GameOverlay';

export default function GamePage() {
  const initGame = useGameStore((s) => s.initGame);
  const movesLeft = useGameStore((s) => s.movesLeft);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const setGameStatus = useGameStore((s) => s.setGameStatus);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (movesLeft <= 0 && gameStatus === 'playing') {
      setGameStatus('lost');
    }
  }, [movesLeft, gameStatus, setGameStatus]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-grid-pattern">
      <h1 className="text-3xl font-pixel text-white mb-6 text-shadow-glow tracking-wider">
        消消乐
      </h1>
      <GameHeader />
      <div className="relative">
        <GameBoard />
        <GameOverlay />
      </div>
      <p className="mt-4 text-white/40 text-xs">
        点击相邻方块交换位置，三个以上同色连成一线即可消除
      </p>
    </div>
  );
}
