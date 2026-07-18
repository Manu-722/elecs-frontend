import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { Provider } from 'react-redux';
import store from './redux/store';

import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { startAuthListener } from './sessionListener.js'; // 🔐 Firebase session sync
startAuthListener(); // ✅ keeps Redux and Firebase in sync

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <CartProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CartProvider>
    </Provider>
  </React.StrictMode>
);