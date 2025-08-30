import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Star, 
  Share2, 
  Heart,
  Ticket,
  ArrowLeft,
  Eye,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { eventsAPI } from '../api/events';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addItem, setEvent } = useCart();
  const [selectedTickets, setSelectedTickets] = useState({});
  const [isLiked, setIsLiked] = useState(false);

  const { data: event, isLoading, error } = useQuery(
    ['event', slug],
    () => eventsAPI.getEventBySlug(slug),
    {
      onSuccess: (data) => {
        // Track event view
        eventsAPI.trackEventView(data._id);
      }
    }
  );

  useEffect(() => {
    if (event?.tickets) {
      const initialTickets = {};
      event.tickets.forEach(ticket => {
        initialTickets[ticket._id] = 0;
      });
      setSelectedTickets(initialTickets);
    }
  }, [event]);

  const handleTicketChange = (ticketId, change) => {
    setSelectedTickets(prev => {
      const current = prev[ticketId] || 0;
      const newValue = Math.max(0, current + change);
      return { ...prev, [ticketId]: newValue };
    });
  };

  const handleAddToCart = () => {
    const ticketsToAdd = Object.entries(selectedTickets)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticket = event.tickets.find(t => t._id === ticketId);
        return {
          ticketTypeId: ticketId,
          quantity,
          price: ticket.price,
          name: ticket.name
        };
      });

    if (ticketsToAdd.length === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    // Set the event in cart
    setEvent(event._id);
    
    // Add each ticket to cart
    ticketsToAdd.forEach(ticket => {
      addItem(ticket);
    });

    toast.success('Tickets added to cart!');
    navigate('/checkout/' + event._id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/events')}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return <LoadingSpinner />;
  }

  const totalSelected = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(selectedTickets).reduce((sum, [ticketId, quantity]) => {
    const ticket = event.tickets.find(t => t._id === ticketId);
    return sum + (ticket?.price || 0) * quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              {event.coverImageUrl ? (
                <img
                  src={event.coverImageUrl}
                  alt={event.title}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-white opacity-50" />
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg">{event.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-full ${isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-red-100 hover:text-red-600`}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">
                      {new Date(event.startAt).toLocaleDateString()} - {new Date(event.endAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.startAt).toLocaleTimeString()} - {new Date(event.endAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Venue</p>
                    <p className="font-medium">{event.venue.address}</p>
                    <p className="text-sm text-gray-500">{event.venue.city}, {event.venue.state}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Capacity</p>
                    <p className="font-medium">{event.capacity} people</p>
                    <p className="text-sm text-gray-500">{event.ticketsSold || 0} tickets sold</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium capitalize">{event.category}</p>
                    <p className="text-sm text-gray-500">{event.venue.type} venue</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizer Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Organized by</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{event.organizer?.name || 'Event Organizer'}</p>
                    <p className="text-sm text-gray-500">{event.organizer?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Get Tickets</h2>
              
              {event.tickets && event.tickets.length > 0 ? (
                <>
                  {/* Ticket Types */}
                  <div className="space-y-4 mb-6">
                    {event.tickets.map((ticket) => (
                      <div key={ticket._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{ticket.name}</h3>
                            <p className="text-sm text-gray-500">{ticket.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{ticket.price}</p>
                            <p className="text-sm text-gray-500">
                              {ticket.maxQuantity - (ticket.soldQuantity || 0)} available
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleTicketChange(ticket._id, -1)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{selectedTickets[ticket._id] || 0}</span>
                            <button
                              onClick={() => handleTicketChange(ticket._id, 1)}
                              disabled={selectedTickets[ticket._id] >= (ticket.maxQuantity - (ticket.soldQuantity || 0))}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm font-medium">
                            ₹{(ticket.price * (selectedTickets[ticket._id] || 0)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  {totalSelected > 0 && (
                    <div className="border-t pt-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Total ({totalSelected} tickets)</span>
                        <span className="font-semibold text-lg">₹{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {isAuthenticated ? (
                      <button
                        onClick={handleAddToCart}
                        disabled={totalSelected === 0}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <Ticket className="h-5 w-5 mr-2" />
                        {totalSelected === 0 ? 'Select Tickets' : 'Add to Cart'}
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/login', { state: { from: `/events/${slug}` } })}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
                      >
                        Login to Book Tickets
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tickets available for this event</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
