import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCart, persistCartToServer, clearCart } from '../redux/cartSlice';
import { toast } from 'react-toastify';

const formatKES = (n) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

const Cart = () => {
  const cart = useSelector((s) => s.cart.items);
  const isAuthenticated = useSelector((s) => s.auth?.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const update = (updated) => dispatch(setCart(updated));
  const remove = (id) => update(cart.filter((i) => i.id !== id));
  const inc = (id) => update(cart.map((i) => i.id === id ? { ...i, quantity: (i.quantity || 1) + 1 } : i));
  const dec = (id) => update(cart.map((i) => i.id === id && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i));

  const subtotal = cart.reduce((s, i) => s + (i.discounted ?? i.price) * (i.quantity || 1), 0);

  // Persist on change
  useEffect(() => {
    if (!isAuthenticated || cart.length === 0) return;
    const t = setTimeout(() => dispatch(persistCartToServer()), 800);
    return () => clearTimeout(t);
  }, [cart, isAuthenticated, dispatch]);

  // Empty / not logged in state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-white font-black text-2xl mb-2">Sign in to view your cart</h2>
          <p className="text-gray-500 text-sm mb-6">Your cart items are saved when you're logged in.</p>
          <button onClick={() => navigate('/login?returnTo=/cart')}
            className="bg-amber-400 text-black font-black px-8 py-3 rounded-full hover:bg-amber-300 transition">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-white font-black text-2xl mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add some products to get started.</p>
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
            Your Cart <span className="text-amber-400">({cart.length})</span>
          </h1>
          <button onClick={() => { dispatch(clearCart()); toast.success('Cart cleared'); }}
            className="text-gray-500 hover:text-white text-xs font-medium transition">
            Clear all
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-8">
          {cart.map((item) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex gap-4 items-center">
              <img
                src={`http://localhost:8000/media/${item.image}`}
                alt={item.name || item.product}
                className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-gray-800"
                onError={(e) => { e.target.src = ''; e.target.className = 'w-20 h-20 rounded-xl bg-gray-800 flex-shrink-0'; }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm truncate">{item.name || item.product}</h3>
                <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                <div className="flex items-center justify-between mt-3">
                  {/* Qty controls */}
                  <div className="flex items-center gap-2 bg-gray-800 rounded-full px-1 py-1">
                    <button onClick={() => dec(item.id)}
                      className="w-6 h-6 rounded-full bg-gray-700 hover:bg-amber-400 hover:text-black text-white text-sm font-bold flex items-center justify-center transition">
                      −
                    </button>
                    <span className="text-white text-sm font-bold w-5 text-center">{item.quantity || 1}</span>
                    <button onClick={() => inc(item.id)}
                      className="w-6 h-6 rounded-full bg-gray-700 hover:bg-amber-400 hover:text-black text-white text-sm font-bold flex items-center justify-center transition">
                      +
                    </button>
                  </div>
                  {/* Price */}
                  <div className="text-right">
                    {item.discounted && item.discounted < item.price ? (
                      <div>
                        <p className="text-gray-600 text-xs line-through">{formatKES(item.price * (item.quantity || 1))}</p>
                        <p className="text-amber-400 font-black text-sm">{formatKES(item.discounted * (item.quantity || 1))}</p>
                      </div>
                    ) : (
                      <p className="text-amber-400 font-black text-sm">{formatKES((item.price || 0) * (item.quantity || 1))}</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Remove */}
              <button onClick={() => remove(item.id)}
                className="text-gray-600 hover:text-white transition flex-shrink-0 p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Subtotal</span>
            <span className="text-white font-bold">{formatKES(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-800">
            <span className="text-gray-400 text-sm">Delivery</span>
            <span className="text-gray-400 text-sm">Calculated at checkout</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-white font-black text-lg">Total</span>
            <span className="text-amber-400 font-black text-2xl">{formatKES(subtotal)}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-amber-400 text-black font-black py-4 rounded-xl hover:bg-amber-300 active:scale-[0.98] transition-all text-sm tracking-wide shadow-lg shadow-amber-400/20">
            Proceed to Checkout →
          </button>
          <button onClick={() => navigate('/shop')}
            className="w-full mt-3 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 text-sm font-medium transition">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
