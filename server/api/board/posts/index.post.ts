import { insertPost, insertComment } from '~/server/boardDb'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ title: string; body?: string }>(event)
  const id = insertPost(body.title)
  if (body.body && body.body.trim()) {
    insertComment(id, body.body)
  }
  return { id }
})
