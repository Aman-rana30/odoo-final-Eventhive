import React from 'react';
import { useParams } from 'react-router-dom';

const Checkout = () => {
  const { eventId } = useParams();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      <p className="mt-4 text-gray-600">Checkout page for event ID: {eventId}</p>
    </div>
  );
};

export default Checkout;
