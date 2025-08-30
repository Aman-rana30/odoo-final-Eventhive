import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Ticket, TrendingUp, Plus, Edit, BarChart3, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../api/events';
import toast from 'react-hot-toast';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await eventsAPI.getMyEvents();
      setEvents(response);
      
      // Calculate stats
      const totalEvents = response.length;
      const publishedEvents = response.filter(event => event.status === 'Published').length;
      const totalBookings = response.reduce((sum, event) => sum + (event.ticketsSold || 0), 0);
      const totalRevenue = response.reduce((sum, event) => sum + (event.revenue || 0), 0);
      
      setStats({
        totalEvents,
        publishedEvents,
        totalBookings,
        totalRevenue
      });
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.name}! Manage your events and track performance.
            </p>
          </div>
          <Link
            to="/organizer/events/create"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Event
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedEvents}</p>
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

      {/* Events List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">My Events</h2>
        </div>
        <div className="p-6">
          {events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event._id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Category:</span> {event.category}
                        </div>
                        <div>
                          <span className="font-medium">Capacity:</span> {event.capacity}
                        </div>
                        <div>
                          <span className="font-medium">Bookings:</span> {event.ticketsSold || 0}
                        </div>
                        <div>
                          <span className="font-medium">Revenue:</span> ₹{(event.revenue || 0).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-500">
                        <span className="font-medium">Venue:</span> {event.venue?.address}, {event.venue?.city}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Date:</span> {new Date(event.startAt).toLocaleDateString()} - {new Date(event.endAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Link
                        to={`/events/${event.slug}`}
                        className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      <Link
                        to={`/organizer/events/${event._id}/edit`}
                        className="inline-flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-800"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <Link
                        to={`/organizer/events/${event._id}/analytics`}
                        className="inline-flex items-center px-3 py-1 text-sm text-purple-600 hover:text-purple-800"
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analytics
                      </Link>
                      <Link
                        to={`/organizer/events/${event._id}/bookings`}
                        className="inline-flex items-center px-3 py-1 text-sm text-orange-600 hover:text-orange-800"
                      >
                        <Ticket className="h-4 w-4 mr-1" />
                        Bookings
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first event.</p>
              <div className="mt-6">
                <Link
                  to="/organizer/events/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Event
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
