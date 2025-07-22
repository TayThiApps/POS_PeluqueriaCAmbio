import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import path from 'path';

// Database schema types
export interface DatabaseSchema {
  clients: {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    created_at: string;
  };
  transactions: {
    id: number;
    client_id: number;
    amount: number;
    net_amount: number | null;
    vat_rate: number | null;
    vat_amount: number | null;
    description: string | null;
    transaction_date: string;
    created_at: string;
  };
}

// Create database connection
const dataDir = process.env.DATA_DIRECTORY || './data';
const dbPath = path.join(dataDir, 'database.sqlite');

console.log('Database path:', dbPath);

const sqliteDb = new Database(dbPath);

// Enable foreign keys
sqliteDb.pragma('foreign_keys = ON');

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error']
});
