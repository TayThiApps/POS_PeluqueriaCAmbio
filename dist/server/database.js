import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import path from 'path';
// Create database connection
const dataDir = process.env.DATA_DIRECTORY || './data';
const dbPath = path.join(dataDir, 'database.sqlite');
console.log('Database path:', dbPath);
const sqliteDb = new Database(dbPath);
// Enable foreign keys
sqliteDb.pragma('foreign_keys = ON');
export const db = new Kysely({
    dialect: new SqliteDialect({
        database: sqliteDb,
    }),
    log: ['query', 'error']
});
