import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:8000/api';

const getAccessToken = () => {
  try {
    const raw = localStorage.getItem('authToken');
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed?.access) return parsed.access;
    if (typeof raw === 'string' && raw.length > 20 && !raw.includes('{')) return raw;

    return null;
  } catch {
    return null;
  }
};

export const fetchCartFromServer = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    const token = getAccessToken();
    if (!token) return rejectWithValue({ detail: 'No valid token found' });

    try {
      const res = await fetch(`${API_URL}/user/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      if (text.trim().startsWith('<')) return rejectWithValue({ detail: 'Invalid HTML response' });

      const data = JSON.parse(text);
      if (!Array.isArray(data.items)) return rejectWithValue({ detail: 'Malformed cart data' });

      return data.items;
    } catch (err) {
      return rejectWithValue({ detail: err.message });
    }
  }
);

export const persistCartToServer = createAsyncThunk(
  'cart/persistCart',
  async (_, { getState, rejectWithValue }) => {
    const cart = getState().cart.items;
    const token = getAccessToken();
    if (!token || !Array.isArray(cart) || cart.length === 0)
      return rejectWithValue({ detail: 'Invalid cart or missing token' });

    try {
      const res = await fetch(`${API_URL}/persist_cart/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cart),
      });
      const result = await res.json();
      return result;
    } catch (err) {
      return rejectWithValue({ detail: err.message });
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [], 
    status: 'idle',
    error: null,
  },
  reducers: {
    addToCart(state, action) {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      localStorage.setItem('cymanCart', JSON.stringify(state.items));
    },
    setCart(state, action) {
      state.items = action.payload;
      localStorage.setItem('cymanCart', JSON.stringify(action.payload));
    },
    clearCart(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('cymanCart');
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      localStorage.setItem('cymanCart', JSON.stringify(state.items));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartFromServer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCartFromServer.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
        state.error = null;
        localStorage.setItem('cymanCart', JSON.stringify(action.payload));
      })
      .addCase(fetchCartFromServer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.detail || 'Cart fetch failed';
      })
      .addCase(persistCartToServer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(persistCartToServer.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(persistCartToServer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.detail || 'Cart persist failed';
      });
  },
});

export const { addToCart, setCart, clearCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;