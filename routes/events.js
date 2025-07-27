import express from 'express';
import { 
  createNewEvent,
  getAllEventsController,
  getEventByIdController,
  getMyEvents,
  updateEventById,
  deleteEventById
} from '../controllers/eventController.js';
import { requireAuth } from '../middleware/auth.js';

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
router.get('/', getAllEventsController); // Get all events
router.get('/:id', getEventByIdController); // Get event by ID

// Protected routes (authentication required)
router.post('/', requireAuth, validateEventFields, createNewEvent); // Create new event
router.get('/my/events', requireAuth, getMyEvents); // Get user's own events
router.put('/:id', requireAuth, validateEventFields, updateEventById); // Update event
router.delete('/:id', requireAuth, deleteEventById); // Delete event

export default router; 