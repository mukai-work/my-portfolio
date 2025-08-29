<template>
  <div class="flex h-screen text-sm">
    <aside class="w-64 bg-gray-900 text-gray-100 p-4 space-y-2">
      <h2 class="text-xl font-bold mb-4">掲示板</h2>
      <ul class="space-y-1">
        <li
          v-for="post in posts"
          :key="post.id"
          @click="selectPost(post)"
          :class="[
            'p-2 rounded cursor-pointer hover:bg-gray-800',
            post.id === activePost?.id ? 'bg-gray-800' : ''
          ]"
        >
          # {{ post.title }}
        </li>
      </ul>
    </aside>
    <main class="flex-1 bg-gray-700 text-white flex flex-col">
      <div class="flex justify-end space-x-4 p-4 border-b border-gray-600">
        <NuxtLink to="/signup" class="hover:underline">会員登録</NuxtLink>
        <NuxtLink to="/login" class="hover:underline">ログイン</NuxtLink>
        <NuxtLink to="/mypage" class="hover:underline">マイページ</NuxtLink>
      </div>
      <div v-if="activePost" class="flex-1 overflow-y-auto p-4">
        <h3 class="text-2xl font-bold mb-2">{{ activePost.title }}</h3>
        <ul class="space-y-2 mb-4">
          <li
            v-for="c in comments[activePost.id]"
            :key="c.id"
            class="bg-gray-800 p-3 rounded"
          >
            <p>{{ c.body }}</p>
          </li>
        </ul>
      </div>
      <div v-else class="flex-1 flex items-center justify-center text-gray-400">
        投稿を選択してください
      </div>
      <form
        v-if="activePost"
        @submit.prevent="addComment"
        class="p-4 border-t border-gray-600 flex"
      >
        <input
          v-model="newComment"
          class="flex-1 p-2 rounded bg-gray-800 text-white placeholder-gray-400 mr-2"
          placeholder="メッセージを入力"
        />
        <button type="submit" class="px-4 bg-blue-500 text-white rounded">
          投稿
        </button>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Post { id: number; title: string }
interface Comment { id: number; postId: number; body: string }

const posts = reactive<Post[]>([
  { id: 1, title: '最初の投稿' },
  { id: 2, title: 'Nuxt 3 について語ろう' }
])

const comments = reactive<Record<number, Comment[]>>({
  1: [{ id: 1, postId: 1, body: 'こんにちは！' }],
  2: []
})

const activePost = ref<Post | null>(null)
const newComment = ref('')

function selectPost(post: Post) {
  activePost.value = post
}

function addComment() {
  if (!activePost.value || !newComment.value.trim()) return
  const postId = activePost.value.id
  const list = comments[postId] || (comments[postId] = [])
  list.push({ id: Date.now(), postId, body: newComment.value })
  newComment.value = ''
}
</script>

<style scoped>
</style>
