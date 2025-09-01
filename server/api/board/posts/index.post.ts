import db from '~/server/db';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ title: string; body?: string }>(event);
  const postStmt = db.prepare('INSERT INTO posts (title) VALUES (?)');
  const info = postStmt.run(body.title);
  if (body.body && body.body.trim()) {
    const commentStmt = db.prepare('INSERT INTO comments (postId, body) VALUES (?, ?)');
    commentStmt.run(info.lastInsertRowid, body.body);
  }
  return { id: Number(info.lastInsertRowid) };
});
