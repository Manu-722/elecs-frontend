import { useEffect, useState } from 'react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch('/api/payments/user-transactions/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('cymanToken')}`,
      },
    })
      .then(res => res.json())
      .then(data => setTransactions(data.transactions || []));
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 bg-white shadow">
      <h2 className="text-xl font-semibold mb-4">Your M-Pesa Transactions</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <ul className="divide-y">
          {transactions.map(tx => (
            <li key={tx.transaction_id} className="py-3 text-sm">
              <div><strong>ID:</strong> {tx.transaction_id}</div>
              <div><strong>Amount:</strong> KES {tx.amount}</div>
              <div><strong>Date:</strong> {tx.date}</div>
              <div><strong>Status:</strong> {tx.status}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Transactions;