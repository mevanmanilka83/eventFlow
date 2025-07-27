import { verifyUserCredentials } from '../models/user.js';

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

// Middleware to check if user is authenticated (for protected routes)
export const requireAuth = async (req, res, next) => {
  try {
    // Get token from header (you can implement JWT tokens later)
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header required'
      });
    }
    
    // For now, we'll use a simple approach
    // In a real app, you'd verify JWT tokens here
    const token = authHeader.replace('Bearer ', '');
    
    // This is a placeholder - you can implement proper token verification
    // For now, we'll just check if the token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    // Add user info to request (you'd decode this from JWT)
    req.user = { id: token }; // Placeholder
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