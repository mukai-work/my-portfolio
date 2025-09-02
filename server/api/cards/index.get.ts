import { getQuery } from 'h3';
import db from '~/server/db';

export default defineEventHandler((event) => {
  const { q } = getQuery(event);
  const cards = db.list();
  if (typeof q === 'string' && q) {
    const query = q.toLowerCase();
    return cards.filter(card => card.name.toLowerCase().includes(query));
  }
  return cards;
});
