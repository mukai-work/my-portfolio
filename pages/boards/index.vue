<template>
  <div class="p-4">
    <h1 class="text-2xl mb-4">Boards</h1>
    <ul>
      <li v-for="board in boards" :key="board.id">
        <NuxtLink :to="`/boards/${board.id}`" class="text-blue-600 underline">
          {{ board.name }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { KanbanBoardSummary } from '~/types/kanban';

const { data: boards } = await useFetch<KanbanBoardSummary[]>('/api/boards');
</script>
