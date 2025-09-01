<script setup lang="ts">
import type { Card } from '~/types/card';

const { data: cards, refresh } = await useFetch<Card[]>('/api/cards');

async function remove(id: number) {
  await $fetch(`/api/cards/${id}`, { method: 'DELETE' });
  await refresh();
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl mb-4">Card Inventory</h1>
    <NuxtLink to="/cards/new" class="text-blue-600 underline">Register Card</NuxtLink>
    <table class="w-full mt-4 border-collapse">
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
