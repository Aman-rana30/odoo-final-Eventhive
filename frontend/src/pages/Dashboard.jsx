import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Calendar, 
  Ticket, 
  TrendingUp, 
  Users, 
  Settings,
  Plus,
  BarChart3,
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../api/bookings';
import { eventsAPI } from '../api/events';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';

const Dashboard = () => {
  const { user, hasRole } = useAuth();

  const { data: recentBookings, isLoading: bookingsLoading } = useQuery(
    'myRecentBookings',
    () => bookingsAPI.getMyBookings({ page: 1, limit: 5 })
  );

  const { data: myEvents, isLoading: eventsLoading } = useQuery(
    'myEvents',
    () => hasRole('EventManager') ? eventsAPI.getMyEvents({ page: 1, limit: 5 }) : null,
    {
      enabled: hasRole('EventManager') || hasRole('Admin')
    }
  );

  const quickActions = [
    {
      title: 'Browse Events',
      description: 'Discover amazing events',
      icon: Calendar,
      href: '/events',
      color: 'bg-blue-500'
    },
    {
      title: 'My Bookings',
      description: 'View your tickets',
      icon: Ticket,
      href: '/my-bookings',
      color: 'bg-green-500'
    }
  ];

  if (hasRole('EventManager') || hasRole('Admin')) {
    quickActions.push(
      {
        title: 'Create Event',
        description: 'Organize a new event',
        icon: Plus,
        href: '/organizer/events/create',
        color: 'bg-purple-500'
      },
      {
        title: 'Organizer Panel',
        description: 'Manage your events',
        icon: BarChart3,
        href: '/organizer',
        color: 'bg-orange-500'
      }
    );
  }

  if (hasRole('Volunteer') || hasRole('EventManager') || hasRole('Admin')) {
    quickActions.push({
      title: 'Check-in Scanner',
      description: 'Scan event tickets',
      icon: QrCode,
      href: '/checkin',
      color: 'bg-indigo-500'
    });
  }

  if (hasRole('Admin')) {
    quickActions.push({
      title: 'Admin Panel',
      description: 'System administration',
      icon: Settings,
      href: '/admin',
      color: 'bg-red-500'
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your EventHive account
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentBookings?.total || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.loyaltyPoints || 0}
                </p>
              </div>
            </div>
          </div>

          {(hasRole('EventManager') || hasRole('Admin')) && (
            <div className="card">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Events</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {myEvents?.total || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="card hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${action.color} p-3 rounded-lg`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
              <Link
                to="/my-bookings"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {bookingsLoading ? (
              <LoadingSpinner size="small" />
            ) : recentBookings?.bookings?.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {booking.eventId.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.eventId.startAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          booking.status === 'Paid' ? 'success' : 
                          booking.status === 'Pending' ? 'warning' : 'error'
                        }
                      >
                        {booking.status}
                      </Badge>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        ₹{booking.total}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No bookings yet</p>
                <Link to="/events" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Browse Events
                </Link>
              </div>
            )}
          </div>

          {/* My Events (for organizers) */}
          {(hasRole('EventManager') || hasRole('Admin')) && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">My Events</h2>
                <Link
                  to="/organizer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>

              {eventsLoading ? (
                <LoadingSpinner size="small" />
              ) : myEvents?.events?.length > 0 ? (
                <div className="space-y-3">
                  {myEvents.events.map((event) => (
                    <div
                      key={event._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(event.startAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            event.status === 'Published' ? 'success' : 
                            event.status === 'Draft' ? 'warning' : 'error'
                          }
                        >
                          {event.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.ticketsSold}/{event.capacity} sold
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No events created yet</p>
                  <Link 
                    to="/organizer/events/create" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Create Your First Event
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;