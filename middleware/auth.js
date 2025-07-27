import { verifyUserCredentials, hasPermission, hasAnyPermission, getUserWithRole } from '../models/user.js';
import jwt from 'jsonwebtoken';

// JWT secret key (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'abctoken';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role_id: user.role_id,
    role_name: user.role_name
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
    
    // Get fresh user data with role information
    const userWithRole = getUserWithRole(result.user.id);
    if (!userWithRole || !userWithRole.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated or not found'
      });
    }
    
    // Add user info to request
    req.user = userWithRole;
    next();
    
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
};

// Middleware to check if user has specific permission
export const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      if (!hasPermission(req.user.id, permission)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

// Middleware to check if user has any of the specified permissions
export const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      if (!hasAnyPermission(req.user.id, permissions)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (req.user.role_name !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Admin check failed'
    });
  }
};

// Middleware to check if user is moderator or admin
export const requireModerator = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!['admin', 'moderator'].includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: 'Moderator or admin access required'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Moderator check failed'
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