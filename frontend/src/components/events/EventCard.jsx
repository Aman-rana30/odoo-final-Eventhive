import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import Badge from '../ui/Badge';

const EventCard = ({ event }) => {
  const getLowestPrice = () => {
    if (!event.tickets || event.tickets.length === 0) return null;
    return Math.min(...event.tickets.map(ticket => ticket.price));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const lowestPrice = getLowestPrice();

  return (
    <Link to={`/events/${event.slug}`} className="block">
      <div className="event-card">
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          {event.coverImageUrl ? (
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white">
              <Calendar className="h-12 w-12" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex space-x-2">
            {event.featured && (
              <Badge variant="warning" size="small">
                Featured
              </Badge>
            )}
            <Badge variant="primary" size="small">
              {event.category}
            </Badge>
          </div>

          {/* Price */}
          {lowestPrice !== null && (
            <div className="absolute top-3 right-3 bg-white rounded-lg px-2 py-1 shadow-sm">
              <span className="text-sm font-bold text-gray-900">
                {lowestPrice === 0 ? 'Free' : `₹${lowestPrice}+`}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
            {event.title}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              <span>{formatDate(event.startAt)} • {formatTime(event.startAt)}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
              <span className="truncate">{event.venue.city}, {event.venue.state}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1 text-blue-600" />
                <span>{event.capacity - event.ticketsSold} spots left</span>
              </div>
              
              {event.rating.count > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                  <span>{event.rating.average.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;