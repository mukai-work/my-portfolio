import { listComments } from '~/server/boardDb'
import type { Comment } from '~/types/board'

export default defineEventHandler((event): Comment[] => {
  const postId = Number(event.context.params!.id)
  return listComments(postId)
})
