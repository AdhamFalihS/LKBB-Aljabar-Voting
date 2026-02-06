function SchoolCard({ school, onVoteClick }) {
  return (
    <div>
      <h3>{school.name}</h3>

      <p>❤️ {school.total_votes} votes</p>

      <button
        onClick={() => onVoteClick(school)}
        className="bg-yellow-400 hover:bg-yellow-500 text-brown-900 font-bold py-2 px-4 rounded-lg transition"
      >
        VOTE NOW
      </button>
    </div>
  );
}

export default SchoolCard;
