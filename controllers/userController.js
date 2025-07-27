// Import individual functions from user model
import { 
  createUser, 
  validateUserCredentials,
  verifyUserCredentials,
  getAllUsers as getAllUsersFromDB, 
  findUserById,
  updateUser,
  deleteUser
} from '../models/user.js';
import { generateToken } from '../middleware/auth.js';

// User signup controller
export const signup = async (req, res) => {
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
    const newUser = await createUser({ username, email, password });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
    
  } catch (error) {
    // Handle specific validation errors
    const errorMessage = error.message;
    let statusCode = 400;
    
    // Set appropriate status codes for different error types
    if (errorMessage.includes('already registered') || 
        errorMessage.includes('already taken')) {
      statusCode = 409; // Conflict
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
};

// User login controller
export const login = async (req, res) => {
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
    const user = await validateUserCredentials(email, password);
    
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

// Alternative login controller using verifyUserCredentials
export const loginWithVerification = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Verify user credentials using the new function
    const result = await verifyUserCredentials(email, password);
    
    if (!result.isValid) {
      return res.status(401).json({
        success: false,
        message: result.error
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result.user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login controller that returns JWT token
export const loginWithToken = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Verify user credentials
    const result = await verifyUserCredentials(email, password);
    
    if (!result.isValid) {
      return res.status(401).json({
        success: false,
        message: result.error
      });
    }
    
    // Generate JWT token
    const token = generateToken(result.user);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        token: token
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all users
export const getAllUsers = (req, res) => {
  try {
    const users = getAllUsersFromDB();
    
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

// Update user
export const updateUserById = (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;
    
    // Validate required fields
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username and email are required'
      });
    }
    
    // Update user
    const updatedUser = updateUser(id, { username, email });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userWithoutPassword
    });
    
  } catch (error) {
    let statusCode = 400;
    
    // Set appropriate status codes for different error types
    if (error.message === 'User not found') {
      statusCode = 404;
    } else if (error.message.includes('already registered') || 
               error.message.includes('already taken')) {
      statusCode = 409; // Conflict
    }
    
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Delete user
export const deleteUserById = (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete user
    deleteUser(id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 