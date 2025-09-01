<template>
  <div class="max-w-md mx-auto p-8">
    <h1 class="text-2xl font-bold text-center mb-6">ログイン</h1>
    <form @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <input
          v-model="email"
          type="email"
          placeholder="メールアドレス"
          class="border rounded w-full p-2"
        />
      </div>
      <div>
        <input
          v-model="password"
          type="password"
          placeholder="パスワード"
          class="border rounded w-full p-2"
        />
      </div>
      <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
      <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded">
        ログイン
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LoginResponse } from '~/types/auth'

const email = ref('')
const password = ref('')
const error = ref('')

async function onSubmit() {
  try {
    const data = await $fetch<LoginResponse>('/api/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    const token = useCookie('token')
    token.value = data.token
    await navigateTo('/board')
  } catch (e) {
    error.value = 'メールアドレスまたはパスワードが正しくありません。'
  }
}
</script>

<style scoped></style>
