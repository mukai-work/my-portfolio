import type { Grid9 } from './types';

function isValid(board: Grid9, r: number, c: number, n: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[r][i] === n || board[i][c] === n) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[br + i][bc + j] === n) return false;
    }
  }
  return true;
}

export function countSolutions(grid: Grid9, limit = 2): 'none' | 'unique' | 'multiple' {
  const board: Grid9 = grid.map((row) => [...row]);
  let count = 0;
  const solve = (pos = 0): void => {
    if (count >= limit) return;
    if (pos === 81) {
      count++;
      return;
    }
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    if (board[r][c] !== 0) {
      solve(pos + 1);
      return;
    }
    for (let n = 1; n <= 9 && count < limit; n++) {
      if (isValid(board, r, c, n)) {
        board[r][c] = n;
        solve(pos + 1);
      }
    }
    board[r][c] = 0;
  };
  solve();
  if (count === 0) return 'none';
  if (count === 1) return 'unique';
  return 'multiple';
}
