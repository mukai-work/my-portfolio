import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { Card, CardPayload } from '~/types/card';

const dbFile = join(process.cwd(), 'cards.json');

function readCards(): Card[] {
  if (!existsSync(dbFile)) {
    return [];
  }
  try {
    const data = readFileSync(dbFile, 'utf-8');
    return JSON.parse(data) as Card[];
  } catch {
    return [];
  }
}

function writeCards(cards: Card[]) {
  writeFileSync(dbFile, JSON.stringify(cards, null, 2));
}

function nextId(cards: Card[]): number {
  return cards.length ? Math.max(...cards.map(c => c.id)) + 1 : 1;
}

function list(): Card[] {
  return readCards().sort((a, b) => b.id - a.id);
}

function get(id: number): Card | undefined {
  return readCards().find(c => c.id === id);
}

function insert(payload: CardPayload): number {
  const cards = readCards();
  const id = nextId(cards);
  const card: Card = { id, ...payload };
  cards.push(card);
  writeCards(cards);
  return id;
}

function update(id: number, payload: CardPayload): boolean {
  const cards = readCards();
  const index = cards.findIndex(c => c.id === id);
  if (index === -1) {
    return false;
  }
  cards[index] = { id, ...payload };
  writeCards(cards);
  return true;
}

function remove(id: number): boolean {
  const cards = readCards();
  const index = cards.findIndex(c => c.id === id);
  if (index === -1) {
    return false;
  }
  cards.splice(index, 1);
  writeCards(cards);
  return true;
}

export default { list, get, insert, update, remove };
