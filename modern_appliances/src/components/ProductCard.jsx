import React from 'react';

const ProductCard = ({ product }) => {
  const formatKES = (amount) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="bg-white rounded shadow p-4 text-center hover:shadow-lg transition">
      <img
        src={product.image || '/assets/shoes/default.jpg'}
        alt={product.name}
        className="w-full h-48 object-cover rounded mb-2"
      />
      <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
      <p className="text-green-600 font-bold">{formatKES(product.price)}</p>
      <a
        href={`/product/${product.id}`}
        className="text-blue-600 hover:underline block mt-2"
      >
        View Details
      </a>
    </div>
  );
};

export default ProductCard;