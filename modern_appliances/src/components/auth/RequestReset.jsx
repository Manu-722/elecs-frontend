import React, { useState } from 'react';
import { toast } from 'react-toastify';

const RequestReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/request-password-reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      response.ok ? toast.success(data.message) : toast.error(data.error);
    } catch (error) {
      toast.error('Failed to send reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-6 py-8 border rounded-md shadow-lg bg-white">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Reset Your Password</h2>
      <form onSubmit={handleRequest} className="space-y-4">
        <label className="text-sm text-gray-700 font-medium">Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 focus:ring-blue-500 focus:outline-none rounded px-3 py-2 transition duration-200"
          placeholder="you@example.com"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-2 rounded font-semibold transition duration-200 ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
};

export default RequestReset;