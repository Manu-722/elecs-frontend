import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCart } from '../redux/cartSlice';
import { addWishlistItem } from '../redux/WishlistSlice';
import { toast } from 'react-toastify';

const CATEGORIES = ['All', 'Sufurias', 'Non-Stick Pans', 'Induction Cookers', 'Offers'];

const formatKES = (n) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

const isNew = (d) => new Date(d) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

export default function Shop() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((s) => s.cart.items);
  const isAuthenticated = useSelector((s) => s.auth?.isAuthenticated);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);

  const BANNERS = [
    { text: '🔥 Best Sellers — Shop Now', sub: 'Top picks from our collection', bg: 'from-black to-gray-900' },
    { text: '⚡ Induction Cookers', sub: 'Energy-efficient & powerful', bg: 'from-gray-900 to-black' },
    { text: '🏷️ Special Offers', sub: 'Limited time deals — grab yours!', bg: 'from-amber-900 to-black' },
  ];

  useEffect(() => {
    fetch('http://localhost:8000/api/products/')
      .then((r) => r.json())
      .then((d) => { setProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { toast.error('Failed to load products'); setLoading(false); });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
    const matchCat =
      category === 'All' ? true :
      category === 'Offers' ? p.is_offer :
      p.category?.toLowerCase() === category.toLowerCase();
    return matchSearch && matchCat;
  });

  const handleAddToCart = (item) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to add items to cart');
      navigate('/login?returnTo=/shop');
      return;
    }
    const existing = cart.find((c) => c.id === item.id);
    const updated = existing
      ? cart.map((c) => c.id === item.id ? { ...c, quantity: (c.quantity || 1) + 1 } : c)
      : [...cart, { ...item, quantity: 1 }];
    dispatch(setCart(updated));
    toast.success(`"${item.name}" added to cart!`);
  };

  const handleWishlist = (item) => {
    if (!isAuthenticated) { toast.info('Please sign in to save items'); return; }
    dispatch(addWishlistItem(item));
    toast.success('Saved to wishlist ❤️');
  };

  const banner = BANNERS[bannerIdx];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className={`bg-gradient-to-r ${banner.bg} text-white py-12 px-6 text-center`}>
        <h2 className="text-3xl font-bold mb-1">{banner.text}</h2>
        <p className="text-gray-400 text-sm">{banner.sub}</p>
        <div className="flex justify-center gap-2 mt-4">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setBannerIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === bannerIdx ? 'bg-amber-400 w-6' : 'bg-gray-600'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sufurias, pans, cookers..."
              className="w-full pl-11 pr-10 py-3 rounded-full border border-gray-200 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                category === cat
                  ? cat === 'Offers'
                    ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                    : 'bg-black text-white border-black shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}>
              {cat === 'Offers' ? '🏷️ ' + cat : cat}
            </button>
          ))}
        </div>

        {/* Count */}
        <div className="flex justify-between items-center mb-5 text-sm text-gray-500">
          <span>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
          {(search || category !== 'All') && (
            <button onClick={() => { setSearch(''); setCategory('All'); }} className="text-amber-600 hover:underline font-medium">
              Clear all ✕
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-3">🍳</p>
            <p className="text-gray-500 text-lg font-medium">No products found</p>
            <button onClick={() => { setSearch(''); setCategory('All'); }} className="mt-3 text-amber-600 hover:underline text-sm">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((item) => {
              const displayPrice = item.is_offer && item.offer_price ? item.offer_price : item.price;
              return (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100">
                  <div className="relative overflow-hidden">
                    <img
                      src={`http://localhost:8000/media/${item.image}`}
                      alt={item.name}
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {isNew(item.created_at) && (
                        <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
                      )}
                      {item.is_offer && (
                        <span className="bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">OFFER</span>
                      )}
                    </div>
                    {!item.in_stock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-sm bg-black/80 px-3 py-1 rounded-full">Sold Out</span>
                      </div>
                    )}
                    <button onClick={() => handleWishlist(item)}
                      className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow hover:scale-110 transition-transform text-sm">
                      ❤️
                    </button>
                  </div>

                  <div className="p-3 flex flex-col flex-1">
                    <span className="text-xs text-amber-600 font-semibold uppercase tracking-wide">{item.category}</span>
                    <h3 className="text-gray-900 font-bold text-sm mt-0.5 line-clamp-2">{item.name}</h3>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2 flex-1">{item.description}</p>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        {item.is_offer && item.offer_price ? (
                          <div>
                            <span className="text-xs text-gray-400 line-through">{formatKES(item.price)}</span>
                            <p className="text-amber-600 font-bold text-base">{formatKES(item.offer_price)}</p>
                          </div>
                        ) : (
                          <p className="text-gray-900 font-bold text-base">{formatKES(item.price)}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.in_stock}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          item.in_stock
                            ? 'bg-black text-white hover:bg-gray-800 active:scale-95'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}>
                        {item.in_stock ? '+ Cart' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
