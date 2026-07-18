export const registerUser = async (username, email, password) => {
  const res = await fetch('http://localhost:8000/api/auth/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return res.json();
};

export const loginUser = async (username, password) => {
  const res = await fetch('http://localhost:8000/api/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
  }
  return data;
};