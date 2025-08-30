import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiClock, FiUser } from 'react-icons/fi';
import { formatDate, formatCurrency, getEventCategory } from '../utils/helpers';

const EventCard = ({ event, className = '' }) => {
  const minPrice = Math.min(...event.ticketTypes.map(t => t.price));

  return (
    <div className={`card event-card ${className}`}>
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        {event.banner?.url ? (
          <img
            src={event.banner.url}
            alt={event.title}
            className="w-full h-full object-cover event-image transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <FiCalendar className="w-16 h-16 text-white opacity-50" />
          </div>
        )}

        {/* Event Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white bg-opacity-90 text-xs font-medium px-2 py-1 rounded-full">
            {getEventCategory(event.category).replace(/[^a-zA-Z\s]/g, '')}
          </span>
        </div>

        {/* Featured Badge */}
        {event.featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-1 rounded-full">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.shortDescription || event.description}
        </p>

        {/* Event Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <FiCalendar className="w-4 h-4 mr-2" />
            <span>{formatDate(event.startDate)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <FiClock className="w-4 h-4 mr-2" />
            <span>{event.startTime || 'Time TBD'}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <FiMapPin className="w-4 h-4 mr-2" />
            <span className="line-clamp-1">{event.venue.name}, {event.venue.city}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <FiUser className="w-4 h-4 mr-2" />
            <span>{event.organizer?.firstName} {event.organizer?.lastName}</span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">Starting from</span>
            <div className="text-lg font-bold text-indigo-600">
              {minPrice === 0 ? 'FREE' : formatCurrency(minPrice)}
            </div>
          </div>

          <Link
            to={`/events/${event._id}`}
            className="btn btn-primary"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
