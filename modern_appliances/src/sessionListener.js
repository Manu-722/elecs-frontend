// src/sessionListener.js
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { setAuthenticated, setUser, logoutUser, setToken } from './redux/authSlice';
import store from './redux/store';

export const startAuthListener = () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken();
      store.dispatch(setToken(token));
      store.dispatch(setUser({ username: user.displayName, email: user.email }));
      store.dispatch(setAuthenticated(true));
    } else {
      store.dispatch(logoutUser());
    }
  });
};