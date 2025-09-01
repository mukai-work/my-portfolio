import db from '~/server/db';
import type { CardPayload } from '~/types/card';

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params!.id);
  const body = await readBody<CardPayload>(event);
  const ok = db.update(id, body);
  if (!ok) {
    throw createError({ statusCode: 404, statusMessage: 'Card not found' });
  }
  return { success: true };
});
