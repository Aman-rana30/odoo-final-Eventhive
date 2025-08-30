import ticketRepository from '../repositories/ticketRepository.js';
import eventRepository from '../repositories/eventRepository.js';

class TicketService {
  async createTicketType(ticketData, userId) {
    // Verify user owns the event
    const event = await eventRepository.findById(ticketData.eventId);
    if (!event || event.organizer._id.toString() !== userId) {
      throw new Error('Unauthorized to create tickets for this event');
    }

    return await ticketRepository.create(ticketData);
  }

  async updateTicketType(ticketId, updateData, userId) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket type not found');
    }

    // Verify user owns the event
    if (ticket.eventId.organizer.toString() !== userId) {
      throw new Error('Unauthorized to update this ticket type');
    }

    return await ticketRepository.update(ticketId, updateData);
  }

  async deleteTicketType(ticketId, userId) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket type not found');
    }

    // Verify user owns the event
    if (ticket.eventId.organizer.toString() !== userId) {
      throw new Error('Unauthorized to delete this ticket type');
    }

    return await ticketRepository.delete(ticketId);
  }

  async getEventTickets(eventId) {
    return await ticketRepository.findByEventId(eventId);
  }

  async checkTicketAvailability(ticketTypeId, quantity) {
    return await ticketRepository.checkAvailability(ticketTypeId, quantity);
  }
}

export default new TicketService();