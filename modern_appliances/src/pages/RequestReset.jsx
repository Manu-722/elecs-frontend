import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setAuthenticated, setUser, setToken } from '../redux/authSlice';

const RequestReset = () => {
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleReset = async (e) => {
    e.preventDefault();

    if (!identifier || !username || !password || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords must match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auth/reset-identity/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, username, password, confirm_password: confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Credentials updated. Check your email ✉️');

        // 🧼 Session hygiene: flush all auth state
        localStorage.removeItem('authToken');
        localStorage.removeItem('lastUsername');
        dispatch(setAuthenticated(false));
        dispatch(setUser({}));
        dispatch(setToken(null));

        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(data.error || 'Reset failed');
      }
    } catch {
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="bg-white border border-red-500 p-8 rounded shadow-md w-full max-w-md text-center text-red-700">
        <h2 className="text-2xl font-bold mb-4">Secure Your Account</h2>
        <form onSubmit={handleReset}>
          <input
            type="text"
            placeholder="Previous username or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="mb-4 w-full px-4 py-2 border rounded text-red-700"
          />
          <input
            type="text"
            placeholder="New username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mb-4 w-full px-4 py-2 border rounded text-red-700"
          />
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mb-4 w-full px-4 py-2 border rounded text-red-700"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mb-6 w-full px-4 py-2 border rounded text-red-700"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 font-semibold rounded transition ${
              loading ? 'bg-red-300 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {loading ? 'Processing...' : 'Reset via Email'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestReset;