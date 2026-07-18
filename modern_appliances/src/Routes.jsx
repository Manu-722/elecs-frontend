import { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pay from './pages/Pay';
import TextUs from './pages/TextUs';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { AuthContext } from './context/AuthContext';

const AppRoutes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext); // to restrict protected pages

  return (
    <Router>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        
        <Route path="/pay" element={user ? <Pay /> : <Navigate to="/login" />} />
        <Route path="/text-us" element={user ? <TextUs /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;