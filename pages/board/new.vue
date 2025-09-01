<template>
  <div class="h-screen bg-[#36393f] flex items-center justify-center text-gray-200">
    <form @submit.prevent="createPost" class="bg-[#2f3136] p-6 rounded space-y-4 w-full max-w-md">
      <h2 class="text-xl font-semibold">新規投稿</h2>
      <div>
        <label class="block mb-1">タイトル</label>
        <input
          v-model="title"
          required
          class="w-full p-2 rounded bg-[#202225] text-gray-200 focus:outline-none"
        />
      </div>
      <div>
        <label class="block mb-1">最初のコメント (任意)</label>
        <textarea
          v-model="body"
          class="w-full p-2 rounded bg-[#202225] text-gray-200 focus:outline-none"
        ></textarea>
      </div>
      <div class="flex justify-end space-x-2">
        <NuxtLink to="/board" class="px-4 py-2 bg-gray-500 rounded text-white">キャンセル</NuxtLink>
        <button type="submit" class="px-4 py-2 bg-[#5865F2] rounded text-white">投稿</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Post { id: number; title: string }
interface Comment { id: number; postId: number; body: string }

const posts = useState<Post[]>('posts', () => [])
const comments = useState<Record<number, Comment[]>>('comments', () => ({}))

const title = ref('')
const body = ref('')

const router = useRouter()

function createPost() {
  if (!title.value.trim()) return
  const id = Date.now()
  posts.value.push({ id, title: title.value })
  comments.value[id] = []
  if (body.value.trim()) {
    comments.value[id].push({ id: Date.now(), postId: id, body: body.value })
  }
  router.push('/board')
}
</script>

<style scoped></style>
