import { boards } from './data';
import type { KanbanBoard } from '~/types/kanban';
import { kanbanEmitter } from '~/server/kanbanEvents';
import { createError } from 'h3';

export default defineEventHandler(async (event) => {
  const id = event.context.params!.id as string;
  const body = await readBody<KanbanBoard>(event);
  const idx = boards.findIndex(b => b.id === id);
  if (idx === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' });
  }
  boards[idx] = body;
  kanbanEmitter.emit('update', body);
  return { success: true };
});
