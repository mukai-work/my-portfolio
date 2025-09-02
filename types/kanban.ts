export interface KanbanCard {
  id: string;
  title: string;
}

export interface KanbanColumn {
  id: string;
  name: string;
  cards: KanbanCard[];
}

export interface KanbanBoard {
  id: string;
  name: string;
  columns: KanbanColumn[];
}

export type KanbanBoardSummary = Omit<KanbanBoard, 'columns'>;
