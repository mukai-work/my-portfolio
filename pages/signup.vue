<template>
  <div class="max-w-md mx-auto p-8">
    <h1 class="text-2xl font-bold text-center mb-4">会員登録</h1>
    <form @submit.prevent="submit">
      <input
        v-model="name"
        type="text"
        placeholder="名前"
        class="border rounded w-full p-2 mb-2"
      />
      <input
        v-model="email"
        type="email"
        placeholder="メールアドレス"
        class="border rounded w-full p-2 mb-2"
      />
      <input
        v-model="password"
        type="password"
        placeholder="パスワード"
        class="border rounded w-full p-2 mb-4"
      />
      <button type="submit" class="w-full px-4 py-2 bg-blue-500 text-white rounded">
        登録
      </button>
    </form>
    <p v-if="message" class="mt-4 text-green-600">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const name = ref('');
const email = ref('');
const password = ref('');
const message = ref('');

async function submit() {
  try {
    await $fetch('/api/signup', {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value }
    });
    message.value = '登録が完了しました。';
    name.value = '';
    email.value = '';
    password.value = '';
  } catch (error) {
    message.value = '登録に失敗しました。';
  }
}
</script>

<style scoped>
</style>
