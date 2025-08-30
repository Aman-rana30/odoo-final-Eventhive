import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  Ticket,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../api/events';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const { data: events, isLoading: eventsLoading } = useQuery(
    ['allEvents'],
    () => eventsAPI.getEvents({ limit: 1000 })
  );

  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeEvents: 0,
    completedEvents: 0,
    userGrowth: 0,
    revenueGrowth: 0,
    bookingGrowth: 0,
    eventGrowth: 0,
    topEvents: [],
    userDemographics: [],
    platformUsage: [],
    revenueByCategory: [],
    monthlyStats: []
  });

  useEffect(() => {
    if (events) {
      // Calculate analytics from real data
      const totalEvents = events.length || 0;
      const activeEvents = events.filter(event => event.status === 'Published').length;
      const completedEvents = events.filter(event => new Date(event.endAt) < new Date()).length;
      
      // Mock additional data
      const mockAnalytics = {
        totalUsers: 1250,
        totalEvents: totalEvents,
        totalBookings: 890,
        totalRevenue: 125000,
        activeEvents: activeEvents,
        completedEvents: completedEvents,
        userGrowth: 12.5,
        revenueGrowth: 18.3,
        bookingGrowth: 8.7,
        eventGrowth: 15.2,
        topEvents: events.slice(0, 5).map(event => ({
          title: event.title,
          bookings: Math.floor(Math.random() * 100) + 10,
          revenue: Math.floor(Math.random() * 10000) + 1000
        })),
        userDemographics: [
          { age: '18-24', percentage: 25 },
          { age: '25-34', percentage: 35 },
          { age: '35-44', percentage: 20 },
          { age: '45+', percentage: 20 }
        ],
        platformUsage: [
          { platform: 'Desktop', percentage: 45 },
          { platform: 'Mobile', percentage: 40 },
          { platform: 'Tablet', percentage: 15 }
        ],
        revenueByCategory: [
          { category: 'Conferences', revenue: 45000 },
          { category: 'Workshops', revenue: 30000 },
          { category: 'Concerts', revenue: 25000 },
          { category: 'Sports', revenue: 15000 }
        ],
        monthlyStats: generateMonthlyStats()
      };
      
      setAnalytics(mockAnalytics);
    }
  }, [events]);

  const generateMonthlyStats = () => {
    const stats = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      stats.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        users: Math.floor(Math.random() * 100) + 50,
        events: Math.floor(Math.random() * 20) + 5,
        bookings: Math.floor(Math.random() * 200) + 50,
        revenue: Math.floor(Math.random() * 15000) + 5000
      });
    }
    return stats;
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  if (eventsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
              <p className="mt-2 text-gray-600">Comprehensive insights and performance metrics for EventHive platform.</p>
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
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers.toLocaleString()}</p>
                <p className={`text-sm flex items-center ${getGrowthColor(analytics.userGrowth)}`}>
                  {getGrowthIcon(analytics.userGrowth)}
                  <span className="ml-1">{Math.abs(analytics.userGrowth)}% from last month</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalEvents}</p>
                <p className={`text-sm flex items-center ${getGrowthColor(analytics.eventGrowth)}`}>
                  {getGrowthIcon(analytics.eventGrowth)}
                  <span className="ml-1">{Math.abs(analytics.eventGrowth)}% from last month</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Ticket className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalBookings.toLocaleString()}</p>
                <p className={`text-sm flex items-center ${getGrowthColor(analytics.bookingGrowth)}`}>
                  {getGrowthIcon(analytics.bookingGrowth)}
                  <span className="ml-1">{Math.abs(analytics.bookingGrowth)}% from last month</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{analytics.totalRevenue.toLocaleString()}</p>
                <p className={`text-sm flex items-center ${getGrowthColor(analytics.revenueGrowth)}`}>
                  {getGrowthIcon(analytics.revenueGrowth)}
                  <span className="ml-1">{Math.abs(analytics.revenueGrowth)}% from last month</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
            <div className="space-y-4">
              {analytics.monthlyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{stat.month}</p>
                    <p className="text-sm text-gray-500">{stat.events} events, {stat.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{stat.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{stat.users} new users</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Events */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performing Events</h3>
            <div className="space-y-4">
              {analytics.topEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{event.revenue.toLocaleString()}</p>
                    <p className="text-sm text-green-600">+{Math.floor(Math.random() * 20) + 5}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Demographics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">User Demographics</h3>
            <div className="space-y-3">
              {analytics.userDemographics.map((demo, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{demo.age}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${demo.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8">{demo.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Usage */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Platform Usage</h3>
            <div className="space-y-3">
              {analytics.platformUsage.map((platform, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {platform.platform === 'Desktop' && <Monitor className="h-4 w-4 text-blue-600" />}
                    {platform.platform === 'Mobile' && <Smartphone className="h-4 w-4 text-green-600" />}
                    {platform.platform === 'Tablet' && <Globe className="h-4 w-4 text-purple-600" />}
                    <span className="text-sm font-medium">{platform.platform}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${platform.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8">{platform.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Category */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
            <div className="space-y-3">
              {analytics.revenueByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${(category.revenue / analytics.totalRevenue) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">₹{category.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Status Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Event Status Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.activeEvents}</div>
              <div className="text-sm text-green-600">Active Events</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.completedEvents}</div>
              <div className="text-sm text-blue-600">Completed Events</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{analytics.totalEvents - analytics.activeEvents - analytics.completedEvents}</div>
              <div className="text-sm text-gray-600">Draft Events</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
