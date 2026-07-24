import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SettingsModal = ({ onClose }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-gray-950 border border-gray-800 rounded-t-3xl w-full max-w-lg p-6 pb-10 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-2" />

        <h2 className="text-white font-black text-lg">Settings</h2>

        {/* Theme */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div>
            <p className="text-white text-sm font-semibold">Dark Mode</p>
            <p className="text-gray-500 text-xs">Always on — Hawk style</p>
          </div>
          <div className="w-11 h-6 rounded-full bg-amber-400 relative">
            <div className="absolute top-1 left-6 w-4 h-4 bg-white rounded-full shadow" />
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <div>
            <p className="text-white text-sm font-semibold">Order Notifications</p>
            <p className="text-gray-500 text-xs">Get alerts when your order is confirmed</p>
          </div>
          <div
            onClick={() => setNotifications(!notifications)}
            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${notifications ? 'bg-amber-400' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifications ? 'left-6' : 'left-1'}`} />
          </div>
        </div>

        {/* Links */}
        <div className="space-y-1">
          {[
            { label: '🛒 My Cart', to: '/cart' },
            { label: '❤️ Wishlist', to: '/wishlist' },
            { label: '👤 Profile & Orders', to: '/profile' },
            { label: '🔐 Change Password', to: '/profile' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={onClose}
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-900 text-gray-300 hover:text-amber-400 text-sm font-medium transition"
            >
              {item.label}
              <span className="text-gray-600">›</span>
            </Link>
          ))}
        </div>

        {/* Paybill info */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-amber-400 font-black text-xs uppercase tracking-widest mb-2">Payment Info</p>
          <p className="text-gray-300 text-sm">Paybill: <span className="text-white font-black">522522</span></p>
          <p className="text-gray-300 text-sm">Account: <span className="text-white font-black">7518213</span></p>
        </div>

        {/* Contact */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <span>📍 Nairobi, Kenya</span>
          <a href="tel:+254745792950" className="text-amber-400 font-semibold hover:text-amber-300">+254-745-792-950</a>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gray-900 text-gray-400 hover:text-white text-sm font-bold transition border border-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const cart = useSelector((s) => s.cart.items);
  const isAuthenticated = useSelector((s) => s.auth?.isAuthenticated);
  const cartCount = isAuthenticated ? cart.reduce((t, i) => t + (i.quantity || 1), 0) : 0;

  const active = (path) => location.pathname === path;

  const navItems = [
    {
      label: 'Home',
      to: '/',
      icon: (on) => (
        <svg className={`w-6 h-6 ${on ? 'text-amber-400' : 'text-gray-500'}`} fill={on ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={on ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Cart',
      to: '/cart',
      badge: cartCount,
      icon: (on) => (
        <svg className={`w-6 h-6 ${on ? 'text-amber-400' : 'text-gray-500'}`} fill={on ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={on ? 0 : 2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'Wishlist',
      to: '/wishlist',
      icon: (on) => (
        <svg className={`w-6 h-6 ${on ? 'text-amber-400' : 'text-gray-500'}`} fill={on ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={on ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      label: 'Profile',
      to: '/profile',
      icon: (on) => (
        <svg className={`w-6 h-6 ${on ? 'text-amber-400' : 'text-gray-500'}`} fill={on ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={on ? 0 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: 'More',
      action: () => setShowSettings(true),
      icon: (on) => (
        <svg className={`w-6 h-6 ${on ? 'text-amber-400' : 'text-gray-500'}`} fill={on ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={on ? 0 : 2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-950 border-t border-gray-800 flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          const on = item.to ? active(item.to) : false;
          const handleClick = item.action ? item.action : () => navigate(item.to);

          return (
            <button
              key={item.label}
              onClick={handleClick}
              className="flex flex-col items-center gap-0.5 px-3 py-1 relative group"
            >
              <div className="relative">
                {item.icon(on)}
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${on ? 'text-amber-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                {item.label}
              </span>
              {on && <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-400 rounded-full" />}
            </button>
          );
        })}
      </nav>

      {/* Spacer so content isn't hidden behind the nav */}
      <div className="h-20" />
    </>
  );
};

export default Footer;
