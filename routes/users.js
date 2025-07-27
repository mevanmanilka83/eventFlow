import express from 'express';
const router = express.Router();

// Import individual controller functions
import { 
  signup, 
  login, 
  getAllUsers, 
  getUserById,
  updateUserById,
  deleteUserById,
  updateUserRoleById,
  toggleUserStatusById,
  getAllRolesController,
  getRoleByIdController
} from '../controllers/userController.js';

// Import middleware
import { requireAuth, requireAdmin, requireModerator } from '../middleware/auth.js';

// Public routes (no authentication required)
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (authentication required)
router.get('/profile', requireAuth, (req, res) => {
  // Get current user profile by using the authenticated user's ID
  req.params.id = req.user.id;
  getUserById(req, res);
}); // Get current user profile
router.put('/profile', requireAuth, (req, res) => {
  // Update current user profile by using the authenticated user's ID
  req.params.id = req.user.id;
  updateUserById(req, res);
}); // Update current user profile

// Admin routes (require admin role)
router.get('/', requireAuth, requireAdmin, getAllUsers); // Get all users
router.get('/:id', requireAuth, getUserById); // Get user by ID
router.put('/:id', requireAuth, requireAdmin, updateUserById); // Update user by ID
router.delete('/:id', requireAuth, requireAdmin, deleteUserById); // Delete user by ID
router.put('/:id/role', requireAuth, requireAdmin, updateUserRoleById); // Update user role
router.put('/:id/status', requireAuth, requireAdmin, toggleUserStatusById); // Toggle user status

// Role management routes (admin only)
router.get('/roles/all', requireAuth, requireAdmin, getAllRolesController); // Get all roles
router.get('/roles/:id', requireAuth, requireAdmin, getRoleByIdController); // Get role by ID

export default router; 