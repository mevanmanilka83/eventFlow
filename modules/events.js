// Events Module - Complete CRUD operations with role-based authorization
import { db } from '../config/database.js';
import { hasPermission, hasAnyPermission } from '../models/user.js';

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
    
    // Return the created event data directly
    return {
      id: result.lastInsertRowid,
      title: trimmedTitle,
      description: trimmedDescription,
      date: date,
      address: trimmedAddress,
      organizer_id: organizer_id,
      is_approved: 0,
      approved_by: null,
      approved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      throw new Error('Organizer not found');
    }
    throw new Error('Failed to create event');
  }
};

// Get all events (with role-based filtering)
export const getAllEvents = (userId = null) => {
  let query, params;
  
  if (userId && hasAnyPermission(userId, ['read_all_events', 'approve_events'])) {
    // Admin/moderator can see all events
    query = `
      SELECT e.*, u.username as organizer_name, u.email as organizer_email,
             a.username as approver_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      ORDER BY e.date ASC
    `;
    params = [];
  } else {
    // Regular users can only see approved events
    query = `
      SELECT e.*, u.username as organizer_name, u.email as organizer_email,
             a.username as approver_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE e.is_approved = 1
      ORDER BY e.date ASC
    `;
    params = [];
  }
  
  const getEvents = db.prepare(query);
  return getEvents.all(...params);
};

// Get event by ID (with role-based access)
export const getEventById = (id, userId = null) => {
  let query, params;
  
  if (userId && hasAnyPermission(userId, ['read_all_events', 'approve_events'])) {
    // Admin/moderator can see any event
    query = `
      SELECT e.*, u.username as organizer_name, u.email as organizer_email,
             a.username as approver_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE e.id = ?
    `;
    params = [id];
  } else {
    // Regular users can only see approved events
    query = `
      SELECT e.*, u.username as organizer_name, u.email as organizer_email,
             a.username as approver_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE e.id = ? AND e.is_approved = 1
    `;
    params = [id];
  }
  
  const getEvent = db.prepare(query);
  return getEvent.get(...params);
};

// Edit/Update event (with role-based permissions)
export const editEvent = (id, eventData, userId) => {
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
  
  // Check permissions
  const event = getEventById(id, userId);
  if (!event) {
    throw new Error('Event not found');
  }
  
  // Only event owner, moderator, or admin can edit
  if (!hasAnyPermission(userId, ['update_any_event', 'approve_events']) && 
      event.organizer_id !== userId) {
    throw new Error('You can only edit your own events');
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
    
    return getEventById(id, userId);
    
  } catch (error) {
    throw error;
  }
};

// Delete event (with role-based permissions)
export const deleteEvent = (id, userId) => {
  // Check permissions
  const event = getEventById(id, userId);
  if (!event) {
    throw new Error('Event not found');
  }
  
  // Only event owner, moderator, or admin can delete
  if (!hasAnyPermission(userId, ['delete_any_event', 'approve_events']) && 
      event.organizer_id !== userId) {
    throw new Error('You can only delete your own events');
  }
  
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
export const getEventsByOrganizer = (organizerId, userId = null) => {
  let query, params;
  
  if (userId && hasAnyPermission(userId, ['read_all_events', 'approve_events'])) {
    // Admin/moderator can see all events by organizer
    query = `
      SELECT e.*, u.username as organizer_name, u.email as organizer_email,
             a.username as approver_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE e.organizer_id = ?
      ORDER BY e.date ASC
    `;
    params = [organizerId];
  } else {
    // Regular users can only see approved events by organizer
    query = `
      SELECT e.*, u.username as organizer_name, u.email as organizer_email,
             a.username as approver_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE e.organizer_id = ? AND e.is_approved = 1
      ORDER BY e.date ASC
    `;
    params = [organizerId];
  }
  
  const getEvents = db.prepare(query);
  return getEvents.all(...params);
};

// Check if user owns the event
export const isEventOwner = (eventId, userId) => {
  const event = getEventById(eventId, userId);
  if (!event) {
    return false;
  }
  return event.organizer_id === userId;
};

// Approve event (moderator/admin only)
export const approveEvent = (eventId, approverId) => {
  if (!hasAnyPermission(approverId, ['approve_events'])) {
    throw new Error('Insufficient permissions to approve events');
  }
  
  const event = getEventById(eventId, approverId);
  if (!event) {
    throw new Error('Event not found');
  }
  
  if (event.is_approved) {
    throw new Error('Event is already approved');
  }
  
  const approveEvent = db.prepare(`
    UPDATE events 
    SET is_approved = 1, approved_by = ?, approved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  const result = approveEvent.run(approverId, eventId);
  
  if (result.changes === 0) {
    throw new Error('Event not found');
  }
  
  return getEventById(eventId, approverId);
};

// Reject event (moderator/admin only)
export const rejectEvent = (eventId, rejectorId) => {
  if (!hasAnyPermission(rejectorId, ['approve_events'])) {
    throw new Error('Insufficient permissions to reject events');
  }
  
  const event = getEventById(eventId, rejectorId);
  if (!event) {
    throw new Error('Event not found');
  }
  
  if (!event.is_approved) {
    throw new Error('Event is already not approved');
  }
  
  const rejectEvent = db.prepare(`
    UPDATE events 
    SET is_approved = 0, approved_by = NULL, approved_at = NULL
    WHERE id = ?
  `);
  
  const result = rejectEvent.run(eventId);
  
  if (result.changes === 0) {
    throw new Error('Event not found');
  }
  
  return getEventById(eventId, rejectorId);
};

// Get pending events (moderator/admin only)
export const getPendingEvents = (userId) => {
  if (!hasAnyPermission(userId, ['approve_events'])) {
    throw new Error('Insufficient permissions to view pending events');
  }
  
  const getPendingEvents = db.prepare(`
    SELECT e.*, u.username as organizer_name, u.email as organizer_email
    FROM events e
    LEFT JOIN users u ON e.organizer_id = u.id
    WHERE e.is_approved = 0
    ORDER BY e.created_at ASC
  `);
  
  return getPendingEvents.all();
};

// Search events by title or description (with role-based filtering)
export const searchEvents = (searchTerm, userId = null) => {
  let query, params;
  
  if (userId && hasAnyPermission(userId, ['read_all_events', 'approve_events'])) {
    // Admin/moderator can search all events
    query = `
      SELECT e.*, u.username as organizer_name, u.email as organizer_email,
             a.username as approver_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE e.title LIKE ? OR e.description LIKE ?
      ORDER BY e.date ASC
    `;
    params = [`%${searchTerm}%`, `%${searchTerm}%`];
  } else {
    // Regular users can only search approved events
    query = `
      SELECT e.*, u.username as organizer_name, u.email as organizer_email,
             a.username as approver_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE (e.title LIKE ? OR e.description LIKE ?) AND e.is_approved = 1
      ORDER BY e.date ASC
    `;
    params = [`%${searchTerm}%`, `%${searchTerm}%`];
  }
  
  const searchEvents = db.prepare(query);
  return searchEvents.all(...params);
};

// Get upcoming events (events in the future)
export const getUpcomingEvents = (userId = null) => {
  let query, params;
  
  if (userId && hasAnyPermission(userId, ['read_all_events', 'approve_events'])) {
    // Admin/moderator can see all upcoming events
    query = `
      SELECT e.*, u.username as organizer_name, u.email as organizer_email,
             a.username as approver_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE e.date > datetime('now')
      ORDER BY e.date ASC
    `;
    params = [];
  } else {
    // Regular users can only see approved upcoming events
    query = `
      SELECT e.*, u.username as organizer_name, u.email as organizer_email,
             a.username as approver_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE e.date > datetime('now') AND e.is_approved = 1
      ORDER BY e.date ASC
    `;
    params = [];
  }
  
  const getUpcomingEvents = db.prepare(query);
  return getUpcomingEvents.all(...params);
};

// Get events by date range (with role-based filtering)
export const getEventsByDateRange = (startDate, endDate, userId = null) => {
  let query, params;
  
  if (userId && hasAnyPermission(userId, ['read_all_events', 'approve_events'])) {
    // Admin/moderator can see all events in date range
    query = `
      SELECT e.*, u.username as organizer_name, u.email as organizer_email,
             a.username as approver_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE e.date BETWEEN ? AND ?
      ORDER BY e.date ASC
    `;
    params = [startDate, endDate];
  } else {
    // Regular users can only see approved events in date range
    query = `
      SELECT e.*, u.username as organizer_name, u.email as organizer_email,
             a.username as approver_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE e.date BETWEEN ? AND ? AND e.is_approved = 1
      ORDER BY e.date ASC
    `;
    params = [startDate, endDate];
  }
  
  const getEventsByDateRange = db.prepare(query);
  return getEventsByDateRange.all(...params);
}; 