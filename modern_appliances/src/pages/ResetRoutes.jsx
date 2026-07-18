// pages/ResetRoutes.js
import { Routes, Route } from 'react-router-dom';
import RequestReset from '../components/auth/RequestReset';
import ResetPassword from '../components/auth/ResetPassword';

const ResetRoutes = () => (
  <Routes>
    <Route path="/reset-password" element={<RequestReset />} />
    <Route path="/reset/:uidb64/:token" element={<ResetPassword />} />
  </Routes>
);

export default ResetRoutes;