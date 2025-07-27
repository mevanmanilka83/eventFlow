// User model with standalone functions
const users = [];

// Generate a simple ID for users
let userIdCounter = 1;

// Create a new user
export const createUser = (userData) => {
  const { username, email, password } = userData;
  
  // Basic validation
  if (!username || !email || !password) {
    throw new Error('Username, email, and password are required');
  }
  
  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  
  // Check if user already exists
  const existingUser = users.find(user => 
    user.email === email || user.username === username
  );
  
  if (existingUser) {
    throw new Error('User with this email or username already exists');
  }
  
  // Create new user object
  const newUser = {
    id: userIdCounter++,
    username,
    email,
    password, // In a real app, this would be hashed
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Find user by email
export const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

// Find user by username
export const findUserByUsername = (username) => {
  return users.find(user => user.username === username);
};

// Find user by ID
export const findUserById = (id) => {
  return users.find(user => user.id === parseInt(id));
};

// Get all users (without passwords)
export const getAllUsers = () => {
  return users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

// Validate user credentials
export const validateUserCredentials = (email, password) => {
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