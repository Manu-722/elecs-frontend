import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-950 border-t border-gray-800 pt-12 pb-8 px-6">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

      {/* About */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <img
            src="http://localhost:8000/media/shoes/Hawk_logo.jpeg"
            alt="Hawk"
            className="w-8 h-8 rounded-full object-cover border border-amber-400"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h4 className="text-amber-400 font-black text-lg">Hawk Life Solutions</h4>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          Your trusted source for premium induction cookers, sufurias and non-stick pans in Kenya.
          Energy-efficient, modern cooking solutions for homes and businesses.
        </p>
      </div>

      {/* Quick Links */}
      <div className="md:text-center">
        <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Quick Links</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><Link to="/" className="hover:text-amber-400 transition-colors">Home</Link></li>
          <li><Link to="/shop" className="hover:text-amber-400 transition-colors">Shop</Link></li>
          <li><Link to="/cart" className="hover:text-amber-400 transition-colors">Cart</Link></li>
          <li><Link to="/profile" className="hover:text-amber-400 transition-colors">My Account</Link></li>
        </ul>
      </div>

      {/* Contact */}
      <div className="md:text-right">
        <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Contact Us</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>📍 Nairobi, Kenya</li>
          <li>
            <a href="mailto:info@hawklifesolutions.com" className="hover:text-amber-400 transition-colors">
              info@hawklifesolutions.com
            </a>
          </li>
          <li>
            <a href="tel:+254745792950" className="hover:text-amber-400 transition-colors">
              +254-745-792-950
            </a>
          </li>
        </ul>
        <div className="flex justify-start md:justify-end gap-4 mt-5">
          <a href="https://facebook.com/hawklifesolutions" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-amber-400 hover:text-black text-gray-400 flex items-center justify-center transition-all text-xs font-bold">
            f
          </a>
          <a href="https://instagram.com/hawklifesolutions" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-amber-400 hover:text-black text-gray-400 flex items-center justify-center transition-all text-xs font-bold">
            in
          </a>
          <a href="https://twitter.com/hawklifesolutions" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-amber-400 hover:text-black text-gray-400 flex items-center justify-center transition-all text-xs font-bold">
            𝕏
          </a>
        </div>
      </div>
    </div>

    <div className="mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-600">
      © {new Date().getFullYear()} <span className="text-amber-400 font-semibold">Hawk Life Solutions</span>. All rights reserved.
    </div>
  </footer>
);

export default Footer;
