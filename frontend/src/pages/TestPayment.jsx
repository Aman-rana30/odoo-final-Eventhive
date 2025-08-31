import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentForm from '../components/ui/PaymentForm';
import { ArrowLeft } from 'lucide-react';

const TestPayment = () => {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);

  const handlePaymentSuccess = (data) => {
    setPaymentData(data);
    console.log('Payment form submitted with:', data);
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Test Payment Flow</h1>
          <p className="text-gray-600 mt-2">This page tests the payment form component</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Form</h2>
            <PaymentForm
              amount={1500}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
            />
          </div>

          {/* Payment Data Display */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Data</h2>
            <div className="bg-white rounded-lg shadow p-6">
              {paymentData ? (
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Payment ID:</span>
                    <span className="ml-2 text-gray-900">{paymentData.paymentId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Method:</span>
                    <span className="ml-2 text-gray-900">{paymentData.method}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Card Number:</span>
                    <span className="ml-2 text-gray-900">{paymentData.cardDetails?.cardNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Card Holder:</span>
                    <span className="ml-2 text-gray-900">{paymentData.cardDetails?.cardHolder}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Expiry:</span>
                    <span className="ml-2 text-gray-900">{paymentData.cardDetails?.expiryDate}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">CVV:</span>
                    <span className="ml-2 text-gray-900">{paymentData.cardDetails?.cvv}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Fill out the payment form to see the data here</p>
              )}
            </div>

            {/* Test Instructions */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Test Instructions:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Fill out the payment form with any valid data</li>
                <li>• Submit the form to see the collected data</li>
                <li>• This tests the form validation and data collection</li>
                <li>• No actual payment processing occurs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPayment;
