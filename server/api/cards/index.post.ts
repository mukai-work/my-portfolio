import db from '~/server/db';
import type { CardPayload } from '~/types/card';

export default defineEventHandler(async (event) => {
  const body = await readBody<CardPayload>(event);
  const id = db.insert(body);
  return { id };
});
