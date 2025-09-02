<template>
  <main class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-bold text-center text-orange-600 mb-4">ナンプレ</h1>
      <div class="grid grid-cols-9 gap-0 border-2 border-gray-700">
        <div v-for="(row, r) in grid" :key="r" class="contents">
          <button
            v-for="(cell, c) in row"
            :key="c"
            @click="select(r, c)"
            :class="cellClasses(r, c, cell)"
          >
            {{ cell.value ?? '' }}
          </button>
        </div>
      </div>
      <div class="mt-4 grid grid-cols-3 gap-2">
        <div class="col-span-3 grid grid-cols-9 gap-1">
          <button
            v-for="n in 9"
            :key="n"
            class="p-2 bg-white rounded shadow"
            @click="setValue(n)"
          >
            {{ n }}
          </button>
        </div>
        <button class="p-2 bg-white rounded shadow" @click="clear">消す</button>
        <button class="p-2 bg-white rounded shadow" @click="newGame">新規</button>
        <div class="p-2 flex items-center justify-center col-span-1" :class="isSolved ? 'text-green-600 font-semibold' : 'text-gray-500'">
          {{ isSolved ? '完成！' : '' }}
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSudoku, Cell } from '~/composables/useSudoku';

const { grid, selected, select, setValue, clear, newGame, isSolved } = useSudoku();

function cellClasses(r: number, c: number, cell: Cell) {
  return [
    'w-8 h-8 border border-gray-400 flex items-center justify-center text-sm',
    cell.given ? 'bg-gray-200' : 'bg-white',
    selected.value?.r === r && selected.value?.c === c ? 'bg-yellow-200' : '',
    r % 3 === 0 ? 'border-t-2' : '',
    c % 3 === 0 ? 'border-l-2' : '',
    r === 8 ? 'border-b-2' : '',
    c === 8 ? 'border-r-2' : '',
  ];
}

onMounted(() => newGame());
</script>
