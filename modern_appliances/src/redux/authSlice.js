import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '../firebase';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      const token = await user.getIdToken();
      return {
        uid: user.uid,
        email: user.email,
        token,
        displayName: user.displayName, // ✅ added for navbar greeting
      };
    } catch (err) {
      const msg = err?.code?.split('/')[1]?.replace(/-/g, ' ') || 'Unknown error';
      return rejectWithValue(msg);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false, // ✅ new
    status: 'idle',
    error: null,
  },
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false; // ✅ new
      state.status = 'idle';
      state.error = null;
    },
    setToken: (state, action) => {
      if (!state.user) state.user = {};
      state.user.token = action.payload;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload; // ✅ simplified
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true; // ✅ new
        state.status = 'succeeded';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  logoutUser,
  setToken,
  setAuthenticated,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;