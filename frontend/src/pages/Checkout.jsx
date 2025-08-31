import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { eventsAPI } from '../api/events';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, MapPin, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    items, 
    eventId: cartEventId, 
    subtotal, 
    total, 
    discount, 
    appliedCoupon,
    removeItem, 
    updateQuantity, 
    clearCart 
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Get event details if we have an eventId
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

  const handleQuantityChange = (ticketTypeId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(ticketTypeId);
    } else {
      updateQuantity(ticketTypeId, newQuantity);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      // TODO: Implement coupon API call
      toast.success('Coupon applied successfully!');
      setCouponCode('');
    } catch (error) {
      toast.error('Invalid coupon code');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleProceedToPayment = () => {
    // Navigate to payment page
    navigate('/payment');
  };

  if (eventLoading) {
    return <LoadingSpinner />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some tickets to get started!</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Tickets</h2>
              
              {event && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.startAt).toLocaleDateString()} at {new Date(event.startAt).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.venue.address}, {event.venue.city}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.ticketTypeId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">₹{item.price.toLocaleString()} per ticket</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.ticketTypeId, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.ticketTypeId, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.ticketTypeId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Have a Coupon?</h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isApplyingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </div>
              {appliedCoupon && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    Coupon "{appliedCoupon.code}" applied! Discount: ₹{discount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} tickets)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Payment
              </button>

              <button
                onClick={clearCart}
                className="w-full mt-3 text-gray-600 hover:text-red-600 text-sm"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
