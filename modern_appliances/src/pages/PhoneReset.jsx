import { useState } from 'react';
import { toast } from 'react-toastify';

const PhoneReset = () => {
  const [phone, setPhone] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!phone || !newUsername || !newPassword) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auth/reset-by-phone/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          username: newUsername,
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Credentials updated. You’ll receive an SMS shortly 📲');
        setPhone('');
        setNewUsername('');
        setNewPassword('');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Reset via Phone</h2>
        <form onSubmit={handleReset}>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="mb-4 w-full px-4 py-2 border rounded text-black"
          />
          <input
            type="text"
            placeholder="New username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
            className="mb-4 w-full px-4 py-2 border rounded text-black"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="mb-4 w-full px-4 py-2 border rounded text-black"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white font-semibold rounded transition ${
              loading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {loading ? 'Processing...' : 'Submit Reset'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PhoneReset;