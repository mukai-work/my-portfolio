import type { Grid9 } from './types';

export type ConflictGrid = boolean[][]; // true where conflict exists

export function emptyConflictGrid(): ConflictGrid {
  return Array.from({ length: 9 }, () => Array(9).fill(false));
}

export function findConflicts(grid: Grid9): ConflictGrid {
  const conflicts = emptyConflictGrid();
  const rows = Array.from({ length: 9 }, () => Array(10).fill(-1));
  const cols = Array.from({ length: 9 }, () => Array(10).fill(-1));
  const boxes = Array.from({ length: 9 }, () => Array(10).fill(-1));
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (v === 0) continue;
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if (rows[r][v] !== -1) {
        conflicts[r][c] = conflicts[r][rows[r][v]] = true;
      } else rows[r][v] = c;
      if (cols[c][v] !== -1) {
        conflicts[r][c] = conflicts[cols[c][v]][c] = true;
      } else cols[c][v] = r;
      if (boxes[b][v] !== -1) {
        const pr = Math.floor(boxes[b][v] / 9);
        const pc = boxes[b][v] % 9;
        conflicts[r][c] = conflicts[pr][pc] = true;
      } else boxes[b][v] = r * 9 + c;
    }
  }
  return conflicts;
}

export function isMoveValid(grid: Grid9, r: number, c: number, n: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[r][i] === n || grid[i][c] === n) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[br + i][bc + j] === n) return false;
    }
  }
  return true;
}
