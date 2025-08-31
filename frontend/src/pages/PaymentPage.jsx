import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { eventsAPI } from '../api/events';
import { bookingsAPI } from '../api/bookings';
import apiClient from '../api/client';
import PaymentForm from '../components/ui/PaymentForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ArrowLeft, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { 
    items, 
    eventId: cartEventId, 
    total, 
    clearCart 
  } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Get event details
  const { data: event, isLoading: eventLoading } = useQuery(
    ['event', eventId || cartEventId],
    () => eventsAPI.getEventById(eventId || cartEventId),
    {
      enabled: !!(eventId || cartEventId),
      onError: () => {
        toast.error('Failed to load event details');
      }
    }
  );

  // If no items in cart, redirect to events
  useEffect(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/events');
    }
  }, [items, navigate]);

  const handlePaymentSuccess = async (paymentData) => {
    setIsProcessing(true);
    
    try {
      console.log('🚀 Starting payment process...');
      console.log('🔑 Auth token:', localStorage.getItem('accessToken'));
      console.log('👤 User:', user);
      
      // Create booking first
      const orderData = {
        eventId: eventId || cartEventId,
        items: items.map(item => ({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity
        })),
        attendeeInfo: {
          name: user?.name || 'Guest',
          email: user?.email || 'guest@example.com',
          phone: user?.phone || '+91-0000000000'
        }
      };

      console.log('📦 Order data:', orderData);

      const order = await bookingsAPI.createOrder(orderData);
      console.log('✅ Order created:', order);

      // Process dummy payment using API client
      const paymentResult = await apiClient.post('/events/dummy-payment', {
        bookingId: order.booking.bookingId,
        paymentMethod: paymentData.method,
        cardDetails: {
          last4: '1234',
          brand: paymentData.method === 'credit' ? 'Visa' : 'Mastercard'
        }
      });

      console.log('💳 Payment result:', paymentResult);

      if (paymentResult.data.success) {
        setPaymentStatus('success');
        toast.success('Payment completed successfully!');
        
        // Clear cart after successful payment
        clearCart();
        
        // Redirect to success page after a delay
        setTimeout(() => {
          navigate(`/checkout-success/${order._id}`);
        }, 2000);
      } else {
        throw new Error(paymentResult.data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      setPaymentStatus('failed');
      toast.error(error.response?.data?.message || error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentFailure = (error) => {
    setPaymentStatus('failed');
    toast.error(error || 'Payment failed. Please try again.');
  };

  if (eventLoading) {
    return <LoadingSpinner />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Items to Pay</h2>
          <p className="text-gray-600 mb-6">Your cart is empty!</p>
          <button
            onClick={() => navigate('/events')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your ticket has been sent to your email.</p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500">Redirecting to success page...</p>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">Something went wrong with your payment.</p>
          <button
            onClick={() => setPaymentStatus(null)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mr-3"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/checkout')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            Back to Checkout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Checkout
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <PaymentForm
              amount={total}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {event && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">{event.title}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Date: {new Date(event.startAt).toLocaleDateString()}</p>
                    <p>Time: {new Date(event.startAt).toLocaleTimeString()}</p>
                    <p>Venue: {event.venue.address}, {event.venue.city}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Total ({items.reduce((sum, item) => sum + item.quantity, 0)} tickets)</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Complete your payment securely</li>
                  <li>• Receive confirmation email</li>
                  <li>• Get your ticket via email</li>
                  <li>• Show ticket at event entrance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
