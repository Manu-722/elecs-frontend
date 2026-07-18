import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CardCheckoutForm from './CardCheckoutForm';

const stripePromise = loadStripe('pk_test_51Rll5GR31F13pFA0W8yyMJy7zawbfLBRIBjeGCYyiPeu4efcp21c7KOfiDZ8ojL5MPVui41VLSMCheVAQ5krb9Lv00zt7Mk4ez');

const Checkout = () => {
  const { cart, setCart } = useContext(CartContext);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const token = useSelector((state) => state.auth?.token) || localStorage.getItem('authToken');
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please login to continue to checkout.');
      navigate('/login?returnTo=/checkout');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const discountRate = totalQuantity >= 2 ? 0.07 : 0;

  const getItemTotal = (item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    const baseTotal = price * quantity;
    return baseTotal - baseTotal * discountRate;
  };

  const formatKES = (amount) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);

  const total = cart.reduce((sum, item) => sum + getItemTotal(item), 0);

  const cleanUp = () => {
    setCart([]);
    localStorage.removeItem('cymanCart');
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'card') return;

    setLoading(true);

    const payload = {
      name,
      phone,
      address,
      items: cart,
      total,
      paymentMethod,
    };

    try {
      const orderRes = await fetch('http://localhost:8000/api/checkout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!orderRes.ok) throw new Error('Failed to place order');

      const stkRes = await fetch('http://localhost:8000/api/initiate_stk_push/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone, amount: total }),
      });

      const stkData = await stkRes.json();

      if (stkData.ResponseCode === '0') {
        toast.success('Order placed! M-Pesa prompt sent to your phone.');
        cleanUp();
        navigate('/thank-you');
      } else {
        toast.error(stkData.ResponseDescription || 'M-Pesa payment failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardSuccess = () => {
    toast.success('Card payment successful!');
    cleanUp();
    navigate('/thank-you');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Checkout</h2>

      <form onSubmit={paymentMethod === 'mpesa' ? handleOrderSubmit : undefined} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {paymentMethod === 'mpesa' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
          <textarea
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="mpesa">M-Pesa</option>
            <option value="card">Card</option>
          </select>
        </div>

        <div className="border-t pt-4 mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Order Summary</h3>
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between text-sm text-gray-700 mb-1">
              <span>
                {item.name} × {item.quantity || 1}
              </span>
              <span>{formatKES(getItemTotal(item))}</span>
            </div>
          ))}
          <p className="text-right text-xl font-bold text-blue-700 mt-3">
            Total: {formatKES(total)}
          </p>
        </div>

        {paymentMethod === 'mpesa' && (
          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full ${
              loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            } text-white font-semibold px-6 py-2 rounded`}
          >
            {loading ? 'Processing...' : 'Place Order & Pay with M-Pesa'}
          </button>
        )}
      </form>

      {paymentMethod === 'card' && (
        <div className="mt-6">
          <Elements stripe={stripePromise}>
            <CardCheckoutForm amount={total} onSuccess={handleCardSuccess} />
          </Elements>
        </div>
      )}
    </div>
  );
};

export default Checkout;