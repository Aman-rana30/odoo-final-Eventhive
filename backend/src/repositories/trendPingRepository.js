import TrendPing from '../models/TrendPing.js';
import mongoose from 'mongoose';

class TrendPingRepository {
  async create(data) {
    const ping = new TrendPing(data);
    return await ping.save();
  }

  async getEventTrendData(eventId, hours = 48) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const trends = await TrendPing.aggregate([
      {
        $match: {
          eventId: new mongoose.Types.ObjectId(eventId),
          createdAt: { $gte: since }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    const trendData = {
      views: 0,
      addToCart: 0,
      purchases: 0
    };

    trends.forEach(trend => {
      if (trend._id === 'view') trendData.views = trend.count;
      if (trend._id === 'addToCart') trendData.addToCart = trend.count;
      if (trend._id === 'purchase') trendData.purchases = trend.count;
    });

    return trendData;
  }

  async calculateTrendingScore(eventId, hours = 48) {
    const trends = await this.getEventTrendData(eventId, hours);
    return (trends.purchases * 5) + (trends.addToCart * 2) + (trends.views * 1);
  }

  async cleanupOldData(days = 30) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await TrendPing.deleteMany({ createdAt: { $lt: cutoff } });
  }
}

export default new TrendPingRepository();