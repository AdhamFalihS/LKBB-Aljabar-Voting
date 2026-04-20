// Selalu pakai /api — Vite proxy handle sisanya saat dev
// Di production, Vercel langsung serve /api dari functions
const API_BASE_URL = '/api';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  getCategories: () => apiFetch('/categories'),
  getSchools: (categoryId) => apiFetch(categoryId ? `/schools?category_id=${categoryId}` : '/schools'),
  getLeaderboard: (categoryId) => apiFetch(categoryId ? `/leaderboard?category_id=${categoryId}` : '/leaderboard'),
  getTopVoters: () => apiFetch('/top-voters'),
  createTransaction: (voterName, schoolId, voteCount) =>
    apiFetch('/create-transaction', {
      method: 'POST',
      body: JSON.stringify({ voter_name: voterName, school_id: schoolId, vote_count: voteCount }),
    }),
  checkPayment: (orderId) => apiFetch(`/check-payment?order_id=${orderId}`),
};