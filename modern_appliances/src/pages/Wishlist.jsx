import React, { useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearWishlist, removeWishlistItem } from '../redux/wishlistSlice';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const wishlist = useSelector((state) => state.wishlist.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cart, setCart } = useContext(CartContext);

  const handleMoveAllToCart = () => {
    const updatedCart = [...cart];

    wishlist.forEach((item) => {
      const exists = updatedCart.find((prod) => prod.id === item.id);
      if (exists) {
        const updatedItem = {
          ...exists,
          quantity: (exists.quantity || 1) + 1,
        };
        const index = updatedCart.findIndex((prod) => prod.id === item.id);
        updatedCart[index] = updatedItem;
      } else {
        updatedCart.push({
          ...item,
          quantity: 1,
          imageUrl: item.image || '/assets/shoes/default.jpg',
        });
      }
    });

    setCart(updatedCart);
    dispatch(clearWishlist());
    toast.success('All items moved to cart 🛒');
    navigate('/cart');
  };

  const handleRemove = (itemId) => {
    dispatch(removeWishlistItem(itemId));
    toast.info('Removed from wishlist');
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-red-500">
        Your Wishlist ❤️
      </h2>

      {wishlist.length === 0 ? (
        <p className="text-center text-gray-500">Your wishlist is empty.</p>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleMoveAllToCart}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              🛒 Move All to Cart
            </button>
          </div>

          <div className="grid gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center bg-white shadow rounded p-4"
              >
                <img
                  src={`http://localhost:8000/media/${item.image}`}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded"
                />
                <div className="flex-1 ml-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <div className="flex gap-4 items-center mt-2">
                    <span className="text-red-600 font-bold text-lg">
                      KES {item.discounted ?? item.price}
                    </span>
                    <button
                      onClick={handleMoveAllToCart}
                      className="text-sm bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                    >
                      Move to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-sm text-red-500 ml-2 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;