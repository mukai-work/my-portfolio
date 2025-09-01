import db from '~/server/db';
import type { CardPayload } from '~/types/card';

export default defineEventHandler(async (event) => {
  const body = await readBody<CardPayload>(event);
  const stmt = db.prepare(
    'INSERT INTO cards (name, setName, rarity, quantity, price) VALUES (?, ?, ?, ?, ?)'
  );
  const info = stmt.run(
    body.name,
    body.setName ?? null,
    body.rarity ?? null,
    body.quantity,
    body.price
  );
  return { id: Number(info.lastInsertRowid) };
});
