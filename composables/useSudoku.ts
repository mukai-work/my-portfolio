import { ref, computed } from 'vue';

export interface Cell {
  value: number | null;
  given: boolean;
}

export const useSudoku = () => {
  const grid = ref<Cell[][]>([]);
  const solution = ref<number[][]>([]);
  const selected = ref<{ r: number; c: number } | null>(null);

  function newGame() {
    const { puzzle, solution: sol } = generateSudoku();
    grid.value = puzzle.map((row) =>
      row.map((v) => ({ value: v === 0 ? null : v, given: v !== 0 }))
    );
    solution.value = sol;
    selected.value = null;
  }

  function select(r: number, c: number) {
    selected.value = { r, c };
  }

  function setValue(n: number) {
    if (!selected.value) return;
    const cell = grid.value[selected.value.r][selected.value.c];
    if (cell.given) return;
    cell.value = n;
  }

  function clear() {
    if (!selected.value) return;
    const cell = grid.value[selected.value.r][selected.value.c];
    if (cell.given) return;
    cell.value = null;
  }

  const isSolved = computed(() =>
    grid.value.length > 0 &&
    grid.value.every((row, r) =>
      row.every((cell, c) => cell.value === solution.value[r][c])
    )
  );

  return { grid, selected, select, setValue, clear, newGame, isSolved };
};

function generateSudoku(): { puzzle: number[][]; solution: number[][] } {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(board);
  const solution = board.map((row) => [...row]);
  const puzzle = removeNumbers(board);
  return { puzzle, solution };
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function fillBoard(board: number[][], pos = 0): boolean {
  if (pos === 81) return true;
  const r = Math.floor(pos / 9);
  const c = pos % 9;
  if (board[r][c] !== 0) return fillBoard(board, pos + 1);
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (const n of nums) {
    if (isSafe(board, r, c, n)) {
      board[r][c] = n;
      if (fillBoard(board, pos + 1)) return true;
      board[r][c] = 0;
    }
  }
  return false;
}

function isSafe(board: number[][], r: number, c: number, n: number): boolean {
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

function solve(board: number[][], pos = 0, count = 0): number {
  if (count > 1) return count;
  if (pos === 81) return count + 1;
  const r = Math.floor(pos / 9);
  const c = pos % 9;
  if (board[r][c] !== 0) return solve(board, pos + 1, count);
  for (let n = 1; n <= 9 && count < 2; n++) {
    if (isSafe(board, r, c, n)) {
      board[r][c] = n;
      count = solve(board, pos + 1, count);
    }
  }
  board[r][c] = 0;
  return count;
}

function removeNumbers(board: number[][]) {
  const puzzle = board.map((row) => [...row]);
  const positions = shuffle(Array.from({ length: 81 }, (_, i) => i));
  for (const pos of positions) {
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    const copy = puzzle.map((row) => [...row]);
    if (solve(copy) !== 1) {
      puzzle[r][c] = backup;
    }
  }
  return puzzle;
}
