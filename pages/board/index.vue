<template>
  <div class="flex h-screen">
    <aside class="w-1/4 bg-gray-800 text-white p-4">
      <h2 class="text-lg font-bold mb-4">掲示板</h2>
      <ul>
        <li
          v-for="post in posts"
          :key="post.id"
          @click="selectPost(post)"
          :class="[ 'p-2 rounded cursor-pointer hover:bg-gray-700', post.id === activePost?.id ? 'bg-gray-700' : '' ]"
        >
          {{ post.title }}
        </li>
      </ul>
    </aside>
    <main class="flex-1 p-4">
      <div class="flex justify-end space-x-4 mb-4">
        <NuxtLink to="/signup" class="text-blue-500 underline">会員登録</NuxtLink>
        <NuxtLink to="/login" class="text-blue-500 underline">ログイン</NuxtLink>
        <NuxtLink to="/mypage" class="text-blue-500 underline">マイページ</NuxtLink>
      </div>
      <div v-if="activePost">
        <h3 class="text-xl font-bold mb-2">{{ activePost.title }}</h3>
        <ul class="space-y-2 mb-4">
          <li
            v-for="c in comments[activePost.id]"
            :key="c.id"
            class="p-2 bg-gray-100 rounded"
          >
            <p class="text-sm text-gray-700">{{ c.body }}</p>
          </li>
        </ul>
        <form @submit.prevent="addComment">
          <input
            v-model="newComment"
            class="border rounded w-full p-2 mb-2"
            placeholder="コメントを入力"
          />
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">
            投稿
          </button>
        </form>
      </div>
      <div v-else class="text-gray-500">投稿を選択してください</div>
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
