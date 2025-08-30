import React from 'react';
import { useParams } from 'react-router-dom';

const CheckoutSuccess = () => {
  const { bookingId } = useParams();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-green-600">Checkout Successful!</h1>
      <p className="mt-4 text-gray-600">Your booking with ID: {bookingId} is confirmed.</p>
    </div>
  );
};

export default CheckoutSuccess;
