<script setup lang="ts">
import type { Card } from '~/types/card';

const q = ref('');
const { data: cards, refresh } = await useFetch<Card[]>('/api/cards', { query: { q } });
const totalQuantity = computed(() => cards.value?.reduce((sum, c) => sum + c.quantity, 0) ?? 0);
const totalValue = computed(() => cards.value?.reduce((sum, c) => sum + c.quantity * c.price, 0) ?? 0);

async function remove(id: number) {
  await $fetch(`/api/cards/${id}`, { method: 'DELETE' });
  await refresh();
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl mb-4">Card Inventory</h1>
    <div class="flex items-center gap-4 mb-2">
      <NuxtLink to="/cards/new" class="text-blue-600 underline">Register Card</NuxtLink>
      <input v-model="q" placeholder="Search by name" class="border p-1 flex-1" />
    </div>
    <p class="mb-2">Total Cards: {{ totalQuantity }} / Total Value: {{ totalValue }}</p>
    <table class="w-full mt-2 border-collapse">
      <thead>
        <tr>
          <th class="border p-2">Name</th>
          <th class="border p-2">Set</th>
          <th class="border p-2">Rarity</th>
          <th class="border p-2">Quantity</th>
          <th class="border p-2">Price</th>
          <th class="border p-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="card in cards" :key="card.id">
          <td class="border p-2">{{ card.name }}</td>
          <td class="border p-2">{{ card.setName }}</td>
          <td class="border p-2">{{ card.rarity }}</td>
          <td class="border p-2">{{ card.quantity }}</td>
          <td class="border p-2">{{ card.price }}</td>
          <td class="border p-2">
            <NuxtLink :to="`/cards/${card.id}`" class="text-blue-600 mr-2">Edit</NuxtLink>
            <button class="text-red-600" @click="remove(card.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
