import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCart } from '../redux/cartSlice';
import { toast } from 'react-toastify';

const PAYBILL = '522522';
const ACCOUNT = '7518213';

const formatKES = (n) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((s) => s.cart.items);
  const isAuthenticated = useSelector((s) => s.auth?.isAuthenticated);
  const user = useSelector((s) => s.auth?.user);

  const getToken = () => { try { return JSON.parse(localStorage.getItem('authToken'))?.access; } catch { return null; } };

  const [name, setName] = useState(user?.username || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hawkCode, setHawkCode] = useState(null);
  const [step, setStep] = useState(1);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [placedHawkCode, setPlacedHawkCode] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please sign in to checkout');
      navigate('/login?returnTo=/checkout');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const totalQty = cart.reduce((s, i) => s + (i.quantity || 1), 0);
  const discountRate = totalQty >= 2 ? 0.07 : 0;
  const getItemTotal = (item) => {
    const price = item.is_offer && item.offer_price ? Number(item.offer_price) : Number(item.price || 0);
    const base = price * Number(item.quantity || 1);
    return base - base * discountRate;
  };
  const total = cart.reduce((s, i) => s + getItemTotal(i), 0);

  // Step 1 → generate code and go to payment step
  const handleGenerateCode = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setHawkCode(code);
    setStep(2);
  };

  // Step 2 → confirm payment and place order
  const handlePlaceOrder = async () => {
    if (!confirmed) {
      toast.error('Please confirm you have made the payment');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/orders/place/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name, phone, address, items: cart, total, payment_method: 'mpesa_paybill', hawk_code: hawkCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      dispatch(setCart([]));
      localStorage.removeItem('hawkCart');
      setStep(3);
      // store for ThankYou polling
      setPlacedOrderId(data.order_id);
      setPlacedHawkCode(data.hawk_code || hawkCode);
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Details', 'Payment', 'Done'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${step > i ? 'text-black' : step === i + 1 ? 'text-amber-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > i ? 'bg-black text-white' : step === i + 1 ? 'bg-amber-400 text-black' : 'bg-gray-200 text-gray-400'}`}>
                  {step > i ? '✓' : i + 1}
                </div>
                {s}
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 max-w-12 ${step > i + 1 ? 'bg-black' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Order Summary always visible */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h3 className="font-bold text-gray-800 mb-3">Order Summary</h3>
          <div className="space-y-2">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name || item.product} × {item.quantity || 1}</span>
                <span className="font-medium">{formatKES(getItemTotal(item))}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between items-center">
            {discountRate > 0 && <span className="text-xs text-green-600 font-medium">7% discount applied</span>}
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-400">Total to pay</p>
              <p className="text-2xl font-bold text-gray-900">{formatKES(total)}</p>
            </div>
          </div>
        </div>

        {/* STEP 1 — Delivery details */}
        {step === 1 && (
          <form onSubmit={handleGenerateCode} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Delivery Details</h3>
            {[
              { label: 'Full Name', value: name, set: setName, type: 'text', placeholder: 'Your full name' },
              { label: 'Phone Number', value: phone, set: setPhone, type: 'tel', placeholder: '07XXXXXXXX' },
            ].map(({ label, value, set, type, placeholder }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
                <input type={type} value={value} onChange={(e) => set(e.target.value)} required placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Delivery Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={2} placeholder="Street, Estate, Town..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 active:scale-95 transition">
              Generate Hawk Code →
            </button>
          </form>
        )}

        {/* STEP 2 — Payment */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Hawk Code */}
            <div className="bg-black text-white rounded-2xl p-6 text-center shadow-lg">
              <p className="text-gray-400 text-sm mb-1">Your Hawk Order Code</p>
              <p className="text-6xl font-black tracking-widest text-amber-400">{hawkCode}</p>
              <p className="text-gray-400 text-xs mt-2">Share this code with the admin when asked</p>
            </div>

            {/* Paybill instructions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📱</span>
                <h3 className="font-bold text-gray-800">Pay via M-Pesa Paybill</h3>
              </div>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><span className="font-bold text-amber-600">1.</span> Go to M-Pesa → Lipa na M-Pesa → Paybill</li>
                <li className="flex gap-2"><span className="font-bold text-amber-600">2.</span> Business No: <span className="font-black text-gray-900 ml-1">{PAYBILL}</span></li>
                <li className="flex gap-2"><span className="font-bold text-amber-600">3.</span> Account No: <span className="font-black text-gray-900 ml-1">{ACCOUNT}</span></li>
                <li className="flex gap-2"><span className="font-bold text-amber-600">4.</span> Amount: <span className="font-black text-gray-900 ml-1">{formatKES(total)}</span></li>
                <li className="flex gap-2"><span className="font-bold text-amber-600">5.</span> Enter PIN and confirm</li>
              </ol>
              <div className="mt-4 grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Paybill</p>
                  <p className="text-3xl font-black text-gray-900">{PAYBILL}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Account</p>
                  <p className="text-3xl font-black text-gray-900">{ACCOUNT}</p>
                </div>
              </div>
            </div>

            {/* Confirm */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-amber-500" />
                <span className="text-sm text-gray-600">
                  I confirm I have sent <span className="font-bold text-gray-900">{formatKES(total)}</span> to Paybill{' '}
                  <span className="font-bold text-gray-900">{PAYBILL}</span>, Account <span className="font-bold text-gray-900">{ACCOUNT}</span>
                </span>
              </label>
              <button onClick={handlePlaceOrder} disabled={loading || !confirmed}
                className={`w-full mt-4 py-3 rounded-xl font-bold text-white transition-all ${
                  loading || !confirmed ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-gray-800 active:scale-95'
                }`}>
                {loading ? 'Placing Order...' : 'Confirm Order ✓'}
              </button>
              <button onClick={() => setStep(1)} className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600">
                ← Back to details
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Done */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-500 text-sm mb-4">
              Your order is pending admin approval. You'll receive a confirmation once approved.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Your Hawk Code</p>
              <p className="text-4xl font-black text-amber-500 tracking-widest">{hawkCode}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/thank-you', { state: { orderId: placedOrderId, hawkCode: placedHawkCode } })} className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800">
                Track Order
              </button>
              <button onClick={() => navigate('/shop')} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50">
                Shop More
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
