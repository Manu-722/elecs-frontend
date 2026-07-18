import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/reset-password/${uidb64}/${token}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, password }),
      });
      const data = await response.json();
      response.ok ? (toast.success(data.message), navigate('/login')) : toast.error(data.error);
    } catch (error) {
      toast.error('Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-6 py-8 border rounded-md shadow-lg bg-white">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Set New Password</h2>
      <form onSubmit={handleReset} className="space-y-4">
        <label className="text-sm text-gray-700 font-medium">One-Time Password (OTP)</label>
        <input
          type="text"
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border border-gray-300 focus:ring-blue-500 focus:outline-none rounded px-3 py-2"
          placeholder="Enter OTP"
        />
        <label className="text-sm text-gray-700 font-medium">New Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 focus:ring-green-500 focus:outline-none rounded px-3 py-2"
        />
        <label className="text-sm text-gray-700 font-medium">Confirm Password</label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border border-gray-300 focus:ring-green-500 focus:outline-none rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-2 rounded font-semibold transition duration-200 ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;