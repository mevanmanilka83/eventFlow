import express from 'express';
import { events } from '../controllers/eventController.js';
import { requireAuth, requireModerator, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware for event fields
const validateEventFields = (req, res, next) => {
  const { title, description, date, address } = req.body;
  
  // Check if required fields are present and not empty
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Title is required and cannot be empty'
    });
  }
  
  if (!description || typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Description is required and cannot be empty'
    });
  }
  
  if (!date || typeof date !== 'string' || date.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Date is required and cannot be empty'
    });
  }
  
  if (!address || typeof address !== 'string' || address.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Address is required and cannot be empty'
    });
  }
  
  // Trim the values to remove leading/trailing whitespace
  req.body.title = title.trim();
  req.body.description = description.trim();
  req.body.date = date.trim();
  req.body.address = address.trim();
  
  next();
};

// Public routes (no authentication required)
router.get('/', events.getAllEventsController); // Get all events (filtered by role)
router.get('/search', events.searchEventsController); // Search events
router.get('/upcoming', events.getUpcomingEventsController); // Get upcoming events
router.get('/date-range', events.getEventsByDateRangeController); // Get events by date range

// Protected routes (authentication required)
router.post('/', requireAuth, validateEventFields, events.createNewEvent); // Create new event
router.get('/my/events', requireAuth, events.getMyEvents); // Get user's own events

// Moderator/Admin routes (require moderator or admin role)
router.get('/pending/all', requireAuth, requireModerator, events.getPendingEventsController); // Get pending events

// Event-specific routes (must come after specific routes)
router.get('/:id', events.getEventByIdController); // Get event by ID
router.put('/:id', requireAuth, validateEventFields, events.updateEventById); // Update event
router.delete('/:id', requireAuth, events.deleteEventById); // Delete event
router.put('/:id/approve', requireAuth, requireModerator, events.approveEventById); // Approve event
router.put('/:id/reject', requireAuth, requireModerator, events.rejectEventById); // Reject event

export default router; 