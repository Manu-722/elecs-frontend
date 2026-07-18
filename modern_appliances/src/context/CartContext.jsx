import { createContext, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, clearCart, setCart } from '../redux/cartSlice';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const cart = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const addItem = (product) => dispatch(addToCart(product));
  const removeItem = (id) => dispatch(removeFromCart(id));
  const emptyCart = () => dispatch(clearCart());
  const updateCart = (items) => dispatch(setCart(items));

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, emptyCart, setCart: updateCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);