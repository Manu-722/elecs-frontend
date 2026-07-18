import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-toastify';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      toast.error('Please enter your email');
      return;
    }

    // Optional: Basic email format check
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isEmailValid) {
      toast.error('Invalid email format');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmed, {
        url: 'https://cymanwear.com/reset',
        handleCodeInApp: true,
      });

      toast.success('✅ Password reset link sent to your email');
      setEmail(''); // Clear form after success
    } catch (error) {
      toast.error(error.message || 'Could not send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Reset Your Password</h2>

        <form onSubmit={handleResetRequest} className="flex flex-col">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            required
            className="mb-4 w-full px-4 py-2 border rounded focus:ring-blue-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white font-semibold rounded transition ${
              loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Make sure to check your spam folder if you don’t see the email right away.
        </p>
      </div>
    </div>
  );
};

export default RequestPasswordReset;