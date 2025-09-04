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
        <ul @dragover.prevent @drop.prevent="onDrop(column.id)">
          <li
            v-for="card in column.cards"
            :key="card.id"
            class="bg-white p-2 mb-2 rounded shadow"
            draggable="true"
            @dragstart="onDragStart(column.id, card.id, $event)"
          >
            {{ card.title }}
          </li>
        </ul>
        <form @submit.prevent="addCard(column.id)" class="mt-2 flex gap-2">
          <input
            v-model="newCardTitle[column.id]"
            placeholder="New task"
            class="border p-1 flex-1"
          />
          <button
            type="submit"
            class="bg-green-500 text-white px-2 py-1 rounded"
          >
            Add
          </button>
        </form>
      </div>
      <div class="w-64">
        <form
          @submit.prevent="addColumn"
          class="bg-gray-100 p-2 rounded flex flex-col gap-2"
        >
          <input
            v-model="newColumnName"
            placeholder="New column name"
            class="border p-1"
          />
          <button
            type="submit"
            class="bg-blue-500 text-white px-2 py-1 rounded"
          >
            Add column
          </button>
        </form>
      </div>
    </div>
  </div>
  <div v-else class="p-4">Loading...</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { KanbanBoard } from '~/types/kanban';

const route = useRoute();
const { data: board } = await useFetch<KanbanBoard>(`/api/boards/${route.params.id}`);

const dragging = ref<{ columnId: string; cardId: string } | null>(null);
const newCardTitle = ref<Record<string, string>>({});
const newColumnName = ref('');

const updateBoard = async () => {
  if (!board.value) return;
  await $fetch(`/api/boards/${board.value.id}`, {
    method: 'PUT',
    body: board.value,
  });
};

const onDragStart = (columnId: string, cardId: string, event: DragEvent) => {
  dragging.value = { columnId, cardId };
  event.dataTransfer?.setData('text/plain', cardId);
};

const onDrop = (targetColumnId: string) => {
  if (!dragging.value || !board.value) return;
  const { columnId, cardId } = dragging.value;
  const fromCol = board.value.columns.find(c => c.id === columnId);
  const toCol = board.value.columns.find(c => c.id === targetColumnId);
  if (!fromCol || !toCol) return;
  const idx = fromCol.cards.findIndex(c => c.id === cardId);
  if (idx === -1) return;
  const [card] = fromCol.cards.splice(idx, 1);
  toCol.cards.push(card);
  dragging.value = null;
  updateBoard();
};

const addCard = (columnId: string) => {
  if (!board.value) return;
  const title = newCardTitle.value[columnId]?.trim();
  if (!title) return;
  const column = board.value.columns.find(c => c.id === columnId);
  if (!column) return;
  column.cards.push({ id: Math.random().toString(36).slice(2, 9), title });
  newCardTitle.value[column.id] = '';
  updateBoard();
};

const addColumn = () => {
  if (!board.value) return;
  const name = newColumnName.value.trim();
  if (!name) return;
  board.value.columns.push({
    id: Math.random().toString(36).slice(2, 9),
    name,
    cards: [],
  });
  newColumnName.value = '';
  updateBoard();
};

let es: EventSource | null = null;
onMounted(() => {
  es = new EventSource(`/api/boards/${route.params.id}/stream`);
  es.onmessage = (e) => {
    board.value = JSON.parse(e.data);
  };
});

onBeforeUnmount(() => {
  es?.close();
});
</script>
