import React, { useState } from 'react';

const NAVY = '#0f172a';

const FAQS = [
  { q: 'Where are you located?', a: 'We are at Royal Palms Mall, RNG Plaza BS43, Nairobi.' },
  { q: 'How do I place an order?', a: 'Browse our products, add items to your cart, and proceed to checkout. We accept M-Pesa Paybill 522522, Account 7518213.' },
  { q: 'Do you offer delivery?', a: 'Yes! We offer same-day delivery within Nairobi. Contact us on +254 112 660 355 to arrange delivery.' },
  { q: 'What is your return policy?', a: 'We accept returns within 7 days of purchase for unused items in original packaging. Contact us to initiate a return.' },
  { q: 'Are your products under warranty?', a: 'Yes, all Hawk Life products come with a manufacturer warranty. Warranty periods vary by product — check the product details page.' },
  { q: 'Can I get a bulk or wholesale discount?', a: 'Absolutely! Contact us directly on +254 112 660 355 for bulk pricing and wholesale inquiries.' },
  { q: 'What payment methods do you accept?', a: 'We accept M-Pesa via Paybill 522522, Account 7518213. More payment options coming soon.' },
  { q: 'How long does delivery take?', a: 'Same-day delivery is available within Nairobi for orders placed before 2PM. Outside Nairobi takes 1–3 business days.' },
  { q: 'Can I track my order?', a: 'Yes — once your order is confirmed by our team you will receive a Hawk Code. Use it to reference your order when contacting us.' },
  { q: 'How do I contact customer support?', a: 'Call or WhatsApp us on +254 112 660 355, or visit us at Royal Palms Mall, RNG Plaza BS43.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="py-12 px-4 text-center text-white" style={{ background: NAVY }}>
        <h1 className="text-2xl font-black mb-1">Frequently Asked Questions</h1>
        <p className="text-slate-400 text-sm">Everything you need to know about Hawk Life Solutions</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
            >
              <span className="font-semibold text-gray-800 text-sm pr-4">{faq.q}</span>
              <span className={`flex-shrink-0 text-gray-400 text-xl font-light transition-transform duration-200 ${open === i ? 'rotate-45' : ''}`}>+</span>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-gray-500 text-sm leading-relaxed border-t border-gray-100">
                {faq.a}
              </div>
            )}
          </div>
        ))}

        {/* Contact CTA */}
        <div className="rounded-2xl p-6 text-center text-white mt-6" style={{ background: NAVY }}>
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
    </div>
  );
}
