<template>
  <div class="min-h-screen p-4 flex flex-col items-center justify-center gap-4">
    <div class="flex flex-wrap gap-2 items-center justify-center">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="d in difficulties"
          :key="d.value"
          class="px-2 py-1 border border-[var(--border)] rounded"
          :class="d.value === difficulty ? 'bg-blue-500 text-white dark:bg-blue-600' : 'bg-[var(--surface)]'"
          @click="difficulty = d.value"
        >
          {{ d.label }}
        </button>
      </div>
      <label class="flex items-center gap-1">
        <input type="checkbox" v-model="showErrors" /> エラーハイライト
      </label>
      <button class="border border-[var(--border)] p-1 bg-[var(--surface)]" @click="toggleTheme">テーマ切替</button>
      <div class="text-sm flex items-center gap-1">
        Seed: {{ seed }}
        <button class="border border-[var(--border)] px-1 bg-[var(--surface)]" @click="copySeed">コピー</button>
      </div>
    </div>
    <SudokuBoard
      :difficulty="difficulty"
      :show-errors="showErrors"
      @new="onNew"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SudokuBoard from '~/components/SudokuBoard.vue';
import type { Difficulty, Puzzle } from '~/core/types';

const difficulty = ref<Difficulty>('easy');
const showErrors = ref(true);
const seed = ref('');
const difficulties = [
  { value: 'easy', label: 'やさしい' },
  { value: 'normal', label: 'ふつう' },
  { value: 'hard', label: 'むずかしい' },
  { value: 'expert', label: 'エキスパート' },
  { value: 'oni', label: '鬼' },
];

function onNew(p: Puzzle) {
  seed.value = p.seed;
}

function toggleTheme() {
  const root = document.documentElement;
  const theme = root.getAttribute('data-theme');
  root.setAttribute('data-theme', theme === 'dark' ? 'light' : 'dark');
}

async function copySeed() {
  await navigator.clipboard.writeText(seed.value);
}
</script>
