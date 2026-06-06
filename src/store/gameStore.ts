import { create } from 'zustand';
import type { CellType, GameState, Match, Position, PowerUpType } from '@/types/game';
import {
  applyMatches,
  applyPowerUpDrop,
  calcMatchScore,
  createBoard,
  dropGems,
  findMatches,
  hasPossibleMoves,
  isPowerUp,
  swapCells,
  useHammer,
  useRainbow,
  useShuffle,
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
  setActivePowerUp: (type: PowerUpType | null) => void;
  usePowerUp: (pos?: Position) => void;
  collectPowerUp: (type: PowerUpType) => void;
}

const INITIAL_MOVES = 20;
const INITIAL_TARGET = 500;

const INITIAL_POWER_UPS = {
  hammer: 0,
  rainbow: 0,
  shuffle: 0,
  extra_moves: 0,
};

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
  powerUps: INITIAL_POWER_UPS,
  activePowerUp: null,

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
      powerUps: INITIAL_POWER_UPS,
      activePowerUp: null,
    });
  },

  nextLevel: () => {
    const state = get();
    const level = state.level + 1;
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
      activePowerUp: null,
    });
  },

  selectCell: (pos) => {
    const state = get();
    if (state.isAnimating || state.gameStatus !== 'playing') return;
    if (state.board[pos.row][pos.col] === 'stone') return;

    const cell = state.board[pos.row][pos.col];
    if (isPowerUp(cell)) {
      state.collectPowerUp(cell);
      const newBoard = state.board.map((row) => [...row]);
      newBoard[pos.row][pos.col] = null;
      set({ board: newBoard });
      return;
    }

    if (state.activePowerUp) {
      state.usePowerUp(pos);
      return;
    }

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
    const clearedBoard = applyMatches(state.board, matches);
    const newBoard = applyPowerUpDrop(clearedBoard, matches);
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

  setActivePowerUp: (type) => {
    const state = get();
    if (type === null) {
      set({ activePowerUp: null, selectedCell: null });
      return;
    }
    if (state.powerUps[type] > 0) {
      set({ activePowerUp: type, selectedCell: null });
    }
  },

  usePowerUp: (pos) => {
    const state = get();
    const type = state.activePowerUp;
    if (!type || state.powerUps[type] <= 0) return;

    let newBoard = state.board;
    const newPowerUps = { ...state.powerUps };

    if (type === 'hammer' && pos) {
      newBoard = useHammer(state.board, pos);
      newPowerUps.hammer--;
    } else if (type === 'rainbow') {
      newBoard = useRainbow(state.board);
      newPowerUps.rainbow--;
    } else if (type === 'shuffle') {
      newBoard = useShuffle(state.board);
      newPowerUps.shuffle--;
    } else if (type === 'extra_moves') {
      newPowerUps.extra_moves--;
      set({
        powerUps: newPowerUps,
        activePowerUp: null,
        movesLeft: state.movesLeft + 5,
      });
      return;
    } else {
      return;
    }

    set({
      board: newBoard,
      powerUps: newPowerUps,
      activePowerUp: null,
      selectedCell: null,
    });
  },

  collectPowerUp: (type) => {
    const state = get();
    const newPowerUps = { ...state.powerUps };
    newPowerUps[type]++;
    set({ powerUps: newPowerUps });
  },
}));
