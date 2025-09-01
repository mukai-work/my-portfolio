import db from '~/server/db';
import type { Card } from '~/types/card';

export default defineEventHandler((event) => {
  const id = Number(event.context.params!.id);
  const stmt = db.prepare<Card>('SELECT * FROM cards WHERE id = ?');
  return stmt.get(id);
});
