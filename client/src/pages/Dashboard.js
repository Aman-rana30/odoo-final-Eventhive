import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiCalendar, FiTag, FiTrendingUp, FiUser, FiPlus } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const stats = [
    {
      title: 'Upcoming Events',
      value: '5',
      icon: FiCalendar,
      color: 'bg-blue-500',
      link: '/tickets',
    },
    {
      title: 'Total Tickets',
      value: '12',
      icon: FiTag,
      color: 'bg-green-500',
      link: '/tickets',
    },
    {
      title: 'Events Attended',
      value: '8',
      icon: FiTrendingUp,
      color: 'bg-purple-500',
      link: '/history',
    },
    {
      title: 'Loyalty Points',
      value: user?.loyaltyPoints || '0',
      icon: FiUser,
      color: 'bg-yellow-500',
      link: '/profile',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your events
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.link}
                className="card p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-4">
              <Link
                to="/events"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiCalendar className="w-5 h-5 text-indigo-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Browse Events</div>
                  <div className="text-sm text-gray-500">Discover new events near you</div>
                </div>
              </Link>

              <Link
                to="/tickets"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiTag className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">My Tickets</div>
                  <div className="text-sm text-gray-500">View your purchased tickets</div>
                </div>
              </Link>

              {user?.role === 'organizer' && (
                <Link
                  to="/organizer/create-event"
                  className="flex items-center p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white hover:from-indigo-600 hover:to-purple-700 transition-all"
                >
                  <FiPlus className="w-5 h-5 mr-3" />
                  <div>
                    <div className="font-medium">Create Event</div>
                    <div className="text-sm text-indigo-100">Start organizing your event</div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Ticket purchased for "Tech Conference 2025"
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Profile updated successfully
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Attended "Music Festival 2025"
                  </p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>

              <div className="text-center pt-4">
                <Link to="/history" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                  View all activity →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;