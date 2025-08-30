import Event from '../models/Event.js';
import Booking from '../models/Booking.js';

class EventRepository {
  async create(eventData) {
    const event = new Event(eventData);
    return await event.save();
  }

  async findById(id) {
    return await Event.findById(id).populate('organizer', 'name email');
  }

  async findBySlug(slug) {
    return await Event.findOne({ slug }).populate('organizer', 'name email');
  }

  async findWithFilters({ filters, page, limit, sort }) {
    const skip = (page - 1) * limit;
    
    const [events, total] = await Promise.all([
      Event.find(filters)
        .populate('organizer', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Event.countDocuments(filters)
    ]);

    return { events, total };
  }

  async update(id, updateData) {
    return await Event.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    }).populate('organizer', 'name email');
  }

  async delete(id) {
    return await Event.findByIdAndDelete(id);
  }

  async findFeatured() {
    return await Event.find({ 
      status: 'Published', 
      featured: true,
      startAt: { $gte: new Date() }
    })
    .populate('organizer', 'name email')
    .sort({ startAt: 1 })
    .limit(6);
  }

  async findTrending() {
    return await Event.find({ 
      status: 'Published',
      startAt: { $gte: new Date() }
    })
    .populate('organizer', 'name email')
    .sort({ trendingScore: -1 })
    .limit(8);
  }

  async hasBookings(eventId) {
    const bookingCount = await Booking.countDocuments({ 
      eventId,
      status: { $in: ['Paid', 'Pending'] }
    });
    return bookingCount > 0;
  }

  async updateTrendingScore(eventId, score) {
    return await Event.findByIdAndUpdate(eventId, { trendingScore: score });
  }

  async updateRevenue(eventId, amount) {
    return await Event.findByIdAndUpdate(
      eventId,
      { 
        $inc: { 
          revenue: amount,
          ticketsSold: 1
        }
      }
    );
  }

  async getCategories() {
    return await Event.distinct('category', { status: 'Published' });
  }

  async getCities() {
    return await Event.distinct('venue.city', { status: 'Published' });
  }
}

export default new EventRepository();