<template>
  <div class="p-4">
    <h1 class="text-2xl mb-4">Boards</h1>
    <form @submit.prevent="createBoard" class="mb-4 flex gap-2">
      <input
        v-model="name"
        placeholder="New board name"
        class="border p-1 flex-1"
      />
      <button type="submit" class="bg-blue-500 text-white px-3 py-1 rounded">
        Create
      </button>
    </form>
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
import { ref } from 'vue';
import type { KanbanBoardSummary, KanbanBoard } from '~/types/kanban';

const { data: boards } = await useFetch<KanbanBoardSummary[]>('/api/boards');
const name = ref('');

const createBoard = async () => {
  if (!name.value) return;
  const board = await $fetch<KanbanBoard>('/api/boards', {
    method: 'POST',
    body: { name: name.value },
  });
  name.value = '';
  await navigateTo(`/boards/${board.id}`);
};
</script>
