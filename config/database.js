import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
// Database configuration - no imports needed from user model

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database file in the project root
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Initialize database
export const db = new Database(dbPath);

// Initialize database tables
export const initializeDatabase = () => {
  // Create roles table
  const createRolesTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      permissions TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  createRolesTable.run();
  
  // Create users table with role_id
  const createUsersTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role_id INTEGER DEFAULT 2,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE SET DEFAULT
    )
  `);
  
  createUsersTable.run();
  
  // Create events table
  const createEventsTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date DATETIME NOT NULL,
      address TEXT NOT NULL,
      organizer_id INTEGER NOT NULL,
      is_approved BOOLEAN DEFAULT 0,
      approved_by INTEGER,
      approved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizer_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
    )
  `);
  
  createEventsTable.run();
  
  // Insert default roles if they don't exist
  const insertDefaultRoles = db.prepare(`
    INSERT OR IGNORE INTO roles (id, name, description, permissions) VALUES 
    (1, 'admin', 'Administrator with full access', 'all'),
    (2, 'user', 'Regular user with limited access', 'read_own_events,create_own_events,update_own_events,delete_own_events'),
    (3, 'moderator', 'Moderator with approval and management access', 'read_all_events,approve_events,delete_any_event,update_any_event')
  `);
  
  insertDefaultRoles.run();
  
  console.log('Database initialized successfully with role-based authorization');
};

// Close database connection
export const closeDatabase = () => {
  db.close();
};

export default db; 