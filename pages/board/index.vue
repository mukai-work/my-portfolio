<template>
  <div class="flex h-screen bg-[#36393f] text-gray-200">
    <aside class="w-60 bg-[#2f3136] p-4 space-y-2">
      <h2 class="text-xl font-semibold mb-4">掲示板</h2>
      <ul class="space-y-1">
        <li
          v-for="post in posts"
          :key="post.id"
          @click="selectPost(post)"
          :class="[
            'px-2 py-1 rounded cursor-pointer hover:bg-[#42464d]',
            post.id === activePost?.id ? 'bg-[#5865F2] text-white' : 'text-gray-300'
          ]"
        >
          # {{ post.title }}
        </li>
      </ul>
    </aside>
    <main class="flex-1 flex flex-col bg-[#36393f]">
      <header class="h-12 px-4 flex items-center shadow">
        <div class="flex-1">
          <h3 v-if="activePost" class="font-bold text-lg"># {{ activePost.title }}</h3>
          <p v-else class="text-gray-400">投稿を選択してください</p>
        </div>
        <nav class="flex space-x-4 text-sm text-blue-400">
          <NuxtLink to="/signup" class="hover:underline">会員登録</NuxtLink>
          <NuxtLink to="/login" class="hover:underline">ログイン</NuxtLink>
          <NuxtLink to="/mypage" class="hover:underline">マイページ</NuxtLink>
        </nav>
      </header>
      <section class="flex-1 overflow-y-auto p-4 space-y-4">
        <ul v-if="activePost" class="space-y-4">
          <li
            v-for="c in comments[activePost.id]"
            :key="c.id"
            class="flex items-start space-x-2"
          >
            <div class="w-8 h-8 rounded-full bg-gray-500"></div>
            <p class="text-sm">{{ c.body }}</p>
          </li>
        </ul>
        <p v-else class="text-gray-400">左の投稿から選択してください</p>
      </section>
      <form
        v-if="activePost"
        @submit.prevent="addComment"
        class="p-4 bg-[#40444b] flex space-x-2"
      >
        <input
          v-model="newComment"
          class="flex-1 bg-[#202225] text-gray-200 p-2 rounded focus:outline-none"
          placeholder="コメントを入力"
        />
        <button type="submit" class="px-4 py-2 bg-[#5865F2] text-white rounded">
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
