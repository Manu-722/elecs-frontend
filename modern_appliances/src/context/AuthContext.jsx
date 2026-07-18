import React, { createContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';
import { clearWishlist } from '../redux/wishlistSlice';
import { useCart } from '../context/CartContext';
import { startAuthListener } from '../sessionListener'; 

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const dispatch = useDispatch();
  const { emptyCart } = useCart();

  const fetchUser = async (accessToken) => {
    try {
      const res = await fetch('http://localhost:8000/api/user-profile/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsAuthenticated(true);
        setToken(accessToken);
        localStorage.setItem('lastUsername', data.username);
      } else {
        throw new Error('Unauthorized');
      }
    } catch (err) {
      console.warn('User fetch failed:', err);
      logout(); 
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('authToken');
    if (accessToken) {
      fetchUser(accessToken);
    }

    
    const unsubscribe = startAuthListener?.(() => logout());
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const login = (accessToken) => {
    localStorage.setItem('authToken', accessToken);
    setIsAuthenticated(true);
    setToken(accessToken);
    fetchUser(accessToken);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('cymanCart');
    localStorage.removeItem('cymanWishlist');
    localStorage.removeItem('lastUsername');

    emptyCart();
    dispatch(clearCart());
    dispatch(clearWishlist());

    setIsAuthenticated(false);
    setToken(null);
    setUser(null);

    setTimeout(() => {
      window.location.href = '/';
    }, 50);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};