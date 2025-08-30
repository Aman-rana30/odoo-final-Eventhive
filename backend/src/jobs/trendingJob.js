import eventRepository from '../repositories/eventRepository.js';
import trendPingRepository from '../repositories/trendPingRepository.js';
import Event from '../models/Event.js';

export const trendingJob = async () => {
  try {
    console.log('📈 Running trending calculation job...');
    
    // Get all published events
    const events = await Event.find({ 
      status: 'Published',
      startAt: { $gte: new Date() }
    });

    for (const event of events) {
      const trendingScore = await trendPingRepository.calculateTrendingScore(event._id);
      await eventRepository.updateTrendingScore(event._id, trendingScore);
    }

    // Cleanup old trend data
    await trendPingRepository.cleanupOldData(30);

    console.log(`📈 Trending job completed for ${events.length} events`);
  } catch (error) {
    console.error('📈 Trending job error:', error);
  }
};