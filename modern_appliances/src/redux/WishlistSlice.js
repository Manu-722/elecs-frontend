
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:8000/api/store';

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

export const fetchWishlistFromServer = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    const token = getAccessToken();
    if (!token) return rejectWithValue({ detail: 'Missing or invalid token' });

    try {
      const res = await fetch(`${API_URL}/user/wishlist/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      if (text.trim().startsWith('<')) {
        console.warn('[fetchWishlistFromServer] Received HTML instead of JSON');
        return rejectWithValue({ detail: 'Server returned HTML instead of JSON' });
      }

      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        return rejectWithValue({ detail: 'Failed to parse server response' });
      }

      if (data?.code === 'token_not_valid') {
        return rejectWithValue({ detail: 'Token not valid. Please log in again.' });
      }

      return Array.isArray(data.items) ? data.items : [];
    } catch (err) {
      return rejectWithValue({ detail: err.message });
    }
  }
);

const loadLocalWishlist = () => {
  try {
    const raw = localStorage.getItem('cymanWishlist');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: loadLocalWishlist(),
    status: 'idle',
    error: null,
  },
  reducers: {
    addWishlistItem(state, action) {
      const exists = state.items.some((i) => i.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        localStorage.setItem('cymanWishlist', JSON.stringify(state.items));
      }
    },
    removeWishlistItem(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      localStorage.setItem('cymanWishlist', JSON.stringify(state.items));
    },
    clearWishlist(state) {
      state.items = [];
      localStorage.removeItem('cymanWishlist');
    },
    setWishlist(state, action) {
      state.items = action.payload;
      localStorage.setItem('cymanWishlist', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistFromServer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWishlistFromServer.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
        state.error = null;
        localStorage.setItem('cymanWishlist', JSON.stringify(action.payload));
      })
      .addCase(fetchWishlistFromServer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.detail || 'Wishlist fetch failed';
        console.warn('[fetchWishlistFromServer] failed:', state.error);
      });
  },
});

export const {
  addWishlistItem,
  removeWishlistItem,
  clearWishlist,
  setWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;