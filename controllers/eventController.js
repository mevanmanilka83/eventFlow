// Import individual functions from events module
import { 
  createEvent, 
  getAllEvents,
  getEventById,
  editEvent,
  deleteEvent,
  getEventsByOrganizer,
  isEventOwner,
  approveEvent,
  rejectEvent,
  getPendingEvents,
  searchEvents,
  getUpcomingEvents,
  getEventsByDateRange
} from '../modules/events.js';

// Create a new event
const createNewEvent = async (req, res) => {
  try {
    const { title, description, date, address } = req.body;
    const organizer_id = req.user.id; // Get from authenticated user
    
    // Validate required fields
    if (!title || !description || !date || !address) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, date, and address are required'
      });
    }
    
    // Create new event using standalone function
    const newEvent = await createEvent({ 
      title, 
      description, 
      date, 
      address, 
      organizer_id 
    });
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully and pending approval',
      data: newEvent
    });
    
  } catch (error) {
    // Handle specific validation errors
    const errorMessage = error.message;
    let statusCode = 400;
    
    // Set appropriate status codes for different error types
    if (errorMessage.includes('Organizer not found')) {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
};

// Get all events
const getAllEventsController = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const events = getAllEvents(userId);
    
    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: events
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get event by ID
const getEventByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const event = getEventById(id, userId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Event retrieved successfully',
      data: event
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get events by current user (organizer)
const getMyEvents = async (req, res) => {
  try {
    const organizer_id = req.user.id;
    const events = getEventsByOrganizer(organizer_id, organizer_id);
    
    res.status(200).json({
      success: true,
      message: 'Your events retrieved successfully',
      data: events
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update event
const updateEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, address } = req.body;
    const userId = req.user.id;
    
    // Update event
    const updatedEvent = editEvent(id, { title, description, date, address }, userId);
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
    
  } catch (error) {
    let statusCode = 400;
    
    // Set appropriate status codes for different error types
    if (error.message === 'Event not found') {
      statusCode = 404;
    } else if (error.message.includes('You can only edit your own events')) {
      statusCode = 403;
    }
    
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Delete event
const deleteEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Delete event
    deleteEvent(id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
    
  } catch (error) {
    if (error.message === 'Event not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    } else if (error.message.includes('You can only delete your own events')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Approve event (moderator/admin only)
const approveEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const approverId = req.user.id;
    
    const approvedEvent = approveEvent(id, approverId);
    
    res.status(200).json({
      success: true,
      message: 'Event approved successfully',
      data: approvedEvent
    });
    
  } catch (error) {
    let statusCode = 400;
    
    if (error.message === 'Event not found') {
      statusCode = 404;
    } else if (error.message.includes('Insufficient permissions')) {
      statusCode = 403;
    } else if (error.message.includes('already approved')) {
      statusCode = 409;
    }
    
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Reject event (moderator/admin only)
const rejectEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const rejectorId = req.user.id;
    
    const rejectedEvent = rejectEvent(id, rejectorId);
    
    res.status(200).json({
      success: true,
      message: 'Event rejected successfully',
      data: rejectedEvent
    });
    
  } catch (error) {
    let statusCode = 400;
    
    if (error.message === 'Event not found') {
      statusCode = 404;
    } else if (error.message.includes('Insufficient permissions')) {
      statusCode = 403;
    } else if (error.message.includes('already not approved')) {
      statusCode = 409;
    }
    
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Get pending events (moderator/admin only)
const getPendingEventsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const events = getPendingEvents(userId);
    
    res.status(200).json({
      success: true,
      message: 'Pending events retrieved successfully',
      data: events
    });
    
  } catch (error) {
    if (error.message.includes('Insufficient permissions')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Search events
const searchEventsController = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user ? req.user.id : null;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const events = searchEvents(q, userId);
    
    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: events
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get upcoming events
const getUpcomingEventsController = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const events = getUpcomingEvents(userId);
    
    res.status(200).json({
      success: true,
      message: 'Upcoming events retrieved successfully',
      data: events
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get events by date range
const getEventsByDateRangeController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user ? req.user.id : null;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const events = getEventsByDateRange(startDate, endDate, userId);
    
    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: events
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Export all controller functions as a single events object
export const events = {
  createNewEvent,
  getAllEventsController,
  getEventByIdController,
  getMyEvents,
  updateEventById,
  deleteEventById,
  approveEventById,
  rejectEventById,
  getPendingEventsController,
  searchEventsController,
  getUpcomingEventsController,
  getEventsByDateRangeController
}; 