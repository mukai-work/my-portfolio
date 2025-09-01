import db from '~/server/db';
import type { Post } from '~/types/board';

export default defineEventHandler(() => {
  const stmt = db.prepare<Post>('SELECT * FROM posts ORDER BY id DESC');
  return stmt.all();
});
