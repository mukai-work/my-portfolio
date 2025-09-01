import db from '~/server/db';

export default defineEventHandler((event) => {
  const id = Number(event.context.params!.id);
  const stmt = db.prepare('DELETE FROM cards WHERE id = ?');
  stmt.run(id);
  return { success: true };
});
