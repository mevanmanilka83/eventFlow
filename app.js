import express from 'express';
import { initializeDatabase } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import userRoutes from './routes/users.js';
import eventRoutes from './routes/events.js';

// Use routes
app.use('/users', userRoutes);
app.use('/events', eventRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the EventFlow REST API with Role-Based Authorization',
    version: '2.0.0',
    features: [
      'User Authentication & Authorization',
      'Role-Based Access Control',
      'Event Management with Approval System',
      'User Management & Status Control'
    ],
    roles: {
      'admin': 'Full system access - can manage users, roles, and approve events',
      'moderator': 'Can approve/reject events and manage events',
      'user': 'Can create and manage their own events'
    },
    endpoints: {
      // User endpoints
      'POST /users/signup': 'Register a new user',
      'POST /users/login': 'Login user',
      'GET /users/profile': 'Get current user profile (requires auth)',
      'PUT /users/profile': 'Update current user profile (requires auth)',
      'GET /users': 'Get all users (admin only)',
      'GET /users/:id': 'Get user by ID (requires auth)',
      'PUT /users/:id': 'Update user by ID (admin only)',
      'DELETE /users/:id': 'Delete user by ID (admin only)',
      'PUT /users/:id/role': 'Update user role (admin only)',
      'PUT /users/:id/status': 'Toggle user status (admin only)',
      'GET /users/roles/all': 'Get all roles (admin only)',
      'GET /users/roles/:id': 'Get role by ID (admin only)',
      
      // Event endpoints
      'GET /events': 'Get all events (filtered by role)',
      'GET /events/search': 'Search events',
      'GET /events/upcoming': 'Get upcoming events',
      'GET /events/date-range': 'Get events by date range',
      'GET /events/:id': 'Get event by ID',
      'POST /events': 'Create new event (requires auth)',
      'GET /events/my/events': 'Get user\'s own events (requires auth)',
      'PUT /events/:id': 'Update event (requires auth)',
      'DELETE /events/:id': 'Delete event (requires auth)',
      'GET /events/pending/all': 'Get pending events (moderator/admin only)',
      'PUT /events/:id/approve': 'Approve event (moderator/admin only)',
      'PUT /events/:id/reject': 'Reject event (moderator/admin only)'
    },
    permissions: {
      'all': 'Full access (admin only)',
      'read_all_events': 'Can view all events including unapproved ones',
      'approve_events': 'Can approve/reject events',
      'delete_any_event': 'Can delete any event',
      'update_any_event': 'Can update any event',
      'read_own_events': 'Can view own events',
      'create_own_events': 'Can create events',
      'update_own_events': 'Can update own events',
      'delete_own_events': 'Can delete own events'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}`);
  console.log('Role-Based Authorization System Active');
});

export default app;
