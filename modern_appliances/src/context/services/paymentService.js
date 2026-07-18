export const makePayment = async (amount) => {
  const res = await fetch('http://localhost:8000/api/payments/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access')}`,
    },
    body: JSON.stringify({ amount }),
  });
  return res.json();
};