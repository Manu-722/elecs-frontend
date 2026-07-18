import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { isAuthenticated, token } = useContext(AuthContext);

  //  Fetch wishlist on login
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await fetch('http://localhost:8000/api/wishlist/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setWishlist(data.items);
        }
      } catch (err) {
        console.warn('Wishlist fetch failed:', err);
      }
    };
    fetchWishlist();
  }, [isAuthenticated]);

  //  Add item
  const addToWishlist = async (item) => {
    setWishlist(prev => [...prev, item]);
    try {
      await fetch('http://localhost:8000/api/wishlist/add/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
    } catch (err) {
      console.warn('Add to wishlist failed:', err);
    }
  };

  //  Remove item
  const removeFromWishlist = async (itemId) => {
    setWishlist(prev => prev.filter(i => i.id !== itemId));
    try {
      await fetch(`http://localhost:8000/api/wishlist/remove/${itemId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn('Remove from wishlist failed:', err);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};