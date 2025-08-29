<template>
  <main class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h1 class="text-2xl font-bold mb-4">お問い合わせ</h1>
      <form @submit.prevent="submit">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">名前</label>
          <input v-model="form.name" type="text" class="w-full border rounded p-2" required />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">メールアドレス</label>
          <input v-model="form.email" type="email" class="w-full border rounded p-2" required />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">メッセージ</label>
          <textarea v-model="form.message" class="w-full border rounded p-2" rows="4" required></textarea>
        </div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded" :disabled="sent">
          送信
        </button>
        <p v-if="sent" class="text-green-600 mt-2">送信しました！</p>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { ContactMessage } from '~/types/contact';

const form = reactive<ContactMessage>({ name: '', email: '', message: '' });
const sent = ref(false);

const submit = async () => {
  await $fetch('/api/contact', { method: 'POST', body: form });
  sent.value = true;
};
</script>
