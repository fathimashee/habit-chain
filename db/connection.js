const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH 
  ? path.resolve(process.cwd(), process.env.DB_PATH) 
  : path.resolve(process.cwd(), 'db/database.sqlite');

let db;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    // Enforce foreign key constraints strictly in SQLite
    db.pragma('foreign_keys = ON');
    // High performance WAL mode
    db.pragma('journal_mode = WAL');
  }
  return db;
}

module.exports = { getDb };

