import { createRNG, makeSeed, shuffle, randomInt } from './random';
import { countSolutions } from './solver-count';
import { analyzeHuman, allowedSet } from './solver-human';
import type { Difficulty, Grid9, Puzzle } from './types';

function emptyGrid(): Grid9 {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

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

function fillBoard(board: Grid9, rng: () => number, pos = 0): boolean {
  if (pos === 81) return true;
  const r = Math.floor(pos / 9);
  const c = pos % 9;
  if (board[r][c] !== 0) return fillBoard(board, rng, pos + 1);
  const nums = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (const n of nums) {
    if (isValid(board, r, c, n)) {
      board[r][c] = n;
      if (fillBoard(board, rng, pos + 1)) return true;
      board[r][c] = 0;
    }
  }
  return false;
}

function removeNumbers(board: Grid9, rng: () => number, clues: number): Grid9 {
  const puzzle: Grid9 = board.map((row) => [...row]);
  const positions = shuffle(rng, Array.from({ length: 81 }, (_, i) => i));
  for (const pos of positions) {
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSolutions(puzzle, 2) !== 'unique') {
      puzzle[r][c] = backup;
    }
    const filled = puzzle.flat().filter((v) => v !== 0).length;
    if (filled <= clues) break;
  }
  return puzzle;
}

async function loadBank(diff: Difficulty): Promise<Puzzle> {
  const mod = await import(`../data/bank/${diff}.json`);
  const list: Grid9[] = mod.default;
  const seed = 'bank';
  const grid = list[randomInt(createRNG(makeSeed()), list.length)];
  const givens = grid.map((row) => row.map((v) => v !== 0));
  return { grid, givens, seed, difficulty: diff, rating: 0 };
}

const clueTargets: Record<Difficulty, number> = {
  easy: 40,
  normal: 35,
  hard: 30,
  expert: 25,
  oni: 22,
};

export async function generatePuzzle(diff: Difficulty): Promise<Puzzle> {
  const start = Date.now();
  const seed = makeSeed();
  const rng = createRNG(seed);
  const board = emptyGrid();
  fillBoard(board, rng);
  const clues = clueTargets[diff];
  const puzzle = removeNumbers(board, rng, clues);
  const analysis = analyzeHuman(puzzle, allowedSet(diff));
  if (analysis.status !== 'solved' || Date.now() - start > 2500) {
    return await loadBank(diff);
  }
  const givens = puzzle.map((row) => row.map((v) => v !== 0));
  return { grid: puzzle, givens, seed, difficulty: diff, rating: analysis.rating };
}
