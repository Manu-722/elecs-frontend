import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ADMIN_EMAILS = ['admin1@induction.com', 'admin2@induction.com'];
const CATEGORIES = ['Sufurias & Cookware', 'Non-Stick Pans', 'Induction Cookers', 'Offers'];
const API = 'http://localhost:8000/api';

const getToken = () => {
  try { const r = localStorage.getItem('authToken'); return r ? JSON.parse(r)?.access : null; } catch { return null; }
};
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });
const formatKES = (n) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'products', label: '📦 Products' },
  { id: 'add',      label: '➕ Add Product' },
  { id: 'orders',   label: '🧾 Orders' },
];

const statusBadge = (s) => ({
  Confirmed: 'bg-amber-400/20 text-amber-500',
  Pending:   'bg-gray-700 text-gray-300',
  Cancelled: 'bg-gray-800 text-gray-500',
}[s] || 'bg-gray-800 text-gray-500');

export default function AdminDashboard() {
  const user = useSelector((s) => s.auth?.user);
  const isAuthenticated = useSelector((s) => s.auth?.isAuthenticated);
  const navigate = useNavigate();

  const isAdmin = isAuthenticated &&
    (user?.is_admin === true || ADMIN_EMAILS.includes(user?.email?.toLowerCase()));
  const username = user?.username || user?.email?.split('@')[0] || '';

  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    name: '', price: '', description: '', category: 'Sufurias',
    material: '', wattage: '', dimensions: '', weight: '',
    color: '', warranty: '', in_stock: true, features: '',
    is_offer: false, offer_price: '',
  });

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!isAdmin) { toast.error('Access denied'); navigate('/'); }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch(`${API}/admin/orders/`, { headers: authHeaders() })
      .then((r) => r.json()).then((d) => { setOrders(Array.isArray(d) ? d : []); setLoadingOrders(false); })
      .catch(() => { toast.error('Failed to load orders'); setLoadingOrders(false); });
    fetch(`${API}/products/`)
      .then((r) => r.json()).then((d) => { setProducts(Array.isArray(d) ? d : []); setLoadingProducts(false); })
      .catch(() => { toast.error('Failed to load products'); setLoadingProducts(false); });
  }, [isAdmin]);

  const resetForm = () => {
    setForm({ name: '', price: '', description: '', category: 'Sufurias', material: '', wattage: '', dimensions: '', weight: '', color: '', warranty: '', in_stock: true, features: '', is_offer: false, offer_price: '' });
    setImageFile(null); setImagePreview(null); setEditingProduct(null);
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setImageFile(f); setImagePreview(URL.createObjectURL(f));
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0]; if (!f) return;
    setImageFile(f); setImagePreview(URL.createObjectURL(f));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!imageFile && !editingProduct) { toast.error('Please select a product image'); return; }
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (imageFile) fd.append('image', imageFile);
    const url = editingProduct ? `${API}/admin/products/${editingProduct.id}/update/` : `${API}/admin/products/add/`;
    try {
      const res = await fetch(url, { method: editingProduct ? 'PATCH' : 'POST', headers: authHeaders(), body: fd });
      if (!res.ok) throw new Error();
      toast.success(editingProduct ? 'Product updated!' : 'Product added!');
      const updated = await fetch(`${API}/products/`).then((r) => r.json());
      setProducts(Array.isArray(updated) ? updated : []);
      resetForm(); setTab('products');
    } catch { toast.error('Failed to save product'); }
    finally { setSubmitting(false); }
  };

  const startEdit = (p) => {
    setEditingProduct(p);
    setForm({ name: p.name, price: p.price, description: p.description, category: p.category, material: p.material || '', wattage: p.wattage || '', dimensions: p.dimensions || '', weight: p.weight || '', color: p.color || '', warranty: p.warranty || '', in_stock: p.in_stock, features: Array.isArray(p.features) ? p.features.join(', ') : '', is_offer: p.is_offer || false, offer_price: p.offer_price || '' });
    setImagePreview(`http://localhost:8000/media/${p.image}`);
    setTab('add');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await fetch(`${API}/admin/products/${id}/delete/`, { method: 'DELETE', headers: authHeaders() });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
  };

  const confirmOrder = async (orderId) => {
    try {
      await fetch(`${API}/admin/orders/${orderId}/confirm/`, { method: 'POST', headers: authHeaders() });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'Confirmed', paid: true } : o));
      toast.success('Order confirmed!');
    } catch { toast.error('Failed to confirm order'); }
  };

  if (!isAdmin) return null;

  const totalRevenue = orders.filter((o) => o.paid).reduce((s, o) => s + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;

  const inputCls = 'w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800';

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-black text-white flex flex-col min-h-screen shadow-xl flex-shrink-0">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <img src="http://localhost:8000/media/shoes/Hawk_logo.jpeg" alt="Hawk"
              className="w-8 h-8 rounded-full object-cover border border-amber-400"
              onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-amber-400 font-black text-base">Hawk Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs font-black">
              {username[0]?.toUpperCase()}
            </div>
            <span className="text-gray-400 text-xs truncate">{username}</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {TABS.map((t) => (
            <button key={t.id}
              onClick={() => { setTab(t.id); if (t.id !== 'add') resetForm(); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.id ? 'bg-amber-400 text-black font-black' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white text-xs transition">
            ← Back to Store
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <h2 className="text-xl font-black text-gray-800 mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Products', value: products.length, icon: '📦' },
                { label: 'Total Orders', value: orders.length, icon: '🧾' },
                { label: 'Pending', value: pendingOrders, icon: '⏳' },
                { label: 'Revenue', value: formatKES(totalRevenue), icon: '💰' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <p className="text-gray-500 text-xs font-medium">{s.label}</p>
                  <p className="text-xl font-black text-gray-900 mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-black text-gray-800 mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100 text-xs uppercase tracking-wide">
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Total</th>
                      <th className="pb-3 pr-4">Code</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 6).map((o) => (
                      <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium text-gray-800">{o.user}</td>
                        <td className="py-3 pr-4 font-black text-amber-600">{formatKES(o.total)}</td>
                        <td className="py-3 pr-4 font-black text-gray-700 tracking-widest">{o.hawk_code || '—'}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge(o.status)}`}>{o.status}</span>
                        </td>
                        <td className="py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-800">Products ({products.length})</h2>
              <button onClick={() => { resetForm(); setTab('add'); }}
                className="bg-amber-400 hover:bg-amber-300 text-black px-5 py-2 rounded-full text-sm font-black shadow transition">
                + Add Product
              </button>
            </div>
            {loadingProducts ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-3">📦</p><p>No products yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition border border-gray-100">
                    <img src={`http://localhost:8000/media/${p.image}`} alt={p.name} className="h-40 w-full object-cover" />
                    <div className="p-4">
                      <span className="text-xs text-amber-600 font-bold uppercase tracking-wide">{p.category}</span>
                      <h3 className="font-black text-gray-800 mt-0.5 text-sm line-clamp-1">{p.name}</h3>
                      <p className="text-gray-800 font-black mt-1 text-sm">{formatKES(p.price)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.in_stock ? 'bg-amber-400/20 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                          {p.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        {p.is_offer && <span className="text-xs bg-black text-amber-400 px-2 py-0.5 rounded-full font-bold">OFFER</span>}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => startEdit(p)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold transition">
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-lg text-xs font-bold transition">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD / EDIT PRODUCT */}
        {tab === 'add' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-black text-gray-800 mb-5">
              {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmitProduct} className="bg-white rounded-2xl shadow-sm p-6 space-y-5 border border-gray-100">

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Image *</label>
                <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 transition">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="h-36 mx-auto object-contain rounded-xl" />
                  ) : (
                    <div className="text-gray-400">
                      <p className="text-4xl mb-2">📷</p>
                      <p className="text-sm">Drag & drop or <span className="text-amber-500 font-bold">browse files</span></p>
                      <p className="text-xs mt-1 text-gray-300">PNG, JPG, WEBP — from gallery, files or folder</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview && (
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="mt-2 text-xs text-gray-400 hover:text-gray-600 hover:underline">
                    Remove image
                  </button>
                )}
              </div>

              {/* Name & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls} placeholder="e.g. Hawk Sufuria Set" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price (KES) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputCls} placeholder="e.g. 2500" required />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} className={inputCls} placeholder="Product description..." />
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'material', label: 'Material', ph: 'e.g. Stainless Steel' },
                  { key: 'wattage',  label: 'Wattage',  ph: 'e.g. 2000W' },
                  { key: 'dimensions', label: 'Dimensions', ph: 'e.g. 30x30cm' },
                  { key: 'weight',   label: 'Weight',   ph: 'e.g. 1.5kg' },
                  { key: 'color',    label: 'Color',    ph: 'e.g. Black' },
                  { key: 'warranty', label: 'Warranty', ph: 'e.g. 1 Year' },
                ].map(({ key, label, ph }) => (
                  <div key={key}>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
                    <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className={inputCls} placeholder={ph} />
                  </div>
                ))}
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Features (comma-separated)</label>
                <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className={inputCls} placeholder="e.g. Non-stick coating, Dishwasher safe" />
              </div>

              {/* Offer toggle */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm({ ...form, is_offer: !form.is_offer })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${form.is_offer ? 'bg-amber-400' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_offer ? 'left-6' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Mark as Offer</span>
                </label>
                {form.is_offer && (
                  <div className="flex-1">
                    <input type="number" value={form.offer_price} onChange={(e) => setForm({ ...form, offer_price: e.target.value })}
                      className={inputCls} placeholder="Offer price (KES)" />
                  </div>
                )}
              </div>

              {/* In Stock */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setForm({ ...form, in_stock: !form.in_stock })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${form.in_stock ? 'bg-amber-400' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.in_stock ? 'left-6' : 'left-1'}`} />
                </div>
                <span className="text-sm font-bold text-gray-700">In Stock</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition ${submitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-amber-400 text-black hover:bg-amber-300'}`}>
                  {submitting ? 'Saving…' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={resetForm}
                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <h2 className="text-xl font-black text-gray-800 mb-6">Orders ({orders.length})</h2>
            {loadingOrders ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl h-14 animate-pulse" />)}</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400"><p className="text-4xl mb-3">🧾</p><p>No orders yet.</p></div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
                        {['#', 'Customer', 'Phone', 'Total', 'Code', 'Paid', 'Status', 'Date', 'Action'].map((h) => (
                          <th key={h} className="px-4 py-3 font-bold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-400 text-xs">#{o.id}</td>
                          <td className="px-4 py-3 font-bold text-gray-800">{o.user}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{o.phone || '—'}</td>
                          <td className="px-4 py-3 font-black text-amber-600">{formatKES(o.total)}</td>
                          <td className="px-4 py-3 font-black text-gray-700 tracking-widest">{o.hawk_code || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${o.paid ? 'bg-amber-400/20 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                              {o.paid ? '✓ Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge(o.status)}`}>{o.status}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            {o.status === 'Pending' && (
                              <button onClick={() => confirmOrder(o.id)}
                                className="bg-amber-400 hover:bg-amber-300 text-black px-3 py-1.5 rounded-lg text-xs font-black transition">
                                Confirm
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
