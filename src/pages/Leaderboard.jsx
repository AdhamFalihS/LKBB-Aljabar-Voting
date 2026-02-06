import { useState, useEffect } from 'react';

function Leaderboard() {
  const [selectedCategory, setSelectedCategory] = useState('SD');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchLeaderboard(selectedCategory);
  }, [selectedCategory]);

  const fetchLeaderboard = async (category) => {
    try {
      const response = await fetch(`/api/leaderboard?category=${category}`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  return (
    <div>
      {/* Header */}
      <header>
        <h1>🏆 LEADERBOARD</h1>
        <p>Top Schools by Category</p>
      </header>

      {/* Category Tabs */}
      <div className="category-tabs">
        {['SD', 'SMP', 'SMA/SMK'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-8 py-3 rounded-lg font-bold transition ${
              selectedCategory === cat
                ? 'bg-yellow-400 text-brown-900'
                : 'bg-white text-brown-900 hover:bg-yellow-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="leaderboard">
        {leaderboard.map((school, index) => (
          <div key={school.id} className="leaderboard-item border-b py-2">
            <span className="rank">#{index + 1}</span>
            <span className="school-name">{school.name}</span>
            <span className="school-category">{school.category}</span>
            <span className="votes">{school.total_votes} votes</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
