<script setup lang="ts">
import type { CardPayload } from '~/types/card';

const form = reactive<CardPayload>({
  name: '',
  setName: '',
  rarity: '',
  quantity: 0,
  price: 0
});

async function submit() {
  await $fetch('/api/cards', { method: 'POST', body: form });
  await navigateTo('/cards');
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl mb-4">Register Card</h1>
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
