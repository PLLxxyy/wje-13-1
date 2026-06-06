import type { CellType, GemColor, Match, MatchType, Position } from '@/types/game';

const COLORS: GemColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];

export function randomGem(): GemColor {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function createBoard(size: number = 8, stoneCount: number = 0): CellType[][] {
  const board: CellType[][] = [];
  for (let r = 0; r < size; r++) {
    const row: CellType[] = [];
    for (let c = 0; c < size; c++) {
      row.push(randomGem());
    }
    board.push(row);
  }

  // Clear initial matches and refill
  while (true) {
    const matches = findMatches(board);
    if (matches.length === 0) break;
    for (const m of matches) {
      for (const p of m.positions) {
        board[p.row][p.col] = randomGem();
      }
    }
  }

  // Place stones
  let placed = 0;
  while (placed < stoneCount) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    if (board[r][c] !== 'stone') {
      board[r][c] = 'stone';
      placed++;
    }
  }

  return board;
}

export function findMatches(board: CellType[][]): Match[] {
  const size = board.length;
  const matched = new Set<string>();
  const matches: Match[] = [];

  // Horizontal
  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) {
      const color = board[r][c];
      if (!color || color === 'stone') {
        c++;
        continue;
      }
      let count = 1;
      while (c + count < size && board[r][c + count] === color) {
        count++;
      }
      if (count >= 3) {
        const positions: Position[] = [];
        for (let i = 0; i < count; i++) positions.push({ row: r, col: c + i });
        for (const p of positions) matched.add(`${p.row},${p.col}`);
        const type: MatchType = count >= 5 ? 'bomb' : count >= 4 ? 'line' : 'normal';
        matches.push({ positions, type, color });
      }
      c += count;
    }
  }

  // Vertical
  for (let c = 0; c < size; c++) {
    let r = 0;
    while (r < size) {
      const color = board[r][c];
      if (!color || color === 'stone') {
        r++;
        continue;
      }
      let count = 1;
      while (r + count < size && board[r + count][c] === color) {
        count++;
      }
      if (count >= 3) {
        const positions: Position[] = [];
        for (let i = 0; i < count; i++) positions.push({ row: r + i, col: c });
        const keySet = new Set<string>();
        for (const p of positions) keySet.add(`${p.row},${p.col}`);
        const type: MatchType = count >= 5 ? 'bomb' : count >= 4 ? 'line' : 'normal';
        // Merge with existing if overlapping
        let merged = false;
        for (const m of matches) {
          for (const p of m.positions) {
            if (keySet.has(`${p.row},${p.col}`)) {
              // merge
              const existingSet = new Set(m.positions.map((pp) => `${pp.row},${pp.col}`));
              for (const np of positions) {
                if (!existingSet.has(`${np.row},${np.col}`)) {
                  m.positions.push(np);
                  existingSet.add(`${np.row},${np.col}`);
                }
              }
              if (m.type !== 'bomb' && type === 'bomb') m.type = 'bomb';
              else if (m.type === 'normal' && type === 'line') m.type = 'line';
              merged = true;
              break;
            }
          }
          if (merged) break;
        }
        if (!merged) {
          matches.push({ positions, type, color });
        }
      }
      r += count;
    }
  }

  return matches;
}

export function applyMatches(board: CellType[][], matches: Match[]): CellType[][] {
  const newBoard = board.map((row) => [...row]);
  const toRemove = new Set<string>();

  for (const match of matches) {
    if (match.type === 'bomb') {
      // Bomb: remove 3x3 around center
      const center = match.positions[Math.floor(match.positions.length / 2)];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = center.row + dr;
          const nc = center.col + dc;
          if (nr >= 0 && nr < newBoard.length && nc >= 0 && nc < newBoard.length) {
            toRemove.add(`${nr},${nc}`);
          }
        }
      }
    } else if (match.type === 'line') {
      // Line: remove whole row and column of center
      const center = match.positions[Math.floor(match.positions.length / 2)];
      for (let i = 0; i < newBoard.length; i++) {
        toRemove.add(`${center.row},${i}`);
        toRemove.add(`${i},${center.col}`);
      }
    } else {
      for (const p of match.positions) {
        toRemove.add(`${p.row},${p.col}`);
      }
    }
  }

  for (const key of toRemove) {
    const [r, c] = key.split(',').map(Number);
    if (newBoard[r][c] !== 'stone') {
      newBoard[r][c] = null;
    }
  }

  return newBoard;
}

export function dropGems(board: CellType[][]): CellType[][] {
  const size = board.length;
  const newBoard = board.map((row) => [...row]);

  for (let c = 0; c < size; c++) {
    let writeRow = size - 1;
    for (let r = size - 1; r >= 0; r--) {
      if (newBoard[r][c] !== null) {
        const temp = newBoard[writeRow][c];
        newBoard[writeRow][c] = newBoard[r][c];
        newBoard[r][c] = temp;
        writeRow--;
      }
    }
    for (let r = writeRow; r >= 0; r--) {
      newBoard[r][c] = randomGem();
    }
  }

  return newBoard;
}

export function swapCells(board: CellType[][], a: Position, b: Position): CellType[][] {
  const newBoard = board.map((row) => [...row]);
  const temp = newBoard[a.row][a.col];
  newBoard[a.row][a.col] = newBoard[b.row][b.col];
  newBoard[b.row][b.col] = temp;
  return newBoard;
}

export function areAdjacent(a: Position, b: Position): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

export function calcMatchScore(matches: Match[], combo: number): number {
  let score = 0;
  for (const m of matches) {
    const base = m.positions.length * 10;
    const multiplier = m.type === 'bomb' ? 3 : m.type === 'line' ? 2 : 1;
    score += base * multiplier;
  }
  return score * (1 + combo * 0.5);
}

export function hasPossibleMoves(board: CellType[][]): boolean {
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 'stone') continue;
      const neighbors = [
        { row: r + 1, col: c },
        { row: r, col: c + 1 },
      ];
      for (const n of neighbors) {
        if (n.row >= size || n.col >= size) continue;
        if (board[n.row][n.col] === 'stone') continue;
        const swapped = swapCells(board, { row: r, col: c }, n);
        const matches = findMatches(swapped);
        if (matches.length > 0) return true;
      }
    }
  }
  return false;
}
