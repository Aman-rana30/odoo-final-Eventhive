import React from 'react';
import { useParams } from 'react-router-dom';

const EventDetails = () => {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Event Details Page
          </h1>
          <p className="text-lg text-gray-700">
            This is a placeholder for the event with slug: <strong>{slug}</strong>.
          </p>
          <p className="mt-4 text-gray-600">
            You can now build out the detailed view for your events here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
