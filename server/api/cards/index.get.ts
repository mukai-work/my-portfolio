import db from '~/server/db';
import type { Card } from '~/types/card';

export default defineEventHandler(() => {
  const stmt = db.prepare<Card>('SELECT * FROM cards ORDER BY id DESC');
  return stmt.all();
});
