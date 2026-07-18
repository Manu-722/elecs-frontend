import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8000/orders/all/', {
      credentials: 'include', // or pass JWT header if using token auth
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        const revenue = data.reduce((sum, order) => sum + (order.paid ? order.total : 0), 0);
        setTotalRevenue(revenue);
      })
      .catch((err) => {
        toast.error('Failed to load orders');
        console.error(err);
      });
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-red-600">Cyman Wear Admin Dashboard</h2>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h3 className="text-xl font-semibold">Total Orders</h3>
          <p className="text-2xl mt-2">{orders.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h3 className="text-xl font-semibold">Total Revenue</h3>
          <p className="text-2xl mt-2">KES {totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Total</th>
            <th className="p-2 text-left">Method</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Paid</th>
            <th className="p-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 10).map((order) => (
            <tr key={order.id} className="border-t">
              <td className="p-2">{order.user}</td>
              <td className="p-2">KES {order.total}</td>
              <td className="p-2">{order.payment_method}</td>
              <td className="p-2">{order.status}</td>
              <td className="p-2">{order.paid ? 'Yes' : 'No'}</td>
              <td className="p-2">{new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;