import { insertComment } from '~/server/boardDb'

export default defineEventHandler(async (event) => {
  const postId = Number(event.context.params!.id)
  const body = await readBody<{ body: string }>(event)
  const id = insertComment(postId, body.body)
  return { id }
})
