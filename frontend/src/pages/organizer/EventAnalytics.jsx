import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Ticket, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  Share2,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../api/events';
import { bookingsAPI } from '../../api/bookings';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EventAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  const { data: event, isLoading: eventLoading, error } = useQuery(
    ['event', id],
    () => eventsAPI.getEventById(id)
  );

  const { data: bookings, isLoading: bookingsLoading } = useQuery(
    ['eventBookings', id],
    () => bookingsAPI.getEventBookings(id),
    {
      enabled: !!id
    }
  );

  // Mock analytics data - in a real app, this would come from the backend
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    conversionRate: 0,
    revenue: 0,
    ticketsSold: 0,
    averageTicketPrice: 0,
    topReferrers: [],
    dailyStats: [],
    ticketTypeBreakdown: []
  });

  useEffect(() => {
    if (event && bookings) {
      // Calculate analytics from real data
      const totalBookings = bookings.length || 0;
      const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      const ticketsSold = bookings.reduce((sum, booking) => sum + (booking.tickets?.length || 0), 0);
      
      // Mock additional data
      const mockAnalytics = {
        totalViews: Math.floor(Math.random() * 1000) + 500,
        uniqueVisitors: Math.floor(Math.random() * 800) + 300,
        conversionRate: totalBookings > 0 ? ((totalBookings / (Math.floor(Math.random() * 1000) + 500)) * 100).toFixed(2) : 0,
        revenue: totalRevenue,
        ticketsSold: ticketsSold,
        averageTicketPrice: ticketsSold > 0 ? (totalRevenue / ticketsSold).toFixed(2) : 0,
        topReferrers: [
          { source: 'Direct', count: 45, percentage: 45 },
          { source: 'Social Media', count: 30, percentage: 30 },
          { source: 'Email', count: 15, percentage: 15 },
          { source: 'Search', count: 10, percentage: 10 }
        ],
        dailyStats: generateDailyStats(),
        ticketTypeBreakdown: event.tickets?.map(ticket => ({
          name: ticket.name,
          sold: Math.floor(Math.random() * ticket.maxQuantity),
          total: ticket.maxQuantity,
          revenue: Math.floor(Math.random() * ticket.maxQuantity) * ticket.price
        })) || []
      };
      
      setAnalytics(mockAnalytics);
    }
  }, [event, bookings]);

  const generateDailyStats = () => {
    const stats = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      stats.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 100) + 20,
        bookings: Math.floor(Math.random() * 10) + 1,
        revenue: Math.floor(Math.random() * 5000) + 500
      });
    }
    return stats;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (eventLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or you don't have permission.</p>
          <button
            onClick={() => navigate('/organizer')}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/organizer')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Analytics</h1>
              <p className="mt-2 text-gray-600">Detailed insights and performance metrics for your event.</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Event Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
              <p className="text-gray-600">{event.description}</p>
              <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(event.startAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {event.capacity} capacity
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {event.venue.city}, {event.venue.state}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12.5%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Ticket className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.ticketsSold}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8.2%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{analytics.revenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +15.3%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate}%</p>
                <p className="text-sm text-red-600 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  -2.1%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Performance</h3>
            <div className="space-y-4">
              {analytics.dailyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{new Date(stat.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">{stat.views} views, {stat.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{stat.revenue.toLocaleString()}</p>
                    <p className="text-sm text-green-600">+{Math.floor(Math.random() * 20) + 5}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Type Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Ticket Type Breakdown</h3>
            <div className="space-y-4">
              {analytics.ticketTypeBreakdown.map((ticket, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{ticket.name}</p>
                    <p className="text-sm text-gray-500">{ticket.sold} / {ticket.total} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{ticket.revenue.toLocaleString()}</p>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(ticket.sold / ticket.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.topReferrers.map((referrer, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{referrer.source}</p>
                  <p className="text-sm text-gray-500">{referrer.percentage}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${referrer.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{referrer.count} visitors</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          {bookingsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tickets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.slice(0, 10).map((booking) => (
                    <tr key={booking._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.user?.name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500">{booking.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.tickets?.length || 0} tickets
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{booking.totalAmount?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bookings yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics;
