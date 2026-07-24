import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/authSlice';
import { persistCartToServer, clearCart } from '../redux/cartSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((s) => s.cart.items);
  const isAuthenticated = useSelector((s) => s.auth?.isAuthenticated);
  const user = useSelector((s) => s.auth?.user);
  const [showLogout, setShowLogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = isAuthenticated && user?.is_admin === true;
  const displayName = user?.username || '';
  const firstName = displayName.split(' ')[0];
  const avatar = user?.avatar || null;
  const cartCount = isAuthenticated ? cart.reduce((t, i) => t + (i.quantity || 1), 0) : 0;

  const handleLogout = async () => {
    try { await dispatch(persistCartToServer()); } catch {}
    dispatch(clearCart());
    dispatch(logoutUser());
    setShowLogout(false);
    setMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    if (showLogout) {
      const t = setTimeout(() => setShowLogout(false), 10000);
      return () => clearTimeout(t);
    }
  }, [showLogout]);

  return (
    <>
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-80 text-center">
            <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <p className="text-gray-800 font-bold text-lg mb-2">Sign Out?</p>
            <p className="text-gray-500 text-sm mb-6">Your cart will be saved for next time.</p>
            <div className="flex gap-3">
              <button onClick={handleLogout} className="flex-1 py-2.5 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition">Yes, Sign Out</button>
              <button onClick={() => setShowLogout(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <nav className="nav-bg border-b border-hawk-border px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="http://localhost:8000/media/shoes/Hawk_logo.jpeg" alt="Hawk"
            className="h-9 w-9 rounded-full object-cover border-2 border-amber-400"
            onError={(e) => { e.target.style.display = 'none'; }} />
          <span className="nav-text font-black text-lg hidden sm:block tracking-tight">
            Hawk <span className="text-amber-400">Life</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-5">
          {isAuthenticated && user ? (
            <>
              {/* Hawk logo + first name */}
              <div className="flex items-center gap-2">
                <img src="http://localhost:8000/media/shoes/Hawk_logo.jpeg" alt="Hawk"
                  className="h-7 w-7 rounded-full object-cover border border-amber-400"
                  onError={(e) => { e.target.style.display = 'none'; }} />
                <span className="text-amber-400 font-bold text-sm">{firstName}</span>
              </div>

              {/* Profile avatar */}
              <Link to="/profile" className="flex items-center gap-2 group">
                {avatar ? (
                  <img src={avatar} alt={displayName} className="w-7 h-7 rounded-full object-cover border-2 border-amber-400" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-black flex items-center justify-center font-black text-xs">
                    {firstName[0]?.toUpperCase()}
                  </div>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative text-gray-300 hover:text-amber-400 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {cartCount}
                  </span>
                )}
              </Link>

              {isAdmin && (
                <Link to="/admin-dashboard"
                  className="bg-amber-400 text-black px-3 py-1.5 rounded-full text-xs font-black hover:bg-amber-300 transition flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Admin
                </Link>
              )}
              <button onClick={() => setShowLogout(true)} className="text-gray-500 hover:text-white text-sm transition">Sign Out</button>
            </>
          ) : (
            <>
              {/* Cart visible even when logged out */}
              <Link to="/cart" className="relative text-gray-300 hover:text-amber-400 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>
              <Link to="/login" className="text-gray-300 hover:text-amber-400 text-sm font-medium transition">Login</Link>
              <Link to="/register" className="bg-amber-400 text-black px-4 py-1.5 rounded-full text-sm font-black hover:bg-amber-300 transition">Register</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-300 hover:text-white p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden nav-bg border-b border-hawk-border px-6 py-5 space-y-4 z-30">
          {isAuthenticated ? (
            <>
              {/* Hawk logo + first name */}
              <div className="flex items-center gap-2">
                <img src="http://localhost:8000/media/shoes/Hawk_logo.jpeg" alt="Hawk"
                  className="h-6 w-6 rounded-full object-cover border border-amber-400"
                  onError={(e) => { e.target.style.display = 'none'; }} />
                <span className="text-amber-400 font-bold text-sm">{firstName}</span>
              </div>

              {/* Profile */}
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-gray-300 hover:text-amber-400 text-sm">
                {avatar ? (
                  <img src={avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-amber-400" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs font-black">
                    {firstName[0]?.toUpperCase()}
                  </div>
                )}
                Profile
              </Link>

              {/* Cart */}
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-gray-300 hover:text-amber-400 text-sm font-medium">
                Cart
                {cartCount > 0 && (
                  <span className="bg-amber-400 text-black text-xs font-black px-1.5 py-0.5 rounded-full">{cartCount}</span>
                )}
              </Link>
              {isAdmin && (
                <Link to="/admin-dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-1.5 text-amber-400 font-black text-sm">
                  ⚙ Admin Dashboard
                </Link>
              )}
              <button onClick={() => { setMenuOpen(false); setShowLogout(true); }} className="block text-gray-500 hover:text-white text-sm">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-amber-400 text-sm">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="inline-block bg-amber-400 text-black px-4 py-1.5 rounded-full text-sm font-black">Register</Link>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
