import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CellType, Position } from '@/types/game';

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

interface GemCellProps {
  cell: CellType;
  position: Position;
  selected: boolean;
  onClick: (pos: Position) => void;
}

export default function GemCell({ cell, position, selected, onClick }: GemCellProps) {
  return (
    <button
      onClick={() => onClick(position)}
      className={cn(
        'w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center',
        cell ? colorMap[cell] : 'bg-transparent',
        selected && 'ring-4 ring-white scale-110 z-10',
        cell === 'stone' && 'cursor-default'
      )}
      disabled={cell === 'stone'}
    >
      {cell && cell !== 'stone' && (
        <div className="w-4 h-4 rounded-full bg-white/30" />
      )}
    </button>
  );
}
