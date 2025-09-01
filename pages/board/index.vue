<template>
  <div class="flex h-screen bg-[#36393f] text-gray-200">
    <aside class="w-60 bg-[#2f3136] p-4 flex flex-col">
      <h2 class="text-xl font-semibold mb-4">掲示板</h2>
      <ul class="space-y-1 flex-1 overflow-y-auto">
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
      <NuxtLink
        to="/board/new"
        class="mt-4 px-2 py-1 text-center bg-[#5865F2] text-white rounded hover:bg-[#4752C4]"
      >
        新規投稿
      </NuxtLink>
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
            v-for="c in comments"
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
import { ref, onMounted } from 'vue'
import type { Post, Comment } from '~/types/board'

const posts = ref<Post[]>([])
const comments = ref<Comment[]>([])
const activePost = ref<Post | null>(null)
const newComment = ref('')


const posts = ref<Post[]>([])
const comments = ref<Comment[]>([])
const activePost = ref<Post | null>(null)
const newComment = ref('')

async function fetchPosts() {
  posts.value = await $fetch<Post[]>('/api/board/posts')
}

async function selectPost(post: Post) {
  activePost.value = post
  comments.value = await $fetch<Comment[]>(`/api/board/posts/${post.id}/comments`)
}

async function addComment() {
  if (!activePost.value || !newComment.value.trim()) return
  const postId = activePost.value.id
  await $fetch(`/api/board/posts/${postId}/comments`, {
    method: 'POST',
    body: { body: newComment.value }
  })
  comments.value = await $fetch<Comment[]>(`/api/board/posts/${postId}/comments`)
  newComment.value = ''
}

onMounted(fetchPosts)
</script>

<style scoped>
</style>
