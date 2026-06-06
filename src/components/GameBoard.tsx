import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameLoop } from '@/hooks/useGameLoop';
import GemCell from './GemCell';
import type { Position } from '@/types/game';

export default function GameBoard() {
  const board = useGameStore((s) => s.board);
  const selectedCell = useGameStore((s) => s.selectedCell);
  const selectCell = useGameStore((s) => s.selectCell);
  const isAnimating = useGameStore((s) => s.isAnimating);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const movesLeft = useGameStore((s) => s.movesLeft);
  const { processMatches } = useGameLoop();

  useEffect(() => {
    if (board.length > 0 && !isAnimating && gameStatus === 'playing') {
      processMatches();
    }
  }, [board, isAnimating, gameStatus, processMatches]);

  const handleClick = (pos: Position) => {
    if (isAnimating || gameStatus !== 'playing') return;
    selectCell(pos);
  };

  if (board.length === 0) return null;

  return (
    <div className="grid grid-cols-8 gap-1.5 p-3 bg-white/5 rounded-2xl border border-white/10">
      {board.map((row, r) =>
        row.map((cell, c) => {
          const pos = { row: r, col: c };
          const isSelected =
            selectedCell?.row === r && selectedCell?.col === c;
          return (
            <GemCell
              key={`${r}-${c}`}
              cell={cell}
              position={pos}
              selected={isSelected}
              onClick={handleClick}
            />
          );
        })
      )}
    </div>
  );
}
