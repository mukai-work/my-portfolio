import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countSolutions } from '../core/solver-count.js';

const solved = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

test('unique solution returns unique', () => {
  assert.equal(countSolutions(solved), 'unique');
});

test('no solution returns none', () => {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  grid[0][0] = 1;
  grid[0][1] = 1; // duplicate to make puzzle unsolvable
  assert.equal(countSolutions(grid), 'none');
});
