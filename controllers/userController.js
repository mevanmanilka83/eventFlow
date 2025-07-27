// Import individual functions from user model
import { 
  createUser, 
  validateUserCredentials, 
  getAllUsers, 
  findUserById 
} from '../models/user.js';

// User signup controller
export const signup = (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }
    
    // Create new user using standalone function
    const newUser = createUser({ username, email, password });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// User login controller
export const login = (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Validate user credentials using standalone function
    const user = validateUserCredentials(email, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all users (for testing purposes)
export const getAllUsers = (req, res) => {
  try {
    const users = getAllUsers();
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user by ID
export const getUserById = (req, res) => {
  try {
    const { id } = req.params;
    const user = findUserById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: userWithoutPassword
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 