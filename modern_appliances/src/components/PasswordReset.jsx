import { useState } from 'react';
import { toast } from 'react-toastify';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast.success('If that email is registered, a reset link has been sent.');
      setEmail('');
    } catch (error) {
      console.error('Password reset error:', error.code);
      toast.success('If that email is registered, a reset link has been sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="bg-white border border-red-500 p-8 rounded shadow-md w-full max-w-md text-red-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h2>
        <form onSubmit={handleReset}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-6 w-full px-4 py-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 font-semibold rounded transition ${
              loading ? 'bg-red-300 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {loading ? 'Sending Email...' : 'Send Password Reset'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;