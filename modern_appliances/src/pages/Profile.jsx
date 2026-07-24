import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const formatKES = (n) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

const getToken = () => { try { return JSON.parse(localStorage.getItem('authToken'))?.access; } catch { return null; } };

export default function Profile() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s) => s.auth?.isAuthenticated);
  const user = useSelector((s) => s.auth?.user);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [tab, setTab] = useState('orders');

  // Password change
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login?returnTo=/profile'); return; }
    fetch('http://localhost:8000/api/orders/history/', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => { setOrders(Array.isArray(d) ? d : []); setLoadingOrders(false); })
      .catch(() => { toast.error('Failed to load orders'); setLoadingOrders(false); });
  }, [isAuthenticated, navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auth/change-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ old_password: oldPw, new_password: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to change password'); return; }
      toast.success('Password changed successfully!');
      setOldPw(''); setNewPw(''); setConfirmPw('');
    } catch { toast.error('Something went wrong'); }
    finally { setPwLoading(false); }
  };

  const displayName = user?.username || user?.email?.split('@')[0] || 'User';

  const statusColor = (s) => ({
    Confirmed: 'bg-amber-400/20 text-amber-400',
    Pending: 'bg-gray-800 text-gray-300',
    Cancelled: 'bg-gray-800 text-gray-500',
  }[s] || 'bg-gray-800 text-gray-500');

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-black rounded-2xl p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center text-2xl font-black text-black">
            {displayName[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">{displayName}</h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'orders', label: '📦 My Orders' },
            { id: 'password', label: '🔒 Change Password' },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {loadingOrders ? (
              [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                <p className="text-4xl mb-3">📦</p>
                <p className="text-gray-500 font-medium">No orders yet</p>
                <button onClick={() => navigate('/shop')} className="mt-4 bg-black text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-800">
                  Start Shopping
                </button>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900">Order #{o.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(o.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold text-gray-900">{formatKES(o.total)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">Hawk Code</p>
                      <p className="font-black text-amber-600 text-lg tracking-widest">{o.hawk_code || '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">Payment</p>
                      <p className="font-bold text-gray-900 text-xs">{o.paid ? '✓ Paid' : '⏳ Pending'}</p>
                    </div>
                  </div>
                  {o.address && (
                    <p className="text-xs text-gray-400 mt-3">📍 {o.address}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-5">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { label: 'Current Password', value: oldPw, set: setOldPw },
                { label: 'New Password', value: newPw, set: setNewPw },
                { label: 'Confirm New Password', value: confirmPw, set: setConfirmPw },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
                  <input type="password" value={value} onChange={(e) => set(e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              ))}
              <button type="submit" disabled={pwLoading}
                className={`w-full py-3 rounded-xl font-bold text-white transition ${pwLoading ? 'bg-gray-300' : 'bg-black hover:bg-gray-800'}`}>
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
