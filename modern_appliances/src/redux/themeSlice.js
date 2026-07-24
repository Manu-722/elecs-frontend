import { createSlice } from '@reduxjs/toolkit';

const saved = localStorage.getItem('hawkTheme');

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: saved === 'light' ? 'light' : 'dark' },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('hawkTheme', state.mode);
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
