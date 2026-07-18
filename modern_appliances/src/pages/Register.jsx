import { useState } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';
import { setUser, setToken, setAuthenticated } from '../redux/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const email = formData.email.trim();
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    if (!email || !password || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords must match');
      return;
    }

    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const displayName = email.split('@')[0];
      await updateProfile(user, { displayName });
      await sendEmailVerification(user);

      const token = await user.getIdToken();

      dispatch(setUser({
        username: displayName,
        email: user.email,
        isAuthenticated: true,
        token,
      }));
      dispatch(setAuthenticated(true));
      dispatch(setToken(token));

      localStorage.setItem('authToken', JSON.stringify({ access: token }));
      localStorage.setItem('lastUsername', displayName);

      toast.success('Registration successful! Please verify your email.');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      const friendly = {
        'auth/email-already-in-use': 'That email is already registered',
        'auth/invalid-email': 'Invalid email format',
        'auth/weak-password': 'Password should be at least 6 characters',
      }[error.code] || error.message || 'Registration failed';
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="bg-white border border-red-500 p-8 rounded shadow-md w-full max-w-md text-red-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
        <form onSubmit={handleRegister}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mb-4 w-full px-4 py-2 border rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mb-4 w-full px-4 py-2 border rounded"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;