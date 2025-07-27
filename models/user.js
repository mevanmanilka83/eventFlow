// User model with standalone functions using SQLite database
import { db } from '../config/database.js';

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if email already exists
const isEmailTaken = (email) => {
  const getUser = db.prepare(`
    SELECT id FROM users WHERE email = ?
  `);
  
  const existingUser = getUser.get(email);
  return existingUser !== undefined;
};

// Check if username already exists
const isUsernameTaken = (username) => {
  const getUser = db.prepare(`
    SELECT id FROM users WHERE username = ?
  `);
  
  const existingUser = getUser.get(username);
  return existingUser !== undefined;
};

// Validate input fields
const validateInput = (field, value, fieldName) => {
  // Check for null, undefined, or empty string
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName} cannot be empty`);
  }
  
  // Check for whitespace-only strings (spaces, tabs, newlines, etc.)
  if (value.trim() === '') {
    throw new Error(`${fieldName} cannot be just blanks or whitespace`);
  }
  
  // Check if string contains only whitespace characters
  if (/^\s+$/.test(value)) {
    throw new Error(`${fieldName} cannot be just blanks or whitespace`);
  }
  
  // Trim the value to remove leading/trailing whitespace
  return value.trim();
};

// Create a new user
export const createUser = (userData) => {
  const { username, email, password } = userData;
  
  // Validate required fields
  if (!username || !email || !password) {
    throw new Error('Username, email, and password are required');
  }
  
  // Validate and trim inputs
  const trimmedUsername = validateInput('username', username, 'Username');
  const trimmedEmail = validateInput('email', email, 'Email');
  const trimmedPassword = validateInput('password', password, 'Password');
  
  // Username validation
  if (trimmedUsername.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  
  if (trimmedUsername.length > 30) {
    throw new Error('Username must be less than 30 characters long');
  }
  
  // Email validation
  if (!isValidEmail(trimmedEmail)) {
    throw new Error('Please provide a valid email address');
  }
  
  // Check if email is already taken
  if (isEmailTaken(trimmedEmail)) {
    throw new Error('Email address is already registered');
  }
  
  // Check if username is already taken
  if (isUsernameTaken(trimmedUsername)) {
    throw new Error('Username is already taken');
  }
  
  // Password validation
  if (trimmedPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  
  if (trimmedPassword.length > 128) {
    throw new Error('Password must be less than 128 characters long');
  }
  
  try {
    // Insert new user into database
    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password)
      VALUES (?, ?, ?)
    `);
    
    const result = insertUser.run(trimmedUsername, trimmedEmail, trimmedPassword);
    
    // Get the created user
    const newUser = findUserById(result.lastInsertRowid);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
    
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('User with this email or username already exists');
    }
    throw new Error('Failed to create user');
  }
};

// Find user by email
export const findUserByEmail = (email) => {
  const getUser = db.prepare(`
    SELECT * FROM users WHERE email = ?
  `);
  
  return getUser.get(email);
};

// Find user by username
export const findUserByUsername = (username) => {
  const getUser = db.prepare(`
    SELECT * FROM users WHERE username = ?
  `);
  
  return getUser.get(username);
};

// Find user by ID
export const findUserById = (id) => {
  const getUser = db.prepare(`
    SELECT * FROM users WHERE id = ?
  `);
  
  return getUser.get(id);
};

// Get all users (without passwords)
export const getAllUsers = () => {
  const getUsers = db.prepare(`
    SELECT id, username, email, created_at, updated_at 
    FROM users
  `);
  
  return getUsers.all();
};

// Validate user credentials
export const validateUserCredentials = (email, password) => {
  // Validate email format
  if (!isValidEmail(email)) {
    return null;
  }
  
  const user = findUserByEmail(email);
  if (!user) {
    return null;
  }
  
  if (user.password !== password) {
    return null;
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Update user
export const updateUser = (id, userData) => {
  const { username, email } = userData;
  
  // Validate and trim inputs
  const trimmedUsername = validateInput('username', username, 'Username');
  const trimmedEmail = validateInput('email', email, 'Email');
  
  // Username validation
  if (trimmedUsername.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  
  if (trimmedUsername.length > 30) {
    throw new Error('Username must be less than 30 characters long');
  }
  
  // Email validation
  if (!isValidEmail(trimmedEmail)) {
    throw new Error('Please provide a valid email address');
  }
  
  // Check if email is already taken by another user
  const existingUserWithEmail = findUserByEmail(trimmedEmail);
  if (existingUserWithEmail && existingUserWithEmail.id !== parseInt(id)) {
    throw new Error('Email address is already registered by another user');
  }
  
  // Check if username is already taken by another user
  const existingUserWithUsername = findUserByUsername(trimmedUsername);
  if (existingUserWithUsername && existingUserWithUsername.id !== parseInt(id)) {
    throw new Error('Username is already taken by another user');
  }
  
  try {
    const updateUser = db.prepare(`
      UPDATE users 
      SET username = ?, email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = updateUser.run(trimmedUsername, trimmedEmail, id);
    
    if (result.changes === 0) {
      throw new Error('User not found');
    }
    
    return findUserById(id);
    
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('User with this email or username already exists');
    }
    throw error;
  }
};

// Delete user
export const deleteUser = (id) => {
  const deleteUser = db.prepare(`
    DELETE FROM users WHERE id = ?
  `);
  
  const result = deleteUser.run(id);
  
  if (result.changes === 0) {
    throw new Error('User not found');
  }
  
  return true;
}; 