<template>
  <main id="content">
    <section class="hero section">
      <div class="container">
        <div class="text-center">
          <h1 class="h1 reveal">Kengo Mukai</h1>
          <p class="lead mt-4 reveal">NuxtとTypeScriptで心地よいWeb体験を。</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="grid grid--3">
          <NuxtLink
            to="/board"
            class="card card--hover p-6 flex justify-between items-center reveal"
          >
            <div>
              <h2 class="text-xl font-semibold">掲示板</h2>
              <p class="text-sm text-gray-500 mt-1">コミュニティで意見交換</p>
            </div>
            <span aria-hidden="true" class="text-2xl">→</span>
          </NuxtLink>

          <NuxtLink
            to="/projects/weathermood"
            class="card card--hover p-6 flex justify-between items-center reveal"
          >
            <div>
              <h2 class="text-xl font-semibold">WeatherMood</h2>
              <p class="text-sm text-gray-500 mt-1">天気×気分UIで魅せるTypeScript作品</p>
            </div>
            <span aria-hidden="true" class="text-2xl">→</span>
          </NuxtLink>

          <NuxtLink
            to="/projects/pokemon"
            class="card card--hover p-6 flex justify-between items-center reveal"
          >
            <div>
              <h2 class="text-xl font-semibold">ポケカ在庫管理</h2>
              <p class="text-sm text-gray-500 mt-1">SQLite×TSでローカル管理アプリ</p>
            </div>
            <span aria-hidden="true" class="text-2xl">→</span>
          </NuxtLink>

          <LinkCard
            to="/boards"
            title="リアルタイムカンバン"
            summary="共同編集できるToDoボード"
            class="reveal"
          />

          <LinkCard
            to="/pomodoro"
            title="ポモドーロタイマー"
            summary="25分作業 / 5分休憩、セット自動進行"
            class="reveal"
          />
          <LinkCard
            to="/sudoku"
            title="ナンプレ"
            summary="9x9数独ゲーム"
            class="reveal"
          />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="max-w-xl mx-auto card p-6">
          <h2 class="h2 text-center">お問い合わせ</h2>
          <form @submit.prevent="submit" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium mb-1">名前</label>
              <input id="name" v-model="form.name" type="text" class="input" required />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium mb-1">メールアドレス</label>
              <input id="email" v-model="form.email" type="email" class="input" required />
            </div>
            <div>
              <label for="message" class="block text-sm font-medium mb-1">メッセージ</label>
              <textarea id="message" v-model="form.message" class="input" rows="4" required></textarea>
            </div>
            <!-- Honeypot field for bots -->
            <input v-model="form.botField" type="text" class="hidden" tabindex="-1" autocomplete="off" />
            <div class="text-center">
              <button type="submit" class="btn btn--primary" :disabled="sent">
                送信
              </button>
            </div>
            <p v-if="sent" class="text-green-600 text-center mt-2">送信しました！</p>
          </form>
        </div>
      </div>
    </section>
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
