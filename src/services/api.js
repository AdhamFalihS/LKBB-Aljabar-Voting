const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-app.vercel.app/api' 
  : 'http://localhost:3000/api';

export const api = {
  // Get all categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return response.json();
  },

  // Get schools by category
  getSchools: async (categoryId) => {
    const url = categoryId 
      ? `${API_BASE_URL}/schools?category_id=${categoryId}`
      : `${API_BASE_URL}/schools`;
    const response = await fetch(url);
    return response.json();
  },

  // Submit vote
  submitVote: async (voterName, schoolId, voteCount) => {
    const response = await fetch(`${API_BASE_URL}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        voter_name: voterName,
        school_id: schoolId,
        vote_count: voteCount
      })
    });
    return response.json();
  },

  // Get leaderboard
  getLeaderboard: async (categoryId) => {
    const url = categoryId 
      ? `${API_BASE_URL}/leaderboard?category_id=${categoryId}`
      : `${API_BASE_URL}/leaderboard`;
    const response = await fetch(url);
    return response.json();
  },

  // Get top voters
  getTopVoters: async () => {
    const response = await fetch(`${API_BASE_URL}/top-voters`);
    return response.json();
  }
};