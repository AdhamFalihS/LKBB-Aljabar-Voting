import { useState, useEffect } from "react";
import { api } from "../services/api";

function VotePage() {
  const [categories, setCategories] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await api.getCategories();
      setCategories(result.data);

      if (result.data.length > 0) {
        setSelectedCategory(result.data[0].id);
        loadSchools(result.data[0].id);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadSchools = async (categoryId) => {
    setLoading(true);
    try {
      const result = await api.getSchools(categoryId);
      setSchools(result.data);
    } catch (error) {
      console.error("Error loading schools:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    loadSchools(categoryId);
  };

  // ✅ FIX: Submit Vote Handler dipindahkan ke dalam component
  const handleSubmitVote = async (voterName, schoolId, voteCount) => {
    try {
      const result = await api.submitVote(voterName, schoolId, voteCount);

      if (result.success) {
        alert(`Successfully voted ${voteCount} time(s)!`);
        loadSchools(selectedCategory);
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      alert("Failed to submit vote. Please try again.");
    }
  };

  return (
    <div>
      {/* Category tabs */}
      <div>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={selectedCategory === cat.id ? "active" : ""}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* School cards */}
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          schools.map((school) => (
            <div key={school.id}>
              <h3>{school.name}</h3>
              <p>{school.total_votes} votes</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VotePage;
