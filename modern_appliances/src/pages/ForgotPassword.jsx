import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=code+new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auth/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      toast.success(data.message || 'Reset code sent to your email');
      setStep(2);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code.trim() || !newPw || !confirmPw) { toast.error('All fields are required'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auth/forgot-password/confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          new_password: newPw,
          confirm_password: confirmPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Reset failed'); return; }
      toast.success('Password reset! You can now sign in.');
      setTimeout(() => navigate('/login'), 1200);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="relative bg-gray-950 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-white font-black text-2xl tracking-tight">
                {step === 1 ? 'Forgot Password?' : 'Enter Reset Code'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {step === 1
                  ? 'Enter your email and we\'ll send a reset code'
                  : `Code sent to ${email}`}
              </p>
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    step > s ? 'bg-amber-400 text-black' :
                    step === s ? 'bg-amber-400 text-black' :
                    'bg-gray-800 text-gray-500'
                  }`}>
                    {step > s ? '✓' : s}
                  </div>
                  {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-amber-400' : 'bg-gray-800'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1 — Email */}
            {step === 1 && (
              <form onSubmit={handleRequestCode} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
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
                <button type="submit" disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-black text-sm transition-all duration-200 ${
                    loading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-amber-400 text-black hover:bg-amber-300 active:scale-[0.98] shadow-lg shadow-amber-400/20'
                  }`}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending Code…
                    </span>
                  ) : 'Send Reset Code →'}
                </button>
              </form>
            )}

            {/* Step 2 — Code + New Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">6-Digit Reset Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder-gray-700 transition-colors"
                  />
                  <p className="text-xs text-gray-600 mt-1.5 text-center">Check your email inbox (and spam folder)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 pr-12 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder-gray-600 transition-colors"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors text-xs font-semibold">
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder-gray-600 transition-colors"
                  />
                </div>

                <button type="submit" disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-black text-sm transition-all duration-200 ${
                    loading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-amber-400 text-black hover:bg-amber-300 active:scale-[0.98] shadow-lg shadow-amber-400/20'
                  }`}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Resetting…
                    </span>
                  ) : 'Reset Password →'}
                </button>

                <button type="button" onClick={() => setStep(1)}
                  className="w-full text-center text-gray-600 hover:text-gray-400 text-xs transition-colors">
                  ← Use a different email
                </button>
              </form>
            )}

            {/* Back to login */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-gray-600 text-xs">REMEMBERED IT?</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
            <Link to="/login"
              className="block w-full py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-amber-400 hover:text-amber-400 text-sm font-bold text-center transition-all duration-200">
              Back to Sign In
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
