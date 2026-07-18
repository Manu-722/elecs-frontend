// App.jsx
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './redux/store';

import {
  fetchCartFromServer,
  persistCartToServer,
  clearCart,
  setCart,
} from './redux/cartSlice';
import {
  fetchWishlistFromServer,
  clearWishlist,
} from './redux/wishlistSlice';
import {
  setUser,
  setAuthenticated,
  setToken,
} from './redux/authSlice';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Register from './pages/Register';
// import RequestReset from './pages/RequestReset';
import RequestPasswordReset from './pages/RequestPasswordReset';
// import ResetPassword from './components/auth/ResetPassword';
import AdminDashboard from './admin/AdminDashboard';
// import PasswordReset from './components/PasswordReset';
import ResetPassword from './pages/ResetPassword'; 

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  return isAuthenticated
    ? children
    : <Navigate to={`/login?returnTo=${location.pathname}`} replace />;
};

const getValidAccessToken = () => {
  try {
    const raw = localStorage.getItem('authToken');
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed?.access) return parsed.access;
    if (typeof raw === 'string' && raw.length > 20 && !raw.includes('{')) return raw;

    return null;
  } catch {
    return null;
  }
};

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.items);

  useEffect(() => {
    const accessToken = getValidAccessToken();
    if (!accessToken || isAuthenticated) return;

    fetch('http://localhost:8000/api/auth/user-profile/', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => {
        if (!res.ok || res.headers.get('content-type')?.includes('text/html')) {
          throw new Error('Invalid or HTML response');
        }
        return res.json();
      })
      .then((userData) => {
        const lastKnown = localStorage.getItem('lastUsername');
        if (lastKnown && lastKnown !== userData.username) {
          localStorage.removeItem('cymanCart');
          localStorage.removeItem('cymanWishlist');
          dispatch(clearCart());
          dispatch(clearWishlist());
        }

        localStorage.setItem('lastUsername', userData.username);

        dispatch(setUser(userData));
        dispatch(setToken({ access: accessToken }));
        dispatch(setAuthenticated(true));

        dispatch(fetchCartFromServer())
          .unwrap()
          .then((items) => {
            if (Array.isArray(items) && items.length > 0) {
              toast.success('🛒 Cart restored');
            }
          })
          .catch((err) => {
            console.warn('Cart restore error:', err?.detail || err);
          });

        dispatch(fetchWishlistFromServer())
          .unwrap()
          .then((items) => {
            if (Array.isArray(items) && items.length > 0) {
              toast.success(' Wishlist restored');
            }
          })
          .catch((err) => {
            console.warn('Wishlist restore error:', err?.detail || err);
          });
      })
      .catch((err) => {
        console.error('Session restore failed:', err);
        dispatch(setAuthenticated(false));
        dispatch(setToken(null));
        dispatch(clearCart());
        dispatch(clearWishlist());
        localStorage.removeItem('authToken');
        localStorage.removeItem('cymanCart');
        localStorage.removeItem('cymanWishlist');
        toast.error(' Session expired. Please log in again.');
      });
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cymanCart');
    if (isAuthenticated && storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          dispatch(setCart(parsed));
          console.log(' Local cart hydrated');
        }
      } catch (err) {
        console.warn(' Cart hydration failed:', err);
        dispatch(clearCart());
      }
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !token || !user?.username) return;

    const timer = setTimeout(() => {
      dispatch(persistCartToServer());
    }, 200);

    return () => clearTimeout(timer);
  }, [cart, isAuthenticated, token, user, dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Register />} />
        <Route path="/wishlist" element={<Wishlist />} />
        {/* <Route path="/request-reset" element={<RequestReset />} /> */}
        <Route path="/request-password-reset" element={<RequestPasswordReset />} /> 
        <Route path="/reset" element={<ResetPassword />} />
        {/* <Route path="/reset/:uidb64/:token" element={<ResetPassword />} /> */}
        {/* <Route path="/request-password-reset" element={<PasswordReset />} /> */}

      </Routes>  
      <Footer />
      <ToastContainer position="top-center" autoClose={4000} />
    </>
  );
};

const App = () => (
  <Provider store={store}>
    <CartProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </CartProvider>
  </Provider>
);

export default App;