import db from '~/server/db';

export default defineEventHandler(async (event) => {
  const postId = Number(event.context.params!.id);
  const body = await readBody<{ body: string }>(event);
  const stmt = db.prepare('INSERT INTO comments (postId, body) VALUES (?, ?)');
  const info = stmt.run(postId, body.body);
  return { id: Number(info.lastInsertRowid) };
});
