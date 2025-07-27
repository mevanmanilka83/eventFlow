import express from 'express';
const router = express.Router();

// Import individual controller functions
import { 
  signup, 
  login, 
  getAllUsers, 
  getUserById,
  updateUserById,
  deleteUserById
} from '../controllers/userController.js';

// User signup route
router.post('/signup', signup);

// User login route
router.post('/login', login);

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user by ID
router.put('/:id', updateUserById);

// Delete user by ID
router.delete('/:id', deleteUserById);

export default router; 