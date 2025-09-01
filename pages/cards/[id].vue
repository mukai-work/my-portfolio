<script setup lang="ts">
import type { Card, CardPayload } from '~/types/card';

const route = useRoute();
const id = Number(route.params.id);
const { data } = await useFetch<Card>(`/api/cards/${id}`);

const form = reactive<CardPayload>({
  name: data.value?.name || '',
  setName: data.value?.setName || '',
  rarity: data.value?.rarity || '',
  quantity: data.value?.quantity || 0,
  price: data.value?.price || 0
});

async function submit() {
  await $fetch(`/api/cards/${id}`, { method: 'PUT', body: form });
  await navigateTo('/cards');
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl mb-4">Edit Card</h1>
    <form @submit.prevent="submit" class="space-y-2">
      <div>
        <label class="block">Name</label>
        <input v-model="form.name" class="border p-1 w-full" required />
      </div>
      <div>
        <label class="block">Set</label>
        <input v-model="form.setName" class="border p-1 w-full" />
      </div>
      <div>
        <label class="block">Rarity</label>
        <input v-model="form.rarity" class="border p-1 w-full" />
      </div>
      <div>
        <label class="block">Quantity</label>
        <input type="number" v-model.number="form.quantity" class="border p-1 w-full" />
      </div>
      <div>
        <label class="block">Price</label>
        <input type="number" step="0.01" v-model.number="form.price" class="border p-1 w-full" />
      </div>
      <button type="submit" class="bg-blue-600 text-white px-4 py-1">Save</button>
    </form>
  </div>
</template>
