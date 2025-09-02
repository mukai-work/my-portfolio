export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert' | 'oni';
export type Grid9 = number[][]; // 9x9 grid, 0 for empty
export interface Puzzle {
  grid: Grid9;
  givens: boolean[][];
  seed: string;
  difficulty: Difficulty;
  rating: number;
}
