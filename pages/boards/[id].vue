<template>
  <div class="p-4" v-if="board">
    <h1 class="text-2xl mb-4">{{ board.name }}</h1>
    <div class="flex gap-4 overflow-x-auto">
      <div
        v-for="column in board.columns"
        :key="column.id"
        class="w-64 bg-gray-100 p-2 rounded"
      >
        <h2 class="font-bold mb-2">{{ column.name }}</h2>
        <ul>
          <li
            v-for="card in column.cards"
            :key="card.id"
            class="bg-white p-2 mb-2 rounded shadow"
          >
            {{ card.title }}
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div v-else class="p-4">Loading...</div>
</template>

<script setup lang="ts">
import type { KanbanBoard } from '~/types/kanban';

const route = useRoute();
const { data: board } = await useFetch<KanbanBoard>(`/api/boards/${route.params.id}`);
</script>
