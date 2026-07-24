import { createSlice } from '@reduxjs/toolkit';

const saved = (() => {
  try { return JSON.parse(localStorage.getItem('hawkUser')) || null; } catch { return null; }
})();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: saved,
    isAuthenticated: !!saved,
    token: saved?.token || null,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('hawkUser', JSON.stringify(action.payload));
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    setAuthenticated(state, action) {
      state.isAuthenticated = action.payload;
    },
    logoutUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem('hawkUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('lastUsername');
    },
  },
});

export const { setUser, setToken, setAuthenticated, logoutUser } = authSlice.actions;
export default authSlice.reducer;
