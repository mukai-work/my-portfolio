import db from '~/server/db';

export default defineEventHandler((event) => {
  const id = Number(event.context.params!.id);
  const ok = db.remove(id);
  if (!ok) {
    throw createError({ statusCode: 404, statusMessage: 'Card not found' });
  }
  return { success: true };
});
