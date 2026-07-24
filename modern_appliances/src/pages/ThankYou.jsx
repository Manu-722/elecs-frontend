import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const getToken = () => {
  try { return JSON.parse(localStorage.getItem('authToken'))?.access; } catch { return null; }
};

const formatKES = (n) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

export default function ThankYou() {
  const navigate = useNavigate();
  const location = useLocation();

  // Read orderId + hawkCode passed via navigation state or fallback to latest from history
  const [orderId] = useState(location.state?.orderId || null);
  const [hawkCode] = useState(location.state?.hawkCode || null);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('Pending'); // 'Pending' | 'Confirmed' | 'Cancelled'
  const [dots, setDots] = useState('');

  // Animated dots
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 600);
    return () => clearInterval(t);
  }, []);

  // Poll order status every 5 seconds
  useEffect(() => {
    if (!orderId) return;

    const poll = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/orders/history/', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          const found = data.find((o) => o.id === orderId);
          if (found) {
            setOrder(found);
            setStatus(found.status);
          }
        }
      } catch {}
    };

    poll(); // immediate first check
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  // If no orderId (navigated directly), just show generic confirmed
  if (!orderId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 rounded-2xl p-10 max-w-md w-full text-center border border-gray-800">
          <img
            src="http://localhost:8000/media/shoes/Hawk_logo.jpeg"
            alt="Hawk Life Solutions"
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-amber-400"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="text-white font-black text-2xl mb-2">Thank You!</h1>
          <p className="text-gray-400 text-sm mb-6">Your order has been received.</p>
          <button onClick={() => navigate('/shop')} className="w-full bg-amber-400 text-black font-black py-3 rounded-xl hover:bg-amber-300 transition">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ── PENDING ──
  if (status === 'Pending') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 rounded-2xl p-10 max-w-md w-full text-center border border-gray-800">
          {/* Spinner */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
            <div className="absolute inset-0 rounded-full border-4 border-t-amber-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🦅</div>
          </div>

          <h1 className="text-white font-black text-2xl mb-2">Awaiting Approval{dots}</h1>
          <p className="text-gray-400 text-sm mb-6">
            Your order is being reviewed by our team. This page will update automatically once approved.
          </p>

          {/* Hawk Code */}
          {hawkCode && (
            <div className="bg-black rounded-xl p-4 mb-6 border border-gray-700">
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Your Hawk Code</p>
              <p className="text-amber-400 font-black text-5xl tracking-widest">{hawkCode}</p>
              <p className="text-gray-600 text-xs mt-1">Keep this code — admin may ask for it</p>
            </div>
          )}

          {order && (
            <div className="bg-black rounded-xl p-4 mb-6 border border-gray-700 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order #</span>
                <span className="text-white font-semibold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="text-amber-400 font-bold">{formatKES(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-yellow-400 font-semibold">⏳ Pending</span>
              </div>
            </div>
          )}

          <p className="text-gray-600 text-xs">Checking for updates every 5 seconds…</p>

          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate('/profile')} className="flex-1 border border-gray-700 text-gray-300 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
              My Orders
            </button>
            <button onClick={() => navigate('/shop')} className="flex-1 border border-gray-700 text-gray-300 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
              Shop More
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CONFIRMED ──
  if (status === 'Confirmed') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 rounded-2xl p-10 max-w-md w-full text-center border border-amber-400/30">
          {/* Hawk Logo */}
          <img
            src="http://localhost:8000/media/shoes/Hawk_logo.jpeg"
            alt="Hawk Life Solutions"
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-amber-400 shadow-lg shadow-amber-400/20"
            onError={(e) => { e.target.style.display = 'none'; }}
          />

          {/* Checkmark */}
          <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-white font-black text-3xl mb-2">Order Confirmed! 🎉</h1>
          <p className="text-amber-400 font-semibold text-sm mb-1">From Hawk Life Solutions</p>
          <p className="text-gray-400 text-sm mb-6">
            Thank you for your purchase! Your order has been approved and is being prepared for delivery.
          </p>

          {order && (
            <div className="bg-black rounded-xl p-4 mb-6 border border-gray-700 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order #</span>
                <span className="text-white font-semibold">{order.id}</span>
              </div>
              {hawkCode && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Hawk Code</span>
                  <span className="text-amber-400 font-black tracking-widest">{hawkCode}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Total Paid</span>
                <span className="text-amber-400 font-bold">{formatKES(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-amber-400 font-semibold">✓ Confirmed</span>
              </div>
              {order.address && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-white text-right max-w-[60%]">{order.address}</span>
                </div>
              )}
            </div>
          )}

          <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 mb-6 text-sm text-amber-300">
            <p>📦 We'll contact you shortly to arrange delivery.</p>
            <p className="mt-1">📞 <span className="font-semibold">+254-745-792-950</span></p>
            <p className="mt-1">📧 info@hawklifesolutions.com</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/profile')} className="flex-1 border border-gray-700 text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-800 transition text-sm">
              View Orders
            </button>
            <button onClick={() => navigate('/shop')} className="flex-1 bg-amber-400 text-black py-3 rounded-xl font-black hover:bg-amber-300 transition text-sm">
              Shop More
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CANCELLED ──
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl p-10 max-w-md w-full text-center border border-gray-800">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-white font-black text-2xl mb-2">Order Cancelled</h1>
        <p className="text-gray-400 text-sm mb-6">
          Your order was cancelled. Please contact us if you believe this is an error.
        </p>
        <p className="text-gray-500 text-sm mb-6">📞 +254-745-792-950</p>
        <button onClick={() => navigate('/shop')} className="w-full bg-amber-400 text-black font-black py-3 rounded-xl hover:bg-amber-300 transition">
          Back to Shop
        </button>
      </div>
    </div>
  );
}
