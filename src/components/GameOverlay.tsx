import { useGameStore } from '@/store/gameStore';
import { Trophy, Skull, RotateCcw, ArrowRight } from 'lucide-react';

export default function GameOverlay() {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const score = useGameStore((s) => s.score);
  const level = useGameStore((s) => s.level);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const resetGame = useGameStore((s) => s.resetGame);

  if (gameStatus === 'playing') return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
      <div className="bg-match-darker border border-white/20 rounded-2xl p-8 flex flex-col items-center gap-4 max-w-xs w-full mx-4">
        {gameStatus === 'won' ? (
          <>
            <Trophy size={48} className="text-match-yellow" />
            <h2 className="text-2xl font-bold text-white">关卡通过!</h2>
            <p className="text-white/70 text-sm">得分: {Math.floor(score)}</p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <RotateCcw size={16} />
                重新开始
              </button>
              <button
                onClick={nextLevel}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-match-purple hover:bg-purple-600 text-white transition-colors"
              >
                下一关
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <Skull size={48} className="text-match-red" />
            <h2 className="text-2xl font-bold text-white">游戏结束</h2>
            <p className="text-white/70 text-sm">最终得分: {Math.floor(score)}</p>
            <p className="text-white/50 text-xs">到达关卡: {level}</p>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-match-green hover:bg-green-600 text-white transition-colors mt-2"
            >
              <RotateCcw size={16} />
              再玩一次
            </button>
          </>
        )}
      </div>
    </div>
  );
}
