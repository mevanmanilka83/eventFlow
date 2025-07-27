// User model with standalone functions using SQLite database
import { db } from '../config/database.js';
import bcrypt from 'bcryptjs';

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

// Get user with role information
export const getUserWithRole = (id) => {
  const getUser = db.prepare(`
    SELECT u.*, r.name as role_name, r.permissions as role_permissions
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.id = ?
  `);
  
  return getUser.get(id);
};

// Get user by email with role information
export const findUserByEmailWithRole = (email) => {
  const getUser = db.prepare(`
    SELECT u.*, r.name as role_name, r.permissions as role_permissions
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.email = ?
  `);
  
  return getUser.get(email);
};

// Check if user has specific permission
export const hasPermission = (userId, permission) => {
  const user = getUserWithRole(userId);
  if (!user) return false;
  
  const permissions = user.role_permissions.split(',');
  return permissions.includes(permission) || permissions.includes('all');
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (userId, requiredPermissions) => {
  const user = getUserWithRole(userId);
  if (!user) return false;
  
  const permissions = user.role_permissions.split(',');
  return requiredPermissions.some(permission => 
    permissions.includes(permission) || permissions.includes('all')
  );
};

// Get all roles
export const getAllRoles = () => {
  const getRoles = db.prepare(`
    SELECT * FROM roles ORDER BY id
  `);
  
  return getRoles.all();
};

// Get role by ID
export const getRoleById = (id) => {
  const getRole = db.prepare(`
    SELECT * FROM roles WHERE id = ?
  `);
  
  return getRole.get(id);
};

// Get role by name
export const getRoleByName = (name) => {
  const getRole = db.prepare(`
    SELECT * FROM roles WHERE name = ?
  `);
  
  return getRole.get(name);
};

// Create a new user
export const createUser = async (userData) => {
  const { username, email, password, role_id = 2 } = userData;
  
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
  
  // Validate role_id
  const role = getRoleById(role_id);
  if (!role) {
    throw new Error('Invalid role specified');
  }
  
  // Hash the password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(trimmedPassword, saltRounds);
  
  try {
    // Insert new user into database
    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password, role_id)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = insertUser.run(trimmedUsername, trimmedEmail, hashedPassword, role_id);
    
    // Get the created user with role information
    const newUser = getUserWithRole(result.lastInsertRowid);
    
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

// Get all users (without passwords) with role information
export const getAllUsers = () => {
  const getUsers = db.prepare(`
    SELECT u.id, u.username, u.email, u.role_id, u.is_active, u.created_at, u.updated_at,
           r.name as role_name, r.permissions as role_permissions
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
  `);
  
  return getUsers.all();
};

// Validate user credentials
export const validateUserCredentials = async (email, password) => {
  // Validate email format
  if (!isValidEmail(email)) {
    return null;
  }
  
  const user = findUserByEmailWithRole(email);
  if (!user || !user.is_active) {
    return null;
  }
  
  // Compare password with hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return null;
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Verify user credentials (alternative function with more detailed response)
export const verifyUserCredentials = async (email, password) => {
  try {
    // Validate email format
    if (!isValidEmail(email)) {
      return {
        isValid: false,
        user: null,
        error: 'Invalid email format'
      };
    }
    
    const user = findUserByEmailWithRole(email);
    if (!user) {
      return {
        isValid: false,
        user: null,
        error: 'User not found'
      };
    }
    
    if (!user.is_active) {
      return {
        isValid: false,
        user: null,
        error: 'Account is deactivated'
      };
    }
    
    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        isValid: false,
        user: null,
        error: 'Invalid password'
      };
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      isValid: true,
      user: userWithoutPassword,
      error: null
    };
    
  } catch (error) {
    return {
      isValid: false,
      user: null,
      error: 'Verification failed'
    };
  }
};

// Update user
export const updateUser = (id, userData) => {
  const { username, email, role_id } = userData;
  
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
  
  // Validate role_id if provided
  if (role_id) {
    const role = getRoleById(role_id);
    if (!role) {
      throw new Error('Invalid role specified');
    }
  }
  
  try {
    let updateQuery, params;
    
    if (role_id) {
      updateQuery = `
        UPDATE users 
        SET username = ?, email = ?, role_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      params = [trimmedUsername, trimmedEmail, role_id, id];
    } else {
      updateQuery = `
        UPDATE users 
        SET username = ?, email = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      params = [trimmedUsername, trimmedEmail, id];
    }
    
    const updateUser = db.prepare(updateQuery);
    const result = updateUser.run(...params);
    
    if (result.changes === 0) {
      throw new Error('User not found');
    }
    
    return getUserWithRole(id);
    
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('User with this email or username already exists');
    }
    throw error;
  }
};

// Update user role
export const updateUserRole = (id, role_id) => {
  const role = getRoleById(role_id);
  if (!role) {
    throw new Error('Invalid role specified');
  }
  
  const updateRole = db.prepare(`
    UPDATE users 
    SET role_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  const result = updateRole.run(role_id, id);
  
  if (result.changes === 0) {
    throw new Error('User not found');
  }
  
  return getUserWithRole(id);
};

// Toggle user active status
export const toggleUserStatus = (id) => {
  const updateStatus = db.prepare(`
    UPDATE users 
    SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  const result = updateStatus.run(id);
  
  if (result.changes === 0) {
    throw new Error('User not found');
  }
  
  return getUserWithRole(id);
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