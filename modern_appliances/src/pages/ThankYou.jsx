import React from 'react';
import { Link } from 'react-router-dom';

const ThankYou = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 text-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Thank You for Your Purchase!</h1>
      <p className="text-lg text-blue-700 mb-6">
        Your order has been successfully placed. We appreciate your support and hope you love your new kicks!
      </p>
      <Link
        to="/"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default ThankYou;