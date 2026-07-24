import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { toast } from 'react-toastify';

// Fallback slides using existing media images
const FALLBACK_SLIDES = [
  {
    id: 'f1',
    name: 'Edenberg Sufuria Set',
    description: 'Premium stainless steel sufuria set — perfect for every kitchen.',
    price: 3500,
    image: null,
    rawSrc: 'http://localhost:8000/media/shoes/Edenberg_sufuria_set.jpeg',
    is_offer: false,
    category: 'Sufurias',
  },
  {
    id: 'f2',
    name: 'Hawk Sufuria',
    description: 'Durable, energy-efficient cooking with the Hawk sufuria range.',
    price: 2200,
    image: null,
    rawSrc: 'http://localhost:8000/media/shoes/Hawk_sufuria.jpeg',
    is_offer: true,
    offer_price: 1800,
    category: 'Sufurias',
  },
];

const formatKES = (n) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

export default function Home() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth?.isAuthenticated);
  const [products, setProducts] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/products/')
      .then((r) => r.json())
      .then((d) => {
        setProducts(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Use real products for slides, fall back to static images
  const slides = products.length > 0 ? products : FALLBACK_SLIDES;

  const getImgSrc = (p) => p.rawSrc || `http://localhost:8000/media/${p.image}`;

  const handleAddToCart = (p) => {
    if (!isAuthenticated) { toast.error('Please login to add to cart'); return; }
    dispatch(addToCart({ id: p.id, name: p.name, price: p.is_offer && p.offer_price ? p.offer_price : p.price, image: p.image, quantity: 1 }));
    toast.success(`${p.name} added to cart!`);
    setSelectedProduct(null);
  };

  // Auto-advance slideshow
  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, 3500);
    return () => clearInterval(t);
  }, [slides.length]);

  const current = slides[slideIndex];

  return (
    <div className="min-h-screen bg-black">

      {/* ── HERO SLIDESHOW ── */}
      <section className="relative h-[92vh] overflow-hidden bg-black">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Slide images */}
            {slides.map((p, i) => (
              <div
                key={p.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${i === slideIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                <img
                  src={getImgSrc(p)}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'http://localhost:8000/media/shoes/Hawk_logo.jpeg'; }}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>
            ))}

            {/* Slide content */}
            {current && (
              <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-16 text-white">
                <div className="max-w-2xl">
                  {current.is_offer && (
                    <span className="inline-block bg-amber-400 text-black text-xs font-black px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                      🏷️ Special Offer
                    </span>
                  )}
                  <h1 className="text-3xl md:text-5xl font-black mb-2 leading-tight">{current.name}</h1>
                  <p className="text-gray-300 text-sm md:text-base mb-4 line-clamp-2">{current.description}</p>

                  <div className="flex items-center gap-4 mb-6">
                    {current.is_offer && current.offer_price ? (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 line-through text-lg">{formatKES(current.price)}</span>
                        <span className="text-amber-400 font-black text-3xl md:text-4xl">{formatKES(current.offer_price)}</span>
                      </div>
                    ) : (
                      <span className="text-amber-400 font-black text-3xl md:text-4xl">{formatKES(current.price)}</span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedProduct(current)}
                      className="bg-amber-400 text-black font-black px-8 py-3 rounded-full hover:bg-amber-300 active:scale-95 transition-all text-sm md:text-base"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAddToCart(current)}
                      className="border border-white/30 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-all text-sm md:text-base"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Slide indicators */}
            <div className="absolute bottom-6 right-6 md:right-16 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === slideIndex
                      ? 'bg-amber-400 w-8 h-2'
                      : 'bg-white/30 w-2 h-2 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            {/* Prev / Next arrows */}
            <button
              onClick={() => setSlideIndex((i) => (i - 1 + slides.length) % slides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition"
            >
              ‹
            </button>
            <button
              onClick={() => setSlideIndex((i) => (i + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition"
            >
              ›
            </button>
          </>
        )}
      </section>

      {/* ── PRODUCT GRID ── */}
      <section className="bg-gray-950 py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-white font-black text-2xl md:text-3xl">
              Featured <span className="text-amber-400">Products</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-900 rounded-2xl h-56 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(products.length > 0 ? products : FALLBACK_SLIDES).slice(0, 8).map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="bg-gray-900 rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={getImgSrc(p)}
                      alt={p.name}
                      className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'http://localhost:8000/media/shoes/Hawk_logo.jpeg'; }}
                    />
                    {p.is_offer && (
                      <span className="absolute top-2 left-2 bg-amber-400 text-black text-xs font-black px-2 py-0.5 rounded-full">OFFER</span>
                    )}
                    {p.in_stock === false && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-black/80 px-3 py-1 rounded-full">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-amber-500 font-semibold uppercase tracking-wide">{p.category}</p>
                    <h3 className="text-white font-bold text-sm mt-0.5 line-clamp-1">{p.name}</h3>
                    <div className="mt-2">
                      {p.is_offer && p.offer_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs line-through">{formatKES(p.price)}</span>
                          <span className="text-amber-400 font-black text-sm">{formatKES(p.offer_price)}</span>
                        </div>
                      ) : (
                        <span className="text-amber-400 font-black text-sm">{formatKES(p.price)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUCT DETAIL MODAL ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setSelectedProduct(null)}>
          <div
            className="bg-gray-950 border border-gray-800 rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={getImgSrc(selectedProduct)}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-t-3xl md:rounded-t-3xl"
                onError={(e) => { e.target.src = 'http://localhost:8000/media/shoes/Hawk_logo.jpeg'; }}
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black transition"
              >
                ✕
              </button>
              {selectedProduct.is_offer && (
                <span className="absolute top-3 left-3 bg-amber-400 text-black text-xs font-black px-3 py-1 rounded-full">OFFER</span>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">{selectedProduct.category}</p>
                <h2 className="text-white font-black text-xl mt-1">{selectedProduct.name}</h2>
                <div className="mt-2">
                  {selectedProduct.is_offer && selectedProduct.offer_price ? (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 line-through text-sm">{formatKES(selectedProduct.price)}</span>
                      <span className="text-amber-400 font-black text-2xl">{formatKES(selectedProduct.offer_price)}</span>
                    </div>
                  ) : (
                    <span className="text-amber-400 font-black text-2xl">{formatKES(selectedProduct.price)}</span>
                  )}
                </div>
              </div>

              {selectedProduct.description && (
                <p className="text-gray-400 text-sm leading-relaxed">{selectedProduct.description}</p>
              )}

              {/* Specs */}
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
                    <div key={s.label} className="bg-gray-900 rounded-xl px-3 py-2">
                      <p className="text-gray-500 text-xs">{s.label}</p>
                      <p className="text-white text-sm font-semibold">{s.val}</p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => handleAddToCart(selectedProduct)}
                disabled={selectedProduct.in_stock === false}
                className={`w-full py-3.5 rounded-2xl font-black text-sm transition ${
                  selectedProduct.in_stock === false
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-400 text-black hover:bg-amber-300 active:scale-95'
                }`}
              >
                {selectedProduct.in_stock === false ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WHY HAWK ── */}
      <section className="bg-black py-14 px-4 border-t border-gray-900">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: '⚡', title: 'Energy Efficient', desc: 'Save up to 70% on energy costs with our induction technology' },
            { icon: '🛡️', title: 'Quality Guaranteed', desc: 'All products come with warranty and after-sales support' },
            { icon: '🚚', title: 'Fast Delivery', desc: 'Nairobi same-day delivery available on all orders' },
          ].map((f) => (
            <div key={f.title} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
