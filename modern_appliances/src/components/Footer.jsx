import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-12 pb-8 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-x-10">
        {/* 📝 About Us */}
        <div className="md:text-left text-center">
          <h4 className="text-xl font-semibold mb-4 text-red-500">About Us</h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            Cyman Wear is more than a brand—it’s a movement rooted in Nairobi.
            We fuse African craftsmanship with bold design to create shoes that inspire confidence, expression, and comfort.
          </p>
        </div>

        {/* 📞 Contact Info */}
        <div className="text-center">
          <h4 className="text-xl font-semibold mb-4 text-red-500">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>Nairobi, Kenya</li>
            <li>Email: info@cymanwear.com</li>
            <li>Phone: +254-745-792-950</li>
          </ul>
        </div>

        {/* 🔗 Social Links */}
        <div className="md:text-right text-center">
          <h4 className="text-xl font-semibold mb-4 text-red-500">Follow Us</h4>
          <div className="flex justify-center md:justify-end space-x-6">
            <a href="https://facebook.com/cymanwear" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f text-red-500 hover:text-white text-xl" />
            </a>
            <a href="https://instagram.com/cymanwear" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram text-red-500 hover:text-white text-xl" />
            </a>
            <a href="https://twitter.com/cymanwear" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter text-red-500 hover:text-white text-xl" />
            </a>
          </div>
        </div>
      </div>

      {/* 🧾 Bottom Line */}
      <div className="mt-12 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Cyman Wear. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;