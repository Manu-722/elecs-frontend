import React from 'react';

const CartItem = ({ item, onRemove }) => {
  const formatKES = (amount) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const handleRemove = () => {
    const confirmDelete = window.confirm(
      `Remove ${item.name || item.shoe} from your cart?`
    );
    if (confirmDelete && onRemove) {
      onRemove(item.id);
    }
  };

  const itemName = item.name || item.shoe;
  const itemImage = item.image || item.imageUrl || '/assets/shoes/default.jpg';
  const itemAlt = `${itemName} by ${item.brand || 'Cyman Wear'}`;
  const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;

  return (
    <div className="flex items-center justify-between bg-white shadow rounded p-4 mb-4">
      <img
        src={itemImage}
        alt={itemAlt}
        className="w-24 h-24 object-cover rounded mr-4"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800">{itemName}</h3>
        {item.size && (
          <p className="text-sm text-gray-600">Size: {item.size}</p>
        )}
        <p className="text-sm text-gray-600">Qty: {quantity}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-black">{formatKES(item.price)}</p>
        {onRemove && (
          <button
            onClick={handleRemove}
            aria-label={`Remove ${itemName} from cart`}
            className="mt-2 text-red-600 text-sm hover:underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default CartItem;