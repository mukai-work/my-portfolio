import type { Grid9 } from './types';
import { isMoveValid } from './validator';

export type Technique =
  | 'naked-single'
  | 'hidden-single'
  | 'locked'
  | 'naked-pair'
  | 'hidden-pair'
  | 'x-wing'
  | 'xy-wing'
  | 'swordfish';

export interface AnalysisResult {
  status: 'solved' | 'stuck';
  rating: number;
}

function candidates(grid: Grid9, r: number, c: number): number[] {
  const cand: number[] = [];
  for (let n = 1; n <= 9; n++) {
    if (isMoveValid(grid, r, c, n)) cand.push(n);
  }
  return cand;
}

export function analyzeHuman(grid: Grid9, allowed: Technique[]): AnalysisResult {
  const board: Grid9 = grid.map((row) => [...row]);
  let rating = 0;
  while (true) {
    let progress = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== 0) continue;
        const cand = candidates(board, r, c);
        if (cand.length === 1 && allowed.includes('naked-single')) {
          board[r][c] = cand[0];
          rating += 1;
          progress = true;
        }
      }
    }
    if (progress) continue;
    // hidden single
    if (allowed.includes('hidden-single')) {
      for (let unit = 0; unit < 27 && !progress; unit++) {
        const cells: { r: number; c: number }[] = [];
        if (unit < 9) {
          for (let c = 0; c < 9; c++) cells.push({ r: unit, c });
        } else if (unit < 18) {
          for (let r = 0; r < 9; r++) cells.push({ r, c: unit - 9 });
        } else {
          const sr = Math.floor((unit - 18) / 3) * 3;
          const sc = ((unit - 18) % 3) * 3;
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) cells.push({ r: sr + i, c: sc + j });
          }
        }
        const counts: number[][] = Array.from({ length: 10 }, () => []);
        for (const { r, c } of cells) {
          if (board[r][c] !== 0) continue;
          for (const n of candidates(board, r, c)) counts[n].push(r * 9 + c);
        }
        for (let n = 1; n <= 9; n++) {
          if (counts[n].length === 1) {
            const pos = counts[n][0];
            const r = Math.floor(pos / 9);
            const c = pos % 9;
            board[r][c] = n;
            rating += 1;
            progress = true;
            break;
          }
        }
      }
      if (progress) continue;
    }
    break;
  }
  const solved = board.every((row) => row.every((v) => v !== 0));
  return { status: solved ? 'solved' : 'stuck', rating };
}

export function allowedSet(diff: string): Technique[] {
  switch (diff) {
    case 'easy':
      return ['naked-single', 'hidden-single'];
    case 'normal':
      return ['naked-single', 'hidden-single', 'locked', 'naked-pair'];
    case 'hard':
      return ['naked-single', 'hidden-single', 'locked', 'naked-pair', 'hidden-pair', 'x-wing'];
    case 'expert':
      return ['naked-single', 'hidden-single', 'locked', 'naked-pair', 'hidden-pair', 'x-wing', 'xy-wing'];
    case 'oni':
      return [
        'naked-single',
        'hidden-single',
        'locked',
        'naked-pair',
        'hidden-pair',
        'x-wing',
        'xy-wing',
        'swordfish',
      ];
    default:
      return ['naked-single', 'hidden-single'];
  }
}
