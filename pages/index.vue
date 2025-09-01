<template>
  <main class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="text-center">
        <h1 class="text-4xl font-bold">ムカイ / Mukai</h1>
        <p class="text-gray-600 mt-2">Nuxt × TypeScript のフリーランスエンジニア</p>
      </div>

      <div class="mt-10 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          to="/board"
          class="bg-white shadow-md p-6 rounded-xl hover:-translate-y-1 hover:shadow-xl transition transform"
        >
          <h2 class="text-xl font-semibold">掲示板</h2>
          <p class="text-sm text-gray-500 mt-1">コミュニティで意見交換</p>
        </NuxtLink>

        <NuxtLink
          to="/projects/weathermood"
          class="bg-white shadow-md p-6 rounded-xl hover:-translate-y-1 hover:shadow-xl transition transform"
        >
          <h2 class="text-xl font-semibold">WeatherMood</h2>
          <p class="text-sm text-gray-500 mt-1">天気×気分UIで魅せるTypeScript作品</p>
        </NuxtLink>

        <NuxtLink
          to="/projects/pokemon"
          class="bg-white shadow-md p-6 rounded-xl hover:-translate-y-1 hover:shadow-xl transition transform"
        >
          <h2 class="text-xl font-semibold">ポケカ在庫管理</h2>
          <p class="text-sm text-gray-500 mt-1">SQLite×TSでローカル管理アプリ</p>
        </NuxtLink>
      </div>

      <div class="mt-12 max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 class="text-2xl font-bold mb-4 text-center">お問い合わせ</h2>
        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">名前</label>
            <input v-model="form.name" type="text" class="w-full border rounded p-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">メールアドレス</label>
            <input v-model="form.email" type="email" class="w-full border rounded p-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">メッセージ</label>
            <textarea v-model="form.message" class="w-full border rounded p-2" rows="4" required></textarea>
          </div>
          <div class="text-center">
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded" :disabled="sent">
              送信
            </button>
          </div>
          <p v-if="sent" class="text-green-600 text-center mt-2">送信しました！</p>
        </form>
      </div>
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
