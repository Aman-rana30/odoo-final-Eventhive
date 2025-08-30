import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Ticket, TrendingUp, Plus, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch admin stats from API
    // For now, using mock data
    setStats({
      totalUsers: 1250,
      totalEvents: 45,
      totalBookings: 890,
      totalRevenue: 125000
    });
    setRecentEvents([
      { id: 1, title: 'React Developer Conference', status: 'Published', bookings: 150 },
      { id: 2, title: 'Music Festival Mumbai', status: 'Published', bookings: 320 },
      { id: 3, title: 'Tech Startup Meetup', status: 'Draft', bookings: 0 }
    ]);
    setIsLoading(false);
  }, []);

  const quickActions = [
    {
      title: 'Create Event',
      description: 'Create a new event',
      icon: Plus,
      link: '/organizer/events/create',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      link: '/admin/users',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Event Analytics',
      description: 'View event performance metrics',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: Settings,
      link: '/admin/settings',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.name}! Manage your platform and events.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Ticket className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className={`${action.color} text-white rounded-lg p-6 transition-colors duration-200`}
            >
              <div className="flex items-center">
                <action.icon className="h-8 w-8 mr-3" />
                <div>
                  <h3 className="font-semibold text-lg">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
        </div>
        <div className="p-6">
          {recentEvents.length > 0 ? (
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.bookings} bookings</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.status === 'Published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                    <Link
                      to={`/organizer/events/${event.id}/analytics`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No events found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
