import { boards } from './data';
import type { KanbanBoardSummary } from '~/types/kanban';

export default defineEventHandler((): KanbanBoardSummary[] => {
  return boards.map(({ id, name }) => ({ id, name }));
});
