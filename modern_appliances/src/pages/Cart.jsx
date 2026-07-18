import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setCart,
  persistCartToServer,
  clearCart,
} from '../redux/cartSlice';
import { toast } from 'react-toastify';

const Cart = () => {
  const cart = useSelector((state) => state.cart.items);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('mpesa');

  const formatKES = (amount) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);

  const updateCart = (updated) => {
    dispatch(setCart(updated));
  };

  const removeItem = (id) => {
    const updated = cart.filter(item => item.id !== id);
    updateCart(updated);
  };

  const incrementQty = (id) => {
    const updated = cart.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCart(updated);
  };

  const decrementQty = (id) => {
    const updated = cart.map(item =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    updateCart(updated);
  };

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + (item.discounted ?? item.price) * (item.quantity || 1),
    0
  );

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate(`/checkout?method=${paymentMethod}`);
    } else {
      navigate('/login?returnTo=/checkout');
    }
  };

  // 🛡️ Clear cart on logout to prevent ghost items
  useEffect(() => {
    if (!isAuthenticated && cart.length > 0) {
      dispatch(clearCart());
      toast.info('🧹 Cart cleared for security');
    }
  }, [isAuthenticated, cart.length, dispatch]);

  // 💾 Persist cart changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && cart.length > 0) {
        dispatch(persistCartToServer())
          .unwrap()
          .then(() => toast.success('🛒 Cart updated'))
          .catch(() => toast.error('❌ Failed to sync cart'));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [cart, isAuthenticated, dispatch]);

  // ❌ Don’t render cart if unauthenticated or empty
  if (!isAuthenticated || cart.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-center mb-6 text-red-600">Your Cart 🛒</h2>
        <p className="text-center text-gray-500">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-red-600">Your Cart 🛒</h2>

      <div className="space-y-6">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border shadow rounded-lg"
          >
            <img
              src={`http://localhost:8000/media/${item.image}`}
              alt={item.shoe}
              className="w-32 h-32 object-cover rounded"
            />
            <div className="flex-1 w-full">
              <h3 className="text-lg font-semibold text-gray-800">{item.shoe}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {item.description?.length > 60
                  ? `${item.description.slice(0, 60)}...`
                  : item.description}
              </p>
              <p className="text-md text-gray-800 mb-1">
                Price:{' '}
                {item.discounted && item.discounted < item.price ? (
                  <>
                    <span className="line-through text-gray-500 mr-2">
                      {formatKES(item.price)}
                    </span>
                    <span className="text-green-700 font-semibold">
                      {formatKES(item.discounted)}
                    </span>
                    <span className="ml-2 text-sm text-red-600 font-medium">
                      Save {formatKES(item.price - item.discounted)} (
                      {Math.round((1 - item.discounted / item.price) * 100)}% off)
                    </span>
                  </>
                ) : (
                  <span className="text-gray-800 font-semibold">
                    {formatKES(item.price)}
                  </span>
                )}
              </p>
              <div className="flex gap-2 items-center mt-2">
                <button
                  onClick={() => decrementQty(item.id)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  −
                </button>
                <span className="font-medium">{item.quantity}</span>
                <button
                  onClick={() => incrementQty(item.id)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4 text-right">
        <p className="text-xl font-bold text-gray-800">
          Subtotal: {formatKES(subtotal)}
        </p>

        <div className="text-left">
          <label className="block mb-1 font-semibold">Payment Method:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="border px-4 py-2 rounded w-full sm:w-1/2"
          >
            <option value="mpesa">M-Pesa</option>
            <option value="card">Card</option>
          </select>
        </div>

        <button
          onClick={handleCheckout}
          className={`mt-4 px-6 py-2 rounded ${
            isAuthenticated
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
          }`}
        >
          {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
        </button>
      </div>
    </div>
  );
};

export default Cart;