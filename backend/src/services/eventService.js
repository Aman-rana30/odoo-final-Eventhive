import eventRepository from '../repositories/eventRepository.js';
import ticketRepository from '../repositories/ticketRepository.js';
import trendPingRepository from '../repositories/trendPingRepository.js';

class EventService {
  async getEvents({ filters, page, limit, sort, minPrice, maxPrice }) {
    // Add price filtering if specified
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = minPrice;
      if (maxPrice) priceFilter.$lte = maxPrice;
      
      // Get events with tickets in price range
      const ticketsInRange = await ticketRepository.findByPriceRange(priceFilter);
      const eventIds = [...new Set(ticketsInRange.map(t => t.eventId.toString()))];
      
      if (eventIds.length > 0) {
        filters._id = { $in: eventIds };
      } else {
        // No events match price criteria
        return { events: [], total: 0, pages: 0 };
      }
    }

    const result = await eventRepository.findWithFilters({
      filters,
      page,
      limit,
      sort: this.parseSortOption(sort)
    });

    return {
      events: result.events,
      total: result.total,
      pages: Math.ceil(result.total / limit),
      currentPage: page
    };
  }

  async getEventById(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Get ticket types
    const tickets = await ticketRepository.findByEventId(eventId);
    
    return {
      ...event.toObject(),
      tickets
    };
  }

  async getEventBySlug(slug) {
    const event = await eventRepository.findBySlug(slug);
    if (!event) {
      throw new Error('Event not found');
    }

    // Get ticket types
    const tickets = await ticketRepository.findByEventId(event._id);
    
    return {
      ...event.toObject(),
      tickets
    };
  }

  async createEvent(eventData) {
    // Validate organizer permissions
    if (!eventData.organizer) {
      throw new Error('Organizer is required');
    }

    const event = await eventRepository.create(eventData);
    return event;
  }

  async updateEvent(eventId, updateData, userId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check permissions
    if (event.organizer.toString() !== userId) {
      throw new Error('Not authorized to update this event');
    }

    const updatedEvent = await eventRepository.update(eventId, updateData);
    return updatedEvent;
  }

  async deleteEvent(eventId, userId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check permissions
    if (event.organizer.toString() !== userId) {
      throw new Error('Not authorized to delete this event');
    }

    // Check if event has bookings
    const hasBookings = await eventRepository.hasBookings(eventId);
    if (hasBookings) {
      throw new Error('Cannot delete event with existing bookings');
    }

    await eventRepository.delete(eventId);
  }

  async publishEvent(eventId, userId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check permissions
    if (event.organizer.toString() !== userId) {
      throw new Error('Not authorized to publish this event');
    }

    // Validate event has required data for publishing
    const tickets = await ticketRepository.findByEventId(eventId);
    if (tickets.length === 0) {
      throw new Error('Event must have at least one ticket type to be published');
    }

    const updatedEvent = await eventRepository.update(eventId, { status: 'Published' });
    return updatedEvent;
  }

  async getFeaturedEvents() {
    return await eventRepository.findFeatured();
  }

  async getTrendingEvents() {
    return await eventRepository.findTrending();
  }

  async trackEventAction(eventId, action, metadata = {}) {
    await trendPingRepository.create({
      eventId,
      action,
      ...metadata
    });
  }

  async getEventsByOrganizer(organizerId, { page, limit, status }) {
    const filters = { organizer: organizerId };
    if (status) {
      filters.status = status;
    }

    const result = await eventRepository.findWithFilters({
      filters,
      page,
      limit,
      sort: { createdAt: -1 }
    });

    return {
      events: result.events,
      total: result.total,
      pages: Math.ceil(result.total / limit),
      currentPage: page
    };
  }

  parseSortOption(sort) {
    const sortOptions = {
      'startAt': { startAt: 1 },
      '-startAt': { startAt: -1 },
      'price': { 'minPrice': 1 },
      '-price': { 'minPrice': -1 },
      'trending': { trendingScore: -1 },
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 }
    };

    return sortOptions[sort] || { startAt: 1 };
  }
}

export default new EventService();