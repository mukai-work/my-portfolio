<template>
  <main class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-orange-600">Kengo Mukai</h1>
        <p class="text-gray-700 mt-2">NuxtとTypeScriptで心地よいWeb体験を。</p>
      </div>

      <div class="mt-10 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          to="/board"
          class="bg-white border-t-4 border-orange-400 shadow-md p-6 rounded-xl hover:bg-orange-50 hover:-translate-y-1 hover:shadow-xl transition-transform transform flex justify-between items-center"
        >
          <div>
            <h2 class="text-xl font-semibold">掲示板</h2>
            <p class="text-sm text-gray-500 mt-1">コミュニティで意見交換</p>
          </div>
          <span aria-hidden="true" class="text-orange-400 text-2xl">→</span>
        </NuxtLink>

        <NuxtLink
          to="/projects/weathermood"
          class="bg-white border-t-4 border-orange-400 shadow-md p-6 rounded-xl hover:bg-orange-50 hover:-translate-y-1 hover:shadow-xl transition-transform transform flex justify-between items-center"
        >
          <div>
            <h2 class="text-xl font-semibold">WeatherMood</h2>
            <p class="text-sm text-gray-500 mt-1">天気×気分UIで魅せるTypeScript作品</p>
          </div>
          <span aria-hidden="true" class="text-orange-400 text-2xl">→</span>
        </NuxtLink>

        <NuxtLink
          to="/projects/pokemon"
          class="bg-white border-t-4 border-orange-400 shadow-md p-6 rounded-xl hover:bg-orange-50 hover:-translate-y-1 hover:shadow-xl transition-transform transform flex justify-between items-center"
        >
          <div>
            <h2 class="text-xl font-semibold">ポケカ在庫管理</h2>
            <p class="text-sm text-gray-500 mt-1">SQLite×TSでローカル管理アプリ</p>
          </div>
          <span aria-hidden="true" class="text-orange-400 text-2xl">→</span>
        </NuxtLink>

        <LinkCard
          to="/boards"
          title="リアルタイムカンバン"
          summary="共同編集できるToDoボード"
        />

        <LinkCard
          to="/pomodoro"
          title="ポモドーロタイマー"
          summary="25分作業 / 5分休憩、セット自動進行"
        />

        <LinkCard
          to="/sudoku"
          title="ナンプレ"
          summary="9x9数独ゲーム"
        />
      </div>

      <div class="mt-12 max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md border-t-4 border-orange-400">
        <h2 class="text-2xl font-bold mb-4 text-center text-orange-600">お問い合わせ</h2>
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
          <!-- Honeypot field for bots -->
          <input v-model="form.botField" type="text" class="hidden" tabindex="-1" autocomplete="off" />
          <div class="text-center">
            <button type="submit" class="bg-orange-500 text-white px-4 py-2 rounded" :disabled="sent">
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

const config = useRuntimeConfig();
useHead({
  script: [
    { src: `https://www.google.com/recaptcha/api.js?render=${config.public.recaptchaSiteKey}`, defer: true },
  ],
});

const form = reactive<ContactMessage>({ name: '', email: '', message: '', botField: '' });
const sent = ref(false);

const submit = async () => {
  const token = await (window as any).grecaptcha.execute(config.public.recaptchaSiteKey, { action: 'submit' });
  await $fetch('/api/contact', { method: 'POST', body: { ...form, token } });
  sent.value = true;
};
</script>
