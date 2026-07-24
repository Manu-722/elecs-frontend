import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { toast } from 'react-toastify';

const NAVY = '#0f172a';

const FALLBACK_SLIDES = [
  { id: 'f1', name: 'Edenberg Sufuria Set', description: 'Premium stainless steel sufuria set — perfect for every kitchen.', price: 3500, rawSrc: 'http://localhost:8000/media/shoes/Edenberg_sufuria_set.jpeg', is_offer: false, category: 'Sufurias & Cookware' },
  { id: 'f2', name: 'Hawk Sufuria', description: 'Durable, energy-efficient cooking with the Hawk sufuria range.', price: 2200, rawSrc: 'http://localhost:8000/media/shoes/Hawk_sufuria.jpeg', is_offer: true, offer_price: 1800, category: 'Sufurias & Cookware' },
  { id: 'f3', name: 'Hawk Single Burner', description: 'Compact induction cooker — powerful, portable and precise.', price: 4500, rawSrc: 'http://localhost:8000/media/shoes/Hawk_single_burner.jpeg', is_offer: false, category: 'Induction Cookers' },
  { id: 'f4', name: 'Non-Stick Pan Set', description: 'Effortless cooking with our premium non-stick pan collection.', price: 2800, rawSrc: 'http://localhost:8000/media/shoes/Hawk_logo.jpeg', is_offer: false, category: 'Non-Stick Pans' },
  { id: 'f5', name: 'Hawk Cookware Bundle', description: 'Complete kitchen bundle — everything you need in one set.', price: 7500, rawSrc: 'http://localhost:8000/media/shoes/Edenberg_sufuria_set.jpeg', is_offer: true, offer_price: 6200, category: 'Sufurias & Cookware' },
  { id: 'f6', name: 'Induction Cooker Pro', description: 'Professional-grade induction cooker for the modern kitchen.', price: 8900, rawSrc: 'http://localhost:8000/media/shoes/Hawk_single_burner.jpeg', is_offer: false, category: 'Induction Cookers' },
];

const CATEGORIES = [
  { key: 'all',       label: 'All Products',        icon: '🏠' },
  { key: 'Offers',    label: 'Offers',               icon: '🏷️' },
  { key: 'Induction Cookers',       label: 'Induction Cookers',   icon: '⚡' },
  { key: 'Sufurias & Cookware',     label: 'Sufurias & Cookware', icon: '🍲' },
  { key: 'Non-Stick Pans',          label: 'Non-Stick Pans',      icon: '🍳' },
];

const FAQS = [
  { q: 'Where are you located?', a: 'We are at Royal Palms Mall, RNG Plaza BS43, Nairobi.' },
  { q: 'How do I place an order?', a: 'Browse our products, add items to your cart, and proceed to checkout. We accept M-Pesa Paybill 522522, Account 7518213.' },
  { q: 'Do you offer delivery?', a: 'Yes! We offer same-day delivery within Nairobi. Contact us on +254 112 660 355 to arrange delivery.' },
  { q: 'What is your return policy?', a: 'We accept returns within 7 days of purchase for unused items in original packaging. Contact us to initiate a return.' },
  { q: 'Are your products under warranty?', a: 'Yes, all Hawk Life products come with a manufacturer warranty. Warranty periods vary by product — check the product details.' },
  { q: 'Can I get a bulk/wholesale discount?', a: 'Absolutely! Contact us directly on +254 112 660 355 for bulk pricing and wholesale inquiries.' },
];

const formatKES = (n) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

const isNewProduct = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) > new Date(Date.now() - 24 * 60 * 60 * 1000);
};

const getImgSrc = (p) => p.rawSrc || `http://localhost:8000/media/${p.image}`;

export default function Home() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth?.isAuthenticated);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const searchRef = useRef(null);
  const productsRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/products/')
      .then((r) => r.json())
      .then((d) => { setProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Slideshow: use first 6 real products or fallback
  const slides = (products.length > 0 ? products : FALLBACK_SLIDES).slice(0, 6);

  useEffect(() => {
    if (!slides.length) return;
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [slides.length]);

  // Filtered products
  const filtered = (products.length > 0 ? products : FALLBACK_SLIDES).filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
    const matchCat =
      activeCategory === 'all' ? true :
      activeCategory === 'Offers' ? p.is_offer :
      p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleAddToCart = (p) => {
    if (!isAuthenticated) { toast.error('Please login to add to cart'); return; }
    dispatch(addToCart({ id: p.id, name: p.name, price: p.is_offer && p.offer_price ? p.offer_price : p.price, image: p.image, quantity: 1 }));
    toast.success(`${p.name} added to cart!`);
    setSelectedProduct(null);
  };

  const current = slides[slideIndex];

  return (
    <div className="min-h-screen bg-white">

      {/* ── SLIDESHOW ── dark navy */}
      <section className="relative overflow-hidden" style={{ background: NAVY, height: '88vh' }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {slides.map((p, i) => (
              <div key={p.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === slideIndex ? 'opacity-100' : 'opacity-0'}`}>
                <img
                  src={getImgSrc(p)}
                  alt={p.name}
                  className="w-full h-full object-cover opacity-30"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${NAVY} 40%, ${NAVY}99 70%, transparent)` }} />
              </div>
            ))}

            {current && (
              <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-20 text-white">
                <div className="max-w-2xl">
                  <span className="inline-block text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">{current.category}</span>
                  {current.is_offer && (
                    <span className="ml-3 inline-block bg-amber-400 text-black text-xs font-black px-3 py-0.5 rounded-full uppercase">🏷️ Offer</span>
                  )}
                  <h1 className="text-3xl md:text-5xl font-black mb-2 leading-tight">{current.name}</h1>
                  <p className="text-slate-300 text-sm md:text-base mb-4 line-clamp-2">{current.description}</p>
                  <div className="flex items-center gap-3 mb-6">
                    {current.is_offer && current.offer_price ? (
                      <>
                        <span className="text-slate-400 line-through text-lg">{formatKES(current.price)}</span>
                        <span className="text-amber-400 font-black text-3xl md:text-4xl">{formatKES(current.offer_price)}</span>
                      </>
                    ) : (
                      <span className="text-amber-400 font-black text-3xl md:text-4xl">{formatKES(current.price)}</span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setSelectedProduct(current)}
                      className="bg-amber-400 text-black font-black px-8 py-3 rounded-full hover:bg-amber-300 active:scale-95 transition-all text-sm">
                      View Details
                    </button>
                    <button onClick={() => handleAddToCart(current)}
                      className="border border-white/30 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-all text-sm">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dot indicators */}
            <div className="absolute bottom-6 right-6 md:right-16 flex gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setSlideIndex(i)}
                  className={`rounded-full transition-all duration-300 ${i === slideIndex ? 'bg-amber-400 w-8 h-2' : 'bg-white/30 w-2 h-2 hover:bg-white/60'}`} />
              ))}
            </div>

            {/* Arrows */}
            <button onClick={() => setSlideIndex((i) => (i - 1 + slides.length) % slides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition">‹</button>
            <button onClick={() => setSlideIndex((i) => (i + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition">›</button>

            {/* Slide counter */}
            <div className="absolute top-4 right-6 text-white/50 text-xs font-mono">
              {String(slideIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </div>
          </>
        )}
      </section>

      {/* ── SEARCH BAR ── */}
      <div className="bg-white px-4 py-6 shadow-sm sticky top-14 z-30 border-b border-gray-100">
        <div className="max-w-2xl mx-auto relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveCategory('all'); }}
            placeholder="Search sufurias, pans, induction cookers..."
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm text-gray-800 placeholder-gray-400 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
          )}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="bg-white px-4 pt-6 pb-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setSearch(''); productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  activeCategory === cat.key
                    ? 'text-white border-transparent shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-slate-400'
                }`}
                style={activeCategory === cat.key ? { background: NAVY } : {}}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRODUCTS GRID ── */}
      <section ref={productsRef} className="bg-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-xl text-gray-900">
              {CATEGORIES.find((c) => c.key === activeCategory)?.label || 'Products'}
              <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
            </h2>
            {(search || activeCategory !== 'all') && (
              <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="text-xs text-amber-600 hover:underline font-semibold">
                Clear ✕
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-3">🍳</p>
              <p className="text-gray-500 font-medium">No products found</p>
              <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="mt-2 text-amber-600 text-sm hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden cursor-pointer group transition-all duration-200"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={getImgSrc(p)}
                      alt={p.name}
                      className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'http://localhost:8000/media/shoes/Hawk_logo.jpeg'; }}
                    />
                    {/* NEW badge — top RIGHT, only if updated within 24h */}
                    {isNewProduct(p.updated_at || p.created_at) && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
                        NEW
                      </span>
                    )}
                    {/* OFFER badge — top LEFT */}
                    {p.is_offer && (
                      <span className="absolute top-2 left-2 bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        OFFER
                      </span>
                    )}
                    {p.in_stock === false && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-black/70 px-3 py-1 rounded-full">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">{p.category}</p>
                    <h3 className="text-gray-900 font-bold text-sm mt-0.5 line-clamp-1">{p.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        {p.is_offer && p.offer_price ? (
                          <div>
                            <span className="text-gray-400 text-xs line-through">{formatKES(p.price)}</span>
                            <p className="text-amber-600 font-black text-sm">{formatKES(p.offer_price)}</p>
                          </div>
                        ) : (
                          <p className="text-gray-900 font-black text-sm">{formatKES(p.price)}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }}
                        disabled={p.in_stock === false}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                          p.in_stock === false
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'text-white hover:opacity-90 active:scale-95'
                        }`}
                        style={p.in_stock !== false ? { background: NAVY } : {}}
                      >
                        + Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY HAWK ── */}
      <section className="px-4 py-12" style={{ background: NAVY }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
          {[
            { icon: '⚡', title: 'Energy Efficient', desc: 'Save up to 70% on energy costs with our induction technology' },
            { icon: '🛡️', title: 'Quality Guaranteed', desc: 'All products come with warranty and after-sales support' },
            { icon: '🚚', title: 'Fast Delivery', desc: 'Nairobi same-day delivery available on all orders' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl p-6 border border-white/10 bg-white/5">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-white font-bold text-base mb-1">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white px-4 py-14">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900">Frequently Asked <span style={{ color: NAVY }}>Questions</span></h2>
            <p className="text-gray-500 text-sm mt-1">Everything you need to know about Hawk Life Solutions</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-800 text-sm">{faq.q}</span>
                  <span className={`text-gray-400 text-lg transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-gray-500 text-sm leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-8 rounded-2xl p-6 text-center text-white" style={{ background: NAVY }}>
            <p className="font-black text-base mb-1">Still have questions?</p>
            <p className="text-slate-400 text-sm mb-4">We're here to help — reach out anytime</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+254112660355"
                className="bg-amber-400 text-black font-black px-6 py-2.5 rounded-full text-sm hover:bg-amber-300 transition">
                📞 +254 112 660 355
              </a>
              <span className="text-slate-400 text-sm self-center">📍 Royal Palms Mall, RNG Plaza BS43</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT DETAIL MODAL ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img
                src={getImgSrc(selectedProduct)}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-t-3xl"
                onError={(e) => { e.target.src = 'http://localhost:8000/media/shoes/Hawk_logo.jpeg'; }}
              />
              <button onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black transition text-sm">✕</button>
              {selectedProduct.is_offer && (
                <span className="absolute top-3 left-3 bg-amber-400 text-black text-xs font-black px-3 py-1 rounded-full">OFFER</span>
              )}
              {isNewProduct(selectedProduct.updated_at || selectedProduct.created_at) && (
                <span className="absolute top-3 right-12 bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full">NEW</span>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-amber-600 text-xs font-bold uppercase tracking-widest">{selectedProduct.category}</p>
                <h2 className="text-gray-900 font-black text-xl mt-1">{selectedProduct.name}</h2>
                <div className="mt-2">
                  {selectedProduct.is_offer && selectedProduct.offer_price ? (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 line-through text-sm">{formatKES(selectedProduct.price)}</span>
                      <span className="text-amber-600 font-black text-2xl">{formatKES(selectedProduct.offer_price)}</span>
                    </div>
                  ) : (
                    <span className="font-black text-2xl" style={{ color: NAVY }}>{formatKES(selectedProduct.price)}</span>
                  )}
                </div>
              </div>
              {selectedProduct.description && (
                <p className="text-gray-500 text-sm leading-relaxed">{selectedProduct.description}</p>
              )}
              {(selectedProduct.material || selectedProduct.wattage || selectedProduct.weight || selectedProduct.warranty) && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Material', val: selectedProduct.material },
                    { label: 'Wattage', val: selectedProduct.wattage },
                    { label: 'Weight', val: selectedProduct.weight },
                    { label: 'Warranty', val: selectedProduct.warranty },
                    { label: 'Color', val: selectedProduct.color },
                    { label: 'Dimensions', val: selectedProduct.dimensions },
                  ].filter((s) => s.val).map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                      <p className="text-gray-400 text-xs">{s.label}</p>
                      <p className="text-gray-800 text-sm font-semibold">{s.val}</p>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => handleAddToCart(selectedProduct)}
                disabled={selectedProduct.in_stock === false}
                className={`w-full py-3.5 rounded-2xl font-black text-sm transition ${
                  selectedProduct.in_stock === false
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'text-white hover:opacity-90 active:scale-95'
                }`}
                style={selectedProduct.in_stock !== false ? { background: NAVY } : {}}
              >
                {selectedProduct.in_stock === false ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
