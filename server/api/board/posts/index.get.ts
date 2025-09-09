import { listPosts } from '~/server/boardDb'
import type { Post } from '~/types/board'

export default defineEventHandler((): Post[] => {
  return listPosts()
})
