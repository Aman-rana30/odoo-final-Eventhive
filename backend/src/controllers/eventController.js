import eventService from '../services/eventService.js';
import { validationResult } from 'express-validator';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';

export const getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      city,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      venueType,
      sort = 'startAt'
    } = req.query;

    const filters = {
      ...(category && { category }),
      ...(search && { $text: { $search: search } }),
      ...(city && { 'venue.city': { $regex: city, $options: 'i' } }),
      ...(startDate && { startAt: { $gte: new Date(startDate) } }),
      ...(endDate && { endAt: { $lte: new Date(endDate) } }),
      ...(venueType && { 'venue.type': venueType }),
      status: 'Published'
    };

    const result = await eventService.getEvents({
      filters,
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const getEventBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const event = await eventService.getEventBySlug(slug);
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let coverImageUrl = '';
    if (req.file) {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.path, 'events');
      coverImageUrl = result.secure_url;
      // Remove local file after upload
      fs.unlink(req.file.path, () => {});
    }

    const eventData = {
      ...req.body,
      organizer: req.user.id,
      coverImageUrl
    };

    const event = await eventService.createEvent(eventData);
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    let coverImageUrl;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'events');
      coverImageUrl = result.secure_url;
      fs.unlink(req.file.path, () => {});
    }
    const updateData = {
      ...req.body,
      ...(coverImageUrl && { coverImageUrl })
    };
    const event = await eventService.updateEvent(id, updateData, req.user.id);
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await eventService.deleteEvent(id, req.user.id);
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const publishEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventService.publishEvent(id, req.user.id);
    
    res.json({
      success: true,
      message: 'Event published successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await eventService.getFeaturedEvents();
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

export const getTrendingEvents = async (req, res, next) => {
  try {
    const events = await eventService.getTrendingEvents();
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

export const trackEventView = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];
    const ip = req.ip;

    await eventService.trackEventAction(id, 'view', { userId, sessionId, ip });
    
    res.json({
      success: true,
      message: 'Event view tracked'
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const result = await eventService.getEventsByOrganizer(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};