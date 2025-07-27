// Import individual functions from events module
import { 
  createEvent, 
  getAllEvents,
  getEventById,
  editEvent,
  deleteEvent,
  getEventsByOrganizer,
  isEventOwner
} from '../modules/events.js';

// Create a new event
export const createNewEvent = async (req, res) => {
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
      message: 'Event created successfully',
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
export const getAllEventsController = async (req, res) => {
  try {
    const events = getAllEvents();
    
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
export const getEventByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const event = getEventById(id);
    
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
export const getMyEvents = async (req, res) => {
  try {
    const organizer_id = req.user.id;
    const events = getEventsByOrganizer(organizer_id);
    
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
export const updateEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, address } = req.body;
    const organizer_id = req.user.id;
    
    // Check if event exists and belongs to the user
    if (!isEventOwner(id, organizer_id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own events'
      });
    }
    
    // Update event
    const updatedEvent = editEvent(id, { title, description, date, address });
    
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
    }
    
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Delete event
export const deleteEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizer_id = req.user.id;
    
    // Check if event exists and belongs to the user
    if (!isEventOwner(id, organizer_id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own events'
      });
    }
    
    // Delete event
    deleteEvent(id);
    
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
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 