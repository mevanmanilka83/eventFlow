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
    message: 'Welcome to the REST API',
    endpoints: {
      // User endpoints
      'POST /users/signup': 'Register a new user',
      'POST /users/login': 'Login user',
      'GET /users': 'Get all users',
      'GET /users/:id': 'Get user by ID',
      'PUT /users/:id': 'Update user by ID',
      'DELETE /users/:id': 'Delete user by ID',
      
      // Event endpoints
      'GET /events': 'Get all events',
      'GET /events/:id': 'Get event by ID',
      'POST /events': 'Create new event (requires auth)',
      'GET /events/my/events': 'Get user\'s own events (requires auth)',
      'PUT /events/:id': 'Update event (requires auth)',
      'DELETE /events/:id': 'Delete event (requires auth)'
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
});

export default app;
