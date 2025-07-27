# EventFlow API

[![Node.js](https://img.shields.io/badge/Node.js-18-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.18-black?style=for-the-badge&logo=express)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite-3-blue?style=for-the-badge&logo=sqlite)](https://www.sqlite.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=json-web-tokens)](https://jwt.io)
[![bcrypt](https://img.shields.io/badge/bcrypt-Hashing-000000?style=for-the-badge&logo=bcrypt)](https://github.com/dcodeIO/bcrypt.js)
[![Role-Based](https://img.shields.io/badge/Role--Based-Access-2d3748?style=for-the-badge&logo=shield)](https://en.wikipedia.org/wiki/Role-based_access_control)

## Overview

EventFlow API is a comprehensive event management system with role-based authorization built with Node.js, Express, and SQLite. This API provides a robust foundation for event management applications with granular permission control, event approval workflows, and secure authentication.

### The EventFlow Experience

The API transforms event management through intelligent role-based access control and comprehensive event tracking capabilities. Users can create personalized events, track their approval status, and manage events based on their specific role permissions. Whether you're building an event management platform, integrating event features into an existing application, or learning about modern API development with role-based security, this project demonstrates best practices in authentication, authorization, data validation, and scalable architecture.

### Why EventFlow API?

This API combines the power of modern web technologies with sophisticated role-based access control to create an intelligent event management system. Whether you're building an event tracking app, integrating event features into an existing application, or learning about modern API development, this project demonstrates best practices in authentication, authorization, data validation, and scalable architecture.

Built with Express for robust backend development, SQLite for reliable data storage, and JWT for secure authentication, the EventFlow API offers a solid foundation for building event management applications with role-based security.

## API Documentation

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication
- `POST /users/signup` - Register a new user
- `POST /users/login` - Login and get JWT token

#### User Management (Admin Only)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user by ID
- `DELETE /users/:id` - Delete user by ID
- `PUT /users/:id/role` - Update user role
- `PUT /users/:id/status` - Toggle user status
- `GET /users/roles/all` - Get all roles
- `GET /users/roles/:id` - Get role by ID

#### Event Management
- `GET /events` - Get all events (filtered by role)
- `GET /events/:id` - Get event by ID
- `POST /events` - Create new event (requires auth)
- `PUT /events/:id` - Update event (requires auth)
- `DELETE /events/:id` - Delete event (requires auth)
- `GET /events/my/events` - Get user's own events (requires auth)

#### Event Search & Filtering
- `GET /events/search?q=query` - Search events
- `GET /events/upcoming` - Get upcoming events
- `GET /events/date-range?startDate=X&endDate=Y` - Get events by date range

#### Event Approval (Moderator/Admin Only)
- `GET /events/pending/all` - Get pending events
- `PUT /events/:id/approve` - Approve event
- `PUT /events/:id/reject` - Reject event

### Example Requests

#### Register a new user
```bash
curl -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Login and get JWT token
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Create an event
```bash
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference 2024",
    "description": "Annual technology conference",
    "date": "2024-12-15T10:00:00Z",
    "address": "123 Tech Street, City"
  }'
```

#### Approve an event (Moderator/Admin)
```bash
curl -X PUT http://localhost:3000/events/1/approve \
  -H "Authorization: Bearer <moderator-jwt-token>"
```

## User Roles & Permissions

### 1. Admin (Role ID: 1)
- **Permissions**: `all` (full system access)
- **Capabilities**:
  - Manage all users and roles
  - Approve/reject any event
  - View all events (including unapproved)
  - Delete any event
  - Update any event
  - Toggle user status
  - Assign roles to users

### 2. Moderator (Role ID: 3)
- **Permissions**: `read_all_events,approve_events,delete_any_event,update_any_event`
- **Capabilities**:
  - Approve/reject events
  - View all events (including unapproved)
  - Delete any event
  - Update any event
  - Cannot manage users or roles

### 3. User (Role ID: 2) - Default Role
- **Permissions**: `read_own_events,create_own_events,update_own_events,delete_own_events`
- **Capabilities**:
  - Create events (pending approval)
  - View only approved events
  - Update own events
  - Delete own events
  - Cannot approve events or manage users

## Database Schema

### Roles Table
```sql
CREATE TABLE roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role_id INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE SET DEFAULT
);
```

### Events Table
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATETIME NOT NULL,
  address TEXT NOT NULL,
  organizer_id INTEGER NOT NULL,
  is_approved BOOLEAN DEFAULT 0,
  approved_by INTEGER,
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
);
```

## Development

### Available Scripts

```bash
# Development
npm start              # Start the application
npm run dev            # Start in development mode

# Testing
npm test               # Run tests
npm run test:watch     # Run tests in watch mode

# Code quality
npm run lint           # Run ESLint
npm run format         # Format code
```

### Project Structure

```
EventFlow/
├── app.js                    # Main application file
├── config/                   # Configuration
│   └── database.js          # Database setup
├── controllers/              # Route controllers
│   ├── eventController.js   # Event endpoints
│   └── userController.js    # User endpoints
├── middleware/               # Custom middleware
│   └── auth.js              # Authentication middleware
├── models/                   # Data models
│   └── user.js              # User model
├── modules/                  # Business logic modules
│   └── events.js            # Event operations
├── routes/                   # Route definitions
│   ├── events.js            # Event routes
│   └── users.js             # User routes
└── public/                   # Static files
    └── images/              # Image assets
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `PORT` | Application port | No (default: 3000) |
| `NODE_ENV` | Environment mode | No (default: development) |

## Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Tokens**: Secure authentication with role information
- **Account Status**: Users can be activated/deactivated
- **Input Validation**: Comprehensive validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **Role-Based Access**: Granular permission checking

## Event Approval Workflow

1. **User creates event** → Event is created with `is_approved = 0`
2. **Moderator/Admin reviews** → Views pending events via `/events/pending/all`
3. **Approval/Rejection** → Uses `/events/:id/approve` or `/events/:id/reject`
4. **Public visibility** → Only approved events are visible to regular users

## Error Handling

The system provides comprehensive error handling with appropriate HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## Dependencies

- `express` - Web framework
- `better-sqlite3` - SQLite database
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Access the API**:
   - Base URL: `http://localhost:3000`
   - Documentation: `http://localhost:3000`

