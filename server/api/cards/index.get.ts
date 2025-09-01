import db from '~/server/db';

export default defineEventHandler(() => {
  return db.list();
});
