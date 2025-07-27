// Events Module - Complete CRUD operations
import { db } from '../config/database.js';

// Validate input fields
const validateInput = (field, value, fieldName) => {
  // Check for null, undefined, or empty string
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName} cannot be empty`);
  }
  
  // Check for whitespace-only strings (spaces, tabs, newlines, etc.)
  if (value.trim() === '') {
    throw new Error(`${fieldName} cannot be just blanks or whitespace`);
  }
  
  // Check if string contains only whitespace characters
  if (/^\s+$/.test(value)) {
    throw new Error(`${fieldName} cannot be just blanks or whitespace`);
  }
  
  // Trim the value to remove leading/trailing whitespace
  return value.trim();
};

// Validate date format
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Create a new event
export const createEvent = async (eventData) => {
  const { title, description, date, address, organizer_id } = eventData;
  
  // Validate required fields
  if (!title || !description || !date || !address || !organizer_id) {
    throw new Error('Title, description, date, address, and organizer_id are required');
  }
  
  // Validate and trim inputs
  const trimmedTitle = validateInput('title', title, 'Title');
  const trimmedDescription = validateInput('description', description, 'Description');
  const trimmedAddress = validateInput('address', address, 'Address');
  
  // Title validation
  if (trimmedTitle.length < 3) {
    throw new Error('Title must be at least 3 characters long');
  }
  
  if (trimmedTitle.length > 100) {
    throw new Error('Title must be less than 100 characters long');
  }
  
  // Description validation
  if (trimmedDescription.length < 10) {
    throw new Error('Description must be at least 10 characters long');
  }
  
  if (trimmedDescription.length > 1000) {
    throw new Error('Description must be less than 1000 characters long');
  }
  
  // Address validation
  if (trimmedAddress.length < 5) {
    throw new Error('Address must be at least 5 characters long');
  }
  
  if (trimmedAddress.length > 200) {
    throw new Error('Address must be less than 200 characters long');
  }
  
  // Date validation
  if (!isValidDate(date)) {
    throw new Error('Please provide a valid date');
  }
  
  // Check if date is in the future
  const eventDate = new Date(date);
  const now = new Date();
  if (eventDate <= now) {
    throw new Error('Event date must be in the future');
  }
  
  // Organizer validation
  if (!Number.isInteger(organizer_id) || organizer_id <= 0) {
    throw new Error('Valid organizer_id is required');
  }
  
  try {
    // Insert new event into database
    const insertEvent = db.prepare(`
      INSERT INTO events (title, description, date, address, organizer_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = insertEvent.run(trimmedTitle, trimmedDescription, date, trimmedAddress, organizer_id);
    
    // Get the created event
    const newEvent = getEventById(result.lastInsertRowid);
    return newEvent;
    
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      throw new Error('Organizer not found');
    }
    throw new Error('Failed to create event');
  }
};

// Get all events
export const getAllEvents = () => {
  const getEvents = db.prepare(`
    SELECT e.*, u.username as organizer_name, u.email as organizer_email
    FROM events e
    LEFT JOIN users u ON e.organizer_id = u.id
    ORDER BY e.date ASC
  `);
  
  return getEvents.all();
};

// Get event by ID
export const getEventById = (id) => {
  const getEvent = db.prepare(`
    SELECT e.*, u.username as organizer_name, u.email as organizer_email
    FROM events e
    LEFT JOIN users u ON e.organizer_id = u.id
    WHERE e.id = ?
  `);
  
  return getEvent.get(id);
};

// Edit/Update event
export const editEvent = (id, eventData) => {
  const { title, description, date, address } = eventData;
  
  // Validate and trim inputs
  const trimmedTitle = validateInput('title', title, 'Title');
  const trimmedDescription = validateInput('description', description, 'Description');
  const trimmedAddress = validateInput('address', address, 'Address');
  
  // Title validation
  if (trimmedTitle.length < 3) {
    throw new Error('Title must be at least 3 characters long');
  }
  
  if (trimmedTitle.length > 100) {
    throw new Error('Title must be less than 100 characters long');
  }
  
  // Description validation
  if (trimmedDescription.length < 10) {
    throw new Error('Description must be at least 10 characters long');
  }
  
  if (trimmedDescription.length > 1000) {
    throw new Error('Description must be less than 1000 characters long');
  }
  
  // Address validation
  if (trimmedAddress.length < 5) {
    throw new Error('Address must be at least 5 characters long');
  }
  
  if (trimmedAddress.length > 200) {
    throw new Error('Address must be less than 200 characters long');
  }
  
  // Date validation
  if (!isValidDate(date)) {
    throw new Error('Please provide a valid date');
  }
  
  // Check if date is in the future
  const eventDate = new Date(date);
  const now = new Date();
  if (eventDate <= now) {
    throw new Error('Event date must be in the future');
  }
  
  try {
    const updateEvent = db.prepare(`
      UPDATE events 
      SET title = ?, description = ?, date = ?, address = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = updateEvent.run(trimmedTitle, trimmedDescription, date, trimmedAddress, id);
    
    if (result.changes === 0) {
      throw new Error('Event not found');
    }
    
    return getEventById(id);
    
  } catch (error) {
    throw error;
  }
};

// Delete event
export const deleteEvent = (id) => {
  const deleteEvent = db.prepare(`
    DELETE FROM events WHERE id = ?
  `);
  
  const result = deleteEvent.run(id);
  
  if (result.changes === 0) {
    throw new Error('Event not found');
  }
  
  return true;
};

// Check if event exists
export const eventExists = (id) => {
  const event = getEventById(id);
  return event !== undefined;
};

// Get events by organizer
export const getEventsByOrganizer = (organizerId) => {
  const getEvents = db.prepare(`
    SELECT e.*, u.username as organizer_name, u.email as organizer_email
    FROM events e
    LEFT JOIN users u ON e.organizer_id = u.id
    WHERE e.organizer_id = ?
    ORDER BY e.date ASC
  `);
  
  return getEvents.all(organizerId);
};

// Check if user owns the event
export const isEventOwner = (eventId, userId) => {
  const event = getEventById(eventId);
  if (!event) {
    return false;
  }
  return event.organizer_id === userId;
};

// Search events by title or description
export const searchEvents = (searchTerm) => {
  const searchEvents = db.prepare(`
    SELECT e.*, u.username as organizer_name, u.email as organizer_email
    FROM events e
    LEFT JOIN users u ON e.organizer_id = u.id
    WHERE e.title LIKE ? OR e.description LIKE ?
    ORDER BY e.date ASC
  `);
  
  const searchPattern = `%${searchTerm}%`;
  return searchEvents.all(searchPattern, searchPattern);
};

// Get upcoming events (events in the future)
export const getUpcomingEvents = () => {
  const getUpcomingEvents = db.prepare(`
    SELECT e.*, u.username as organizer_name, u.email as organizer_email
    FROM events e
    LEFT JOIN users u ON e.organizer_id = u.id
    WHERE e.date > datetime('now')
    ORDER BY e.date ASC
  `);
  
  return getUpcomingEvents.all();
};

// Get events by date range
export const getEventsByDateRange = (startDate, endDate) => {
  const getEventsByDateRange = db.prepare(`
    SELECT e.*, u.username as organizer_name, u.email as organizer_email
    FROM events e
    LEFT JOIN users u ON e.organizer_id = u.id
    WHERE e.date BETWEEN ? AND ?
    ORDER BY e.date ASC
  `);
  
  return getEventsByDateRange.all(startDate, endDate);
}; 