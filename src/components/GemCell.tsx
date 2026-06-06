import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CellType, Position, PowerUpType } from '@/types/game';
import { isPowerUp } from '@/utils/gameLogic';
import { Hammer, Sparkles, Shuffle, Plus } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const colorMap: Record<string, string> = {
  red: 'bg-match-red shadow-[0_0_12px_rgba(239,68,68,0.6)]',
  blue: 'bg-match-blue shadow-[0_0_12px_rgba(59,130,246,0.6)]',
  green: 'bg-match-green shadow-[0_0_12px_rgba(34,197,94,0.6)]',
  yellow: 'bg-match-yellow shadow-[0_0_12px_rgba(234,179,8,0.6)]',
  purple: 'bg-match-purple shadow-[0_0_12px_rgba(168,85,247,0.6)]',
  stone: 'bg-match-stone border-2 border-stone-500',
};

const powerUpStyleMap: Record<PowerUpType, string> = {
  hammer: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]',
  rainbow: 'bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 shadow-[0_0_12px_rgba(236,72,153,0.6)]',
  shuffle: 'bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.6)]',
  extra_moves: 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]',
};

const powerUpIconMap: Record<PowerUpType, typeof Hammer> = {
  hammer: Hammer,
  rainbow: Sparkles,
  shuffle: Shuffle,
  extra_moves: Plus,
};

interface GemCellProps {
  cell: CellType;
  position: Position;
  selected: boolean;
  onClick: (pos: Position) => void;
}

export default function GemCell({ cell, position, selected, onClick }: GemCellProps) {
  const isPU = isPowerUp(cell);
  const Icon = isPU ? powerUpIconMap[cell as PowerUpType] : null;

  return (
    <button
      onClick={() => onClick(position)}
      className={cn(
        'w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center',
        cell && !isPU && colorMap[cell],
        isPU && powerUpStyleMap[cell as PowerUpType],
        !cell && 'bg-transparent',
        selected && 'ring-4 ring-white scale-110 z-10',
        cell === 'stone' && 'cursor-default'
      )}
      disabled={cell === 'stone'}
    >
      {cell && cell !== 'stone' && !isPU && (
        <div className="w-4 h-4 rounded-full bg-white/30" />
      )}
      {isPU && Icon && (
        <Icon size={20} className="text-white" />
      )}
    </button>
  );
}
