import { create } from 'zustand';
import type { CellType, GameState, Match, Position } from '@/types/game';
import {
  applyMatches,
  calcMatchScore,
  createBoard,
  dropGems,
  findMatches,
  hasPossibleMoves,
  swapCells,
} from '@/utils/gameLogic';

interface GameActions {
  initGame: () => void;
  nextLevel: () => void;
  selectCell: (pos: Position) => void;
  checkMatches: () => Match[];
  applyMatchScore: (matches: Match[], combo: number) => void;
  dropGems: () => void;
  setAnimating: (val: boolean) => void;
  setCombo: (val: number) => void;
  setGameStatus: (status: 'playing' | 'won' | 'lost') => void;
  resetGame: () => void;
}

const INITIAL_MOVES = 20;
const INITIAL_TARGET = 500;

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  board: [],
  score: 0,
  movesLeft: INITIAL_MOVES,
  targetScore: INITIAL_TARGET,
  level: 1,
  selectedCell: null,
  isAnimating: false,
  gameStatus: 'playing',
  combo: 0,

  initGame: () => {
    const board = createBoard(8, 0);
    set({
      board,
      score: 0,
      movesLeft: INITIAL_MOVES,
      targetScore: INITIAL_TARGET,
      level: 1,
      selectedCell: null,
      isAnimating: false,
      gameStatus: 'playing',
      combo: 0,
    });
  },

  nextLevel: () => {
    const level = get().level + 1;
    const stoneCount = Math.min(level * 2, 12);
    const targetScore = INITIAL_TARGET + (level - 1) * 300;
    const board = createBoard(8, stoneCount);
    set({
      board,
      movesLeft: INITIAL_MOVES,
      targetScore,
      level,
      selectedCell: null,
      isAnimating: false,
      gameStatus: 'playing',
      combo: 0,
    });
  },

  selectCell: (pos) => {
    const state = get();
    if (state.isAnimating || state.gameStatus !== 'playing') return;
    if (state.board[pos.row][pos.col] === 'stone') return;

    if (!state.selectedCell) {
      set({ selectedCell: pos });
      return;
    }

    const a = state.selectedCell;
    const b = pos;

    if (a.row === b.row && a.col === b.col) {
      set({ selectedCell: null });
      return;
    }

    const isAdjacent = Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
    if (!isAdjacent) {
      set({ selectedCell: pos });
      return;
    }

    // Try swap
    const swapped = swapCells(state.board, a, b);
    const matches = findMatches(swapped);

    if (matches.length === 0) {
      // Invalid move, just change selection
      set({ selectedCell: pos });
      return;
    }

    // Valid move
    const movesLeft = state.movesLeft - 1;
    set({ board: swapped, selectedCell: null, movesLeft });

    // Defer match processing to hook
  },

  checkMatches: () => {
    return findMatches(get().board);
  },

  applyMatchScore: (matches, combo) => {
    const state = get();
    const score = state.score + calcMatchScore(matches, combo);
    const newBoard = applyMatches(state.board, matches);
    const won = score >= state.targetScore;
    set({ score, board: newBoard, combo });
    if (won && state.gameStatus !== 'won') {
      set({ gameStatus: 'won' });
    }
  },

  dropGems: () => {
    const newBoard = dropGems(get().board);
    set({ board: newBoard });
  },

  setAnimating: (val) => set({ isAnimating: val }),
  setCombo: (val) => set({ combo: val }),
  setGameStatus: (status: 'playing' | 'won' | 'lost') => set({ gameStatus: status }),

  resetGame: () => {
    get().initGame();
  },
}));
