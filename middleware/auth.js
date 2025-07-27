import { verifyUserCredentials } from '../models/user.js';
import jwt from 'jsonwebtoken';

// JWT secret key (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      isValid: true,
      user: decoded
    };
  } catch (error) {
    return {
      isValid: false,
      user: null,
      error: error.message
    };
  }
};

// Middleware to verify user credentials
export const verifyCredentials = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const result = await verifyUserCredentials(email, password);
    
    if (!result.isValid) {
      return res.status(401).json({
        success: false,
        message: result.error
      });
    }
    
    // Add user to request object for use in subsequent middleware/routes
    req.user = result.user;
    next();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to verify credentials and generate JWT token
export const loginAndGenerateToken = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const result = await verifyUserCredentials(email, password);
    
    if (!result.isValid) {
      return res.status(401).json({
        success: false,
        message: result.error
      });
    }
    
    // Generate JWT token
    const token = generateToken(result.user);
    
    // Add user and token to request object
    req.user = result.user;
    req.token = token;
    next();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to check if user is authenticated (for protected routes)
export const requireAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header required'
      });
    }
    
    // Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is required'
      });
    }
    
    // Verify the JWT token
    const result = verifyToken(token);
    
    if (!result.isValid) {
      return res.status(401).json({
        success: false,
        message: result.error || 'Invalid token'
      });
    }
    
    // Add user info to request
    req.user = result.user;
    next();
    
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
};

// Middleware to get user by ID from params and verify they exist
export const verifyUserExists = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // You can add user existence check here if needed
    // const user = findUserById(id);
    // if (!user) {
    //   return res.status(404).json({
    //     success: false,
    //     message: 'User not found'
    //   });
    // }
    
    next();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying user'
    });
  }
}; 