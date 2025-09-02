import { boards } from './data';
import type { KanbanBoard } from '~/types/kanban';
import { kanbanEmitter } from '~/server/kanbanEvents';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string }>(event);
  const id = Math.random().toString(36).slice(2, 9);
  const newBoard: KanbanBoard = {
    id,
    name: body.name,
    columns: [
      { id: 'todo', name: 'To Do', cards: [] },
      { id: 'doing', name: 'Doing', cards: [] },
      { id: 'done', name: 'Done', cards: [] },
    ],
  };
  boards.push(newBoard);
  kanbanEmitter.emit('update', newBoard);
  return newBoard;
});
