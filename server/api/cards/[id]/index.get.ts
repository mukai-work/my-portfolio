import db from '~/server/db';

export default defineEventHandler((event) => {
  const id = Number(event.context.params!.id);
  const card = db.get(id);
  if (!card) {
    throw createError({ statusCode: 404, statusMessage: 'Card not found' });
  }
  return card;
});
