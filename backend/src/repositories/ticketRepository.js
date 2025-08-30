import TicketType from '../models/TicketType.js';

class TicketRepository {
  async create(ticketData) {
    const ticket = new TicketType(ticketData);
    return await ticket.save();
  }

  async findById(id) {
    return await TicketType.findById(id).populate('eventId', 'title organizer');
  }

  async findByEventId(eventId) {
    return await TicketType.find({ eventId, isActive: true });
  }

  async update(id, updateData) {
    return await TicketType.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  async delete(id) {
    return await TicketType.findByIdAndUpdate(id, { isActive: false });
  }

  async findByPriceRange(priceFilter) {
    return await TicketType.find({ price: priceFilter, isActive: true });
  }

  async decrementQuantity(id, quantity) {
    const result = await TicketType.findOneAndUpdate(
      { 
        _id: id, 
        remainingQuantity: { $gte: quantity },
        isActive: true
      },
      { $inc: { remainingQuantity: -quantity } },
      { new: true }
    );

    if (!result) {
      throw new Error('Insufficient ticket quantity or ticket not available');
    }

    return result;
  }

  async incrementQuantity(id, quantity) {
    return await TicketType.findByIdAndUpdate(
      id,
      { $inc: { remainingQuantity: quantity } },
      { new: true }
    );
  }

  async checkAvailability(id, quantity, userId) {
    const ticket = await this.findById(id);
    if (!ticket) {
      return { available: false, reason: 'Ticket type not found' };
    }

    const now = new Date();
    if (now < ticket.saleStartAt) {
      return { available: false, reason: 'Sale not started yet' };
    }

    if (now > ticket.saleEndAt) {
      return { available: false, reason: 'Sale has ended' };
    }

    if (ticket.remainingQuantity < quantity) {
      return { available: false, reason: 'Insufficient tickets available' };
    }

    // Check per-user limit if userId provided
    if (userId) {
      const userBookings = await this.getUserBookingCount(id, userId);
      if (userBookings + quantity > ticket.perUserLimit) {
        return { 
          available: false, 
          reason: `Exceeds per-user limit of ${ticket.perUserLimit}` 
        };
      }
    }

    return { available: true, ticket };
  }

  async getUserBookingCount(ticketTypeId, userId) {
    // This would need to be implemented with booking aggregation
    // For now, return 0 as placeholder
    return 0;
  }
}

export default new TicketRepository();