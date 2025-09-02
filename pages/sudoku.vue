<template>
  <div class="p-4">
    <div class="flex flex-wrap gap-2 items-center mb-4">
      <select v-model="difficulty" class="border p-1">
        <option value="easy">やさしい</option>
        <option value="normal">ふつう</option>
        <option value="hard">むずかしい</option>
        <option value="expert">エキスパート</option>
        <option value="oni">鬼</option>
      </select>
      <button class="border p-1" @click="newPuzzle">新規作成</button>
      <label class="flex items-center gap-1">
        <input type="checkbox" v-model="showErrors" /> エラーハイライト
      </label>
      <button class="border p-1" @click="toggleTheme">テーマ切替</button>
      <div class="ml-auto text-sm flex items-center gap-1">
        Seed: {{ seed }}
        <button class="border px-1" @click="copySeed">コピー</button>
      </div>
    </div>
    <SudokuBoard
      ref="board"
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
const board = ref<InstanceType<typeof SudokuBoard> | null>(null);

function onNew(p: Puzzle) {
  seed.value = p.seed;
}

function newPuzzle() {
  board.value?.newGame();
}

function toggleTheme() {
  const root = document.documentElement;
  root.classList.toggle('dark');
}

async function copySeed() {
  await navigator.clipboard.writeText(seed.value);
}
</script>
