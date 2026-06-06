export type GemColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export type PowerUpType = 'hammer' | 'rainbow' | 'shuffle' | 'extra_moves';

export type CellType = GemColor | 'stone' | PowerUpType | null;

export interface Position {
  row: number;
  col: number;
}

export type MatchType = 'normal' | 'line' | 'bomb';

export interface Match {
  positions: Position[];
  type: MatchType;
  color: GemColor;
}

export interface PowerUpInventory {
  hammer: number;
  rainbow: number;
  shuffle: number;
  extra_moves: number;
}

export interface GameState {
  board: CellType[][];
  score: number;
  movesLeft: number;
  targetScore: number;
  level: number;
  selectedCell: Position | null;
  isAnimating: boolean;
  gameStatus: 'playing' | 'won' | 'lost';
  combo: number;
  powerUps: PowerUpInventory;
  activePowerUp: PowerUpType | null;
}
