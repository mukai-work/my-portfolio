<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { Puzzle, Difficulty, Grid9 } from '~/core/types';
import { generatePuzzle } from '~/core/generator';
import { findConflicts, isMoveValid } from '~/core/validator';

const props = defineProps<{ difficulty: Difficulty; showErrors: boolean }>();
const emit = defineEmits<{ (e: 'new', puzzle: Puzzle): void }>();

function emptyGrid(): Grid9 {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

const puzzle = ref<Puzzle | null>(null);
const grid = ref<Grid9>(emptyGrid());
const givens = ref<boolean[][]>([]);
const selected = ref<{ r: number; c: number } | null>(null);
const undoStack = ref<{ r: number; c: number; prev: number; next: number }[]>([]);
const redoStack = ref<{ r: number; c: number; prev: number; next: number }[]>([]);
const conflicts = ref(findConflicts(grid.value));

async function newGame() {
  const p = await generatePuzzle(props.difficulty);
  puzzle.value = p;
  grid.value = p.grid.map((row) => [...row]);
  givens.value = p.givens.map((row) => [...row]);
  conflicts.value = findConflicts(grid.value);
  selected.value = null;
  undoStack.value = [];
  redoStack.value = [];
  emit('new', p);
}

watch(
  () => props.difficulty,
  () => {
    newGame();
  }
);

defineExpose({ newGame });

function select(r: number, c: number) {
  selected.value = { r, c };
}

function input(n: number) {
  if (!selected.value) return;
  const { r, c } = selected.value;
  if (givens.value[r][c]) return;
  if (!isMoveValid(grid.value, r, c, n)) return;
  const prev = grid.value[r][c];
  grid.value[r][c] = n;
  undoStack.value.push({ r, c, prev, next: n });
  redoStack.value = [];
  conflicts.value = findConflicts(grid.value);
}

function erase() {
  if (!selected.value) return;
  const { r, c } = selected.value;
  if (givens.value[r][c]) return;
  const prev = grid.value[r][c];
  if (prev === 0) return;
  grid.value[r][c] = 0;
  undoStack.value.push({ r, c, prev, next: 0 });
  redoStack.value = [];
  conflicts.value = findConflicts(grid.value);
}

function undo() {
  const op = undoStack.value.pop();
  if (!op) return;
  grid.value[op.r][op.c] = op.prev;
  redoStack.value.push(op);
  conflicts.value = findConflicts(grid.value);
}

function redo() {
  const op = redoStack.value.pop();
  if (!op) return;
  grid.value[op.r][op.c] = op.next;
  undoStack.value.push(op);
  conflicts.value = findConflicts(grid.value);
}

function onKey(e: KeyboardEvent) {
  if (!selected.value) return;
  const { r, c } = selected.value;
  if (e.key >= '1' && e.key <= '9') {
    input(parseInt(e.key));
  } else if (e.key === '0' || e.key === 'Backspace') {
    erase();
  } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    selected.value = { r: (r + 8) % 9, c };
  } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    selected.value = { r: (r + 1) % 9, c };
  } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    selected.value = { r, c: (c + 8) % 9 };
  } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    selected.value = { r, c: (c + 1) % 9 };
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    undo();
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
    redo();
  }
}

onMounted(() => newGame());
</script>

<template>
  <div
    class="inline-block"
    @keydown.tab.prevent
    @keydown.capture="onKey"
    tabindex="0"
  >
    <div class="flex gap-4">
      <div
        class="relative"
        :style="{ width: 'min(92vw,560px)', height: 'min(92vw,560px)' }"
      >
        <div class="grid grid-cols-9 grid-rows-9 w-full h-full">
          <template v-for="(row, r) in grid" :key="r">
            <button
              v-for="(cell, c) in row"
              :key="c"
              @click="select(r, c)"
                :class="[
                  'flex items-center justify-center select-none text-lg bg-[var(--surface)]',
                  r === 0 ? 'border-t-2 border-t-[var(--fg)]' : '',
                  c === 0 ? 'border-l-2 border-l-[var(--fg)]' : '',
                  (r + 1) % 3 === 0
                    ? 'border-b-2 border-b-[var(--fg)]'
                    : 'border-b border-b-[var(--border)]',
                  (c + 1) % 3 === 0
                    ? 'border-r-2 border-r-[var(--fg)]'
                    : 'border-r border-r-[var(--border)]',
                  selected && Math.floor(selected.r / 3) === Math.floor(r / 3) && Math.floor(selected.c / 3) === Math.floor(c / 3)
                    ? 'bg-blue-50 dark:bg-blue-900'
                    : '',
                  selected?.r === r && selected?.c === c
                    ? 'bg-blue-200 dark:bg-blue-700'
                    : '',
                  givens[r][c] ? 'font-bold' : '',
                  props.showErrors && conflicts[r][c] ? 'bg-red-200 dark:bg-red-700' : '',
                  selected && grid[selected.r][selected.c] !== 0 && grid[selected.r][selected.c] === cell
                    ? 'bg-blue-100 dark:bg-blue-700'
                    : '',
                ]"
              >
                {{ cell || '' }}
              </button>
            </template>
        </div>
      </div>
      <div class="flex flex-col items-center gap-4">
        <div class="flex flex-col gap-2">
          <button class="p-2 bg-[var(--surface)] border border-[var(--border)] rounded w-12 h-12" @click="erase">消</button>
          <button class="p-2 bg-[var(--surface)] border border-[var(--border)] rounded w-12 h-12" @click="undo">戻す</button>
          <button class="p-2 bg-[var(--surface)] border border-[var(--border)] rounded w-12 h-12" @click="redo">やり直し</button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="n in 9"
            :key="n"
            class="p-2 bg-[var(--surface)] border border-[var(--border)] rounded w-12 h-12 flex items-center justify-center"
            @click="input(n)"
          >
            {{ n }}
          </button>
        </div>
        <button class="p-2 bg-blue-500 dark:bg-blue-600 text-white border border-[var(--border)] rounded w-full" @click="newGame">新規ゲーム</button>
      </div>
    </div>
  </div>
</template>

