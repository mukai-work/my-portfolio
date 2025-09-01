import Database from 'better-sqlite3';
import { join } from 'path';

const dbFile = join(process.cwd(), 'cards.db');
const db = new Database(dbFile);

db.exec(`
  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    setName TEXT,
    rarity TEXT,
    quantity INTEGER DEFAULT 0,
    price REAL DEFAULT 0
  )
`);

export default db;
