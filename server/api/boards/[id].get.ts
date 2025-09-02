import { boards } from './data';
import { createError } from 'h3';

export default defineEventHandler(event => {
  const id = event.context.params?.id as string;
  const board = boards.find(b => b.id === id);
  if (!board) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' });
  }
  return board;
});
