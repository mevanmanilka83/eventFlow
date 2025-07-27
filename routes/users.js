import express from 'express';
const router = express.Router();

// Import individual controller functions
import { 
  signup, 
  login, 
  getAllUsers, 
  getUserById 
} from '../controllers/userController.js';

// User signup route
router.post('/signup', signup);

// User login route
router.post('/login', login);

// Get all users (for testing purposes)
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

export default router; 