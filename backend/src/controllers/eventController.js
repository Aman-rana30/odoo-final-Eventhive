import express from 'express';
import { validationResult } from 'express-validator';
import fs from 'fs';
import Event from '../models/Event.js';
import eventService from '../services/eventService.js';
import bookingService from '../services/bookingService.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const getEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search, sort, minPrice, maxPrice } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await eventService.getEvents({
      filters,
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      minPrice,
      maxPrice
    });

    res.json({
      success: true,
      data: events
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
    // Joi validation is already handled by the middleware
    // No need to check validationResult here

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

    console.log('Creating event with data:', JSON.stringify(eventData, null, 2));

    const event = await eventService.createEvent(eventData);
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Event creation error:', error);
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

export const processDummyPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod, cardDetails } = req.body;
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate dummy payment ID
    const paymentId = `dummy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate payment success (you can add logic here to simulate failures)
    const paymentSuccess = true;
    
    if (paymentSuccess) {
      // Update booking with payment details
      const updatedBooking = await bookingService.completeDummyPayment(bookingId, {
        paymentId,
        method: paymentMethod,
        status: 'completed'
      });
      
      res.json({
        success: true,
        message: 'Payment completed successfully',
        data: {
          booking: updatedBooking,
          paymentId,
          redirectUrl: `/checkout-success/${updatedBooking._id}`
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.'
      });
    }
  } catch (error) {
    next(error);
  }
};