import db from '~/server/db';
import type { Comment } from '~/types/board';

export default defineEventHandler((event) => {
  const postId = Number(event.context.params!.id);
  const stmt = db.prepare<Comment>('SELECT * FROM comments WHERE postId = ? ORDER BY id');
  return stmt.all(postId);
});
