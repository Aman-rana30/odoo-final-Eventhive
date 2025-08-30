import ticketService from '../services/ticketService.js';
import { validationResult } from 'express-validator';

export const getEventTickets = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const tickets = await ticketService.getEventTickets(eventId);

    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

export const createTicketType = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { eventId } = req.params;
    const ticketData = { ...req.body, eventId };
    
    const ticket = await ticketService.createTicketType(ticketData, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Ticket type created successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await ticketService.updateTicketType(id, req.body, req.user.id);

    res.json({
      success: true,
      message: 'Ticket type updated successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTicketType = async (req, res, next) => {
  try {
    const { id } = req.params;
    await ticketService.deleteTicketType(id, req.user.id);

    res.json({
      success: true,
      message: 'Ticket type deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const checkAvailability = async (req, res, next) => {
  try {
    const { ticketTypeId } = req.params;
    const { quantity } = req.query;
    
    const availability = await ticketService.checkTicketAvailability(
      ticketTypeId,
      parseInt(quantity) || 1
    );

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    next(error);
  }
};