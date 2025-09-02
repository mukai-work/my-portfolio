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
    <h1 class="text-2xl mb-4">ポケカ在庫管理ツール</h1>
    <div class="flex items-center gap-4 mb-2">
      <NuxtLink to="/cards/new" class="text-blue-600 underline">カード登録</NuxtLink>
      <input v-model="q" placeholder="名前で検索" class="border p-1 flex-1" />
    </div>
    <p class="mb-2">総数: {{ totalQuantity }} / 総額: {{ totalValue }}</p>
    <table class="w-full mt-2 border-collapse">
      <thead>
        <tr>
          <th class="border p-2">名前</th>
          <th class="border p-2">セット</th>
          <th class="border p-2">レアリティ</th>
          <th class="border p-2">枚数</th>
          <th class="border p-2">価格</th>
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
            <NuxtLink :to="`/cards/${card.id}`" class="text-blue-600 mr-2">編集</NuxtLink>
            <button class="text-red-600" @click="remove(card.id)">削除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

