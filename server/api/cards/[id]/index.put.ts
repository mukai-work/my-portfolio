import db from '~/server/db';
import type { CardPayload } from '~/types/card';

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params!.id);
  const body = await readBody<CardPayload>(event);
  const stmt = db.prepare(
    'UPDATE cards SET name = ?, setName = ?, rarity = ?, quantity = ?, price = ? WHERE id = ?'
  );
  stmt.run(
    body.name,
    body.setName ?? null,
    body.rarity ?? null,
    body.quantity,
    body.price,
    id
  );
  return { success: true };
});
