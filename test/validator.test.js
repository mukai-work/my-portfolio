import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findConflicts, isMoveValid } from '../core/validator.js';

test('findConflicts detects duplicates', () => {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  grid[0][0] = 1;
  grid[0][1] = 1;
  const conf = findConflicts(grid);
  assert.equal(conf[0][0], true);
  assert.equal(conf[0][1], true);
});

test('isMoveValid rejects duplicates', () => {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  grid[0][0] = 1;
  assert.equal(isMoveValid(grid, 0, 1, 1), false);
  assert.equal(isMoveValid(grid, 1, 0, 1), false);
});
