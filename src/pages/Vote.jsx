import { useState, useEffect } from 'react';
import Countdown from '../components/Countdown';
import SchoolCard from '../components/SchoolCard';
import VoteModal from '../components/VoteModal';

function Vote() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('SD');
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const eventEndTime = '2025-02-28T23:59:59';

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch schools when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchSchools(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSchools = async (category) => {
    try {
      const response = await fetch(`/api/schools?category=${category}`);
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const handleVoteSubmit = async (voteData) => {
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voteData)
      });

      if (response.ok) {
        alert('Vote submitted successfully!');
        setSelectedSchool(null);
        fetchSchools(selectedCategory); // Refresh school data
      } else {
        alert('Failed to submit vote');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Error submitting vote');
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <header>
        <h1>🗳️ VOTE NOW!</h1>
        <p>Cast your favorite candidate!</p>
      </header>

      {/* Countdown */}
      <Countdown endTime={eventEndTime} />

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

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search schools..."
          className="w-full px-6 py-4 rounded-lg text-lg border-4 border-brown-800 focus:outline-none focus:ring-4 focus:ring-yellow-400"
        />
      </div>

      {/* Schools Grid */}
      <div className="schools-grid grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredSchools.map(school => (
          <SchoolCard
            key={school.id}
            school={school}
            onVoteClick={() => setSelectedSchool(school)}
          />
        ))}
      </div>

      {/* Vote Modal */}
      {selectedSchool && (
        <VoteModal
          school={selectedSchool}
          onClose={() => setSelectedSchool(null)}
          onSubmit={handleVoteSubmit}
        />
      )}
    </div>
  );
}

export default Vote;
