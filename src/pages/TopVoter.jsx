import { useState, useEffect } from 'react';

function TopVoter() {
  const [topVoters, setTopVoters] = useState([]);

  useEffect(() => {
    fetchTopVoters();
  }, []);

  const fetchTopVoters = async () => {
    try {
      const response = await fetch('/api/top-voters');
      const data = await response.json();
      setTopVoters(data);
    } catch (error) {
      console.error('Error fetching top voters:', error);
    }
  };

  return (
    <div>
      {/* Header */}
      <header>
        <h1>👑 TOP VOTERS</h1>
        <p>The Biggest Supporters!</p>
      </header>

      {/* Top 3 Podium */}
      <div className="top-podium grid grid-cols-3 gap-4">
        {/* 2nd Place */}
        {topVoters[1] && (
          <div className="podium-item">
            <h2>🥈</h2>
            <p>2</p>
            <p>{topVoters[1].name}</p>
            <p>{topVoters[1].total_votes} votes</p>
          </div>
        )}

        {/* 1st Place */}
        {topVoters[0] && (
          <div className="podium-item">
            <h2>👑</h2>
            <p>1</p>
            <p>{topVoters[0].name}</p>
            <p>{topVoters[0].total_votes} votes</p>
          </div>
        )}

        {/* 3rd Place */}
        {topVoters[2] && (
          <div className="podium-item">
            <h2>🥉</h2>
            <p>3</p>
            <p>{topVoters[2].name}</p>
            <p>{topVoters[2].total_votes} votes</p>
          </div>
        )}
      </div>

      {/* Rest of Voters */}
      <div className="other-top-voters mt-6">
        <h3>Other Top Supporters</h3>
        {topVoters.slice(3).map((voter, index) => (
          <div key={voter.id} className="voter-item border-b py-2">
            <span className="rank">#{index + 4}</span>
            <span className="voter-name">{voter.name}</span>
            <span className="votes">{voter.total_votes} votes</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopVoter;
