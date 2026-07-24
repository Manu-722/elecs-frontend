import React, { useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearWishlist, removeWishlistItem } from '../redux/WishlistSlice';
import { setCart } from '../redux/cartSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const formatKES = (n) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

const Wishlist = () => {
  const wishlist = useSelector((s) => s.wishlist?.items || []);
  const cart = useSelector((s) => s.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const moveToCart = (item) => {
    const existing = cart.find((c) => c.id === item.id);
    const updated = existing
      ? cart.map((c) => c.id === item.id ? { ...c, quantity: (c.quantity || 1) + 1 } : c)
      : [...cart, { ...item, quantity: 1 }];
    dispatch(setCart(updated));
    dispatch(removeWishlistItem(item.id));
    toast.success(`"${item.name}" moved to cart`);
  };

  const moveAllToCart = () => {
    let updated = [...cart];
    wishlist.forEach((item) => {
      const existing = updated.find((c) => c.id === item.id);
      if (existing) {
        updated = updated.map((c) => c.id === item.id ? { ...c, quantity: (c.quantity || 1) + 1 } : c);
      } else {
        updated.push({ ...item, quantity: 1 });
      }
    });
    dispatch(setCart(updated));
    dispatch(clearWishlist());
    toast.success('All items moved to cart');
    navigate('/cart');
  };

  const handleRemove = (id) => {
    dispatch(removeWishlistItem(id));
    toast.success('Removed from wishlist');
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-white font-black text-2xl mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Save items you love to find them later.</p>
          <button onClick={() => navigate('/shop')}
            className="bg-amber-400 text-black font-black px-8 py-3 rounded-full hover:bg-amber-300 transition">
            Browse Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white font-black text-2xl">
            Wishlist <span className="text-amber-400">({wishlist.length})</span>
          </h1>
          <button onClick={moveAllToCart}
            className="bg-amber-400 text-black font-black px-4 py-2 rounded-full text-xs hover:bg-amber-300 transition">
            Move All to Cart
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex gap-4 items-center">
              <img
                src={`http://localhost:8000/media/${item.image}`}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-gray-800"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm truncate">{item.name}</h3>
                <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                <p className="text-amber-400 font-black text-sm mt-2">
                  {formatKES(item.discounted ?? item.price)}
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => moveToCart(item)}
                  className="bg-amber-400 text-black font-bold text-xs px-3 py-1.5 rounded-full hover:bg-amber-300 transition">
                  + Cart
                </button>
                <button onClick={() => handleRemove(item.id)}
                  className="text-gray-600 hover:text-white text-xs font-medium transition text-center">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
