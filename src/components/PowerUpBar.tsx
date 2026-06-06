import { useGameStore } from '@/store/gameStore';
import type { PowerUpType } from '@/types/game';
import { Hammer, Sparkles, Shuffle, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const powerUpInfo: Record<PowerUpType, { icon: typeof Hammer; name: string; description: string; style: string }> = {
  hammer: {
    icon: Hammer,
    name: '锤子',
    description: '消除任意一个格子',
    style: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]',
  },
  rainbow: {
    icon: Sparkles,
    name: '彩虹',
    description: '消除场上最多的颜色',
    style: 'bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 shadow-[0_0_12px_rgba(236,72,153,0.6)]',
  },
  shuffle: {
    icon: Shuffle,
    name: '洗牌',
    description: '重新排列所有宝石',
    style: 'bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.6)]',
  },
  extra_moves: {
    icon: Plus,
    name: '加步',
    description: '增加5步',
    style: 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]',
  },
};

const powerUpOrder: PowerUpType[] = ['hammer', 'rainbow', 'shuffle', 'extra_moves'];

export default function PowerUpBar() {
  const powerUps = useGameStore((s) => s.powerUps);
  const activePowerUp = useGameStore((s) => s.activePowerUp);
  const setActivePowerUp = useGameStore((s) => s.setActivePowerUp);
  const usePowerUp = useGameStore((s) => s.usePowerUp);
  const isAnimating = useGameStore((s) => s.isAnimating);
  const gameStatus = useGameStore((s) => s.gameStatus);

  const handleClick = (type: PowerUpType) => {
    if (isAnimating || gameStatus !== 'playing') return;
    if (powerUps[type] <= 0) return;

    if (activePowerUp === type) {
      setActivePowerUp(null);
      return;
    }

    if (type === 'rainbow' || type === 'shuffle' || type === 'extra_moves') {
      setActivePowerUp(type);
      usePowerUp();
    } else {
      setActivePowerUp(type);
    }
  };

  const totalPowerUps = Object.values(powerUps).reduce((a, b) => a + b, 0);

  return (
    <div className="mt-4 w-full max-w-md">
      <div className="text-xs text-white/60 mb-2 text-center">
        道具背包 {totalPowerUps > 0 && `(${totalPowerUps})`}
        {activePowerUp && (
          <span className="ml-2 text-match-yellow">
            {activePowerUp === 'hammer' ? '点击目标格子使用锤子' : ''}
          </span>
        )}
      </div>
      <div className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
        {powerUpOrder.map((type) => {
          const info = powerUpInfo[type];
          const count = powerUps[type];
          const isActive = activePowerUp === type;
          const Icon = info.icon;
          return (
            <button
              key={type}
              onClick={() => handleClick(type)}
              disabled={count <= 0 || isAnimating || gameStatus !== 'playing'}
              className={cn(
                'relative w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-200',
                info.style,
                count <= 0 && 'opacity-30 cursor-not-allowed grayscale',
                isActive && 'ring-4 ring-white scale-110',
                count > 0 && !isActive && 'hover:scale-105 cursor-pointer'
              )}
              title={info.description}
            >
              <Icon size={24} className="text-white" />
              <span className="absolute -top-1 -right-1 bg-white text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
