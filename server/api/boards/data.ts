import type { KanbanBoard } from '~/types/kanban';

export const boards: KanbanBoard[] = [
  {
    id: 'demo',
    name: 'Demo Board',
    columns: [
      {
        id: 'todo',
        name: 'To Do',
        cards: [
          { id: 'task1', title: 'Set up project' },
          { id: 'task2', title: 'Write documentation' },
        ],
      },
      {
        id: 'doing',
        name: 'Doing',
        cards: [
          { id: 'task3', title: 'Implement Kanban board' },
        ],
      },
      {
        id: 'done',
        name: 'Done',
        cards: [
          { id: 'task4', title: 'Initial commit' },
        ],
      },
    ],
  },
];
