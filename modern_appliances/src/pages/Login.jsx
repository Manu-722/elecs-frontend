import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { setAuthenticated, setUser, setToken } from '../redux/authSlice';
import { fetchCartFromServer } from '../redux/cartSlice';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Invalid credentials'); return; }

      const accessToken = data.token?.access;
      localStorage.setItem('authToken', JSON.stringify({ access: accessToken }));
      localStorage.setItem('lastUsername', data.username);

      dispatch(setToken({ access: accessToken }));
      dispatch(setUser({
        username: data.username,
        email: data.email,
        is_admin: data.is_admin,
        avatar: data.avatar || null,
        token: accessToken,
      }));
      dispatch(setAuthenticated(true));
      dispatch(fetchCartFromServer());

      toast.success(`Welcome back, ${data.username}!`);
      setTimeout(() => navigate(data.is_admin ? '/admin-dashboard' : '/'), 500);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="relative bg-gray-950 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">

          {/* Amber top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

          <div className="p-8">
            {/* Logo + heading */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-full bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center mx-auto">
                  <img
                    src="http://localhost:8000/media/shoes/Hawk_logo.jpeg"
                    alt="Hawk"
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-3xl">🦅</span>';
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h1 className="text-white font-black text-2xl tracking-tight">Welcome Back</h1>
              <p className="text-gray-500 text-sm mt-1">Sign in to <span className="text-amber-400 font-semibold">Hawk Life Solutions</span></p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder-gray-600 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder-gray-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors"
                  >
                    {showPw ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="text-right mt-2">
                  <Link to="/forgot-password" className="text-amber-400 hover:text-amber-300 text-xs font-semibold transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all duration-200 ${
                  loading
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-400 text-black hover:bg-amber-300 active:scale-[0.98] shadow-lg shadow-amber-400/20'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign In →'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-gray-600 text-xs">NEW HERE?</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            <Link
              to="/register"
              className="block w-full py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-amber-400 hover:text-amber-400 text-sm font-bold text-center transition-all duration-200"
            >
              Create an Account
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          © {new Date().getFullYear()} Hawk Life Solutions
        </p>
      </div>
    </div>
  );
}
