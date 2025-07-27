import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  getAllUsers as getAllUsersFromDB, 

} from '../models/user.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database file in the project root
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Initialize database
export const db = new Database(dbPath);

// Initialize database tables
export const initializeDatabase = () => {
  // Create users table
  const createUsersTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  createUsersTable.run();
  
  console.log('Database initialized successfully');
};

// Close database connection
export const closeDatabase = () => {
  db.close();
};

export default db; 