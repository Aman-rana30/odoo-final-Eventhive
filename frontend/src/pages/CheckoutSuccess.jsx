import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { bookingsAPI } from '../api/bookings';
import { CheckCircle, Download, Mail, Calendar, MapPin, User, Ticket } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CheckoutSuccess = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: booking, isLoading } = useQuery(
    ['booking', bookingId],
    () => bookingsAPI.getBooking(bookingId),
    {
      onError: () => {
        toast.error('Failed to load booking details');
      }
    }
  );

  const handleDownloadTicket = async () => {
    if (!booking) return;
    
    setIsDownloading(true);
    try {
      const blob = await bookingsAPI.downloadTicket(bookingId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${booking.bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download ticket');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleResendTicket = async (method) => {
    try {
      await bookingsAPI.resendTicket(bookingId, method);
      toast.success(`Ticket sent via ${method} successfully!`);
    } catch (error) {
      toast.error(`Failed to send ticket via ${method}`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">Your booking has been confirmed and your ticket is ready.</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Ticket className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Booking ID</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.bookingId}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Attendee</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.attendeeInfo?.name || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Booking Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Event Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(booking.event?.startAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Venue</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {booking.event?.venue?.address}, {booking.event?.venue?.city}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Ticket className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-lg font-semibold text-green-600">₹{booking.total?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Get Your Ticket</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleDownloadTicket}
              disabled={isDownloading}
              className="flex items-center justify-center px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
            >
              <Download className="h-5 w-5 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
            
            <button
              onClick={() => handleResendTicket('email')}
              className="flex items-center justify-center px-4 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
            >
              <Mail className="h-5 w-5 mr-2" />
              Resend Email
            </button>
            
            <button
              onClick={() => handleResendTicket('whatsapp')}
              className="flex items-center justify-center px-4 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
            >
              <Mail className="h-5 w-5 mr-2" />
              Send WhatsApp
            </button>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Your ticket has been sent to your email address</li>
            <li>• Download and save the ticket on your device</li>
            <li>• Show the ticket at the event entrance</li>
            <li>• Keep your booking ID handy for any queries</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/my-bookings')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            View My Bookings
          </button>
          
          <button
            onClick={() => navigate('/events')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            Browse More Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
