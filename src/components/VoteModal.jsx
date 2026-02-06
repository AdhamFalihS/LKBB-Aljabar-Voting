import { useState } from 'react';

function VoteModal({ school, onClose, onSubmit }) {
  const [voterName, setVoterName] = useState('');
  const [voteCount, setVoteCount] = useState(1);

  const quickAmounts = [10, 20, 50, 100, 200, 250, 300, 360, 400, 450, 500];

  const handleIncrement = () => setVoteCount(prev => prev + 1);
  const handleDecrement = () => setVoteCount(prev => (prev > 1 ? prev - 1 : 1));

  const handleSubmit = () => {
    if (!voterName.trim()) {
      alert('Please enter your name!');
      return;
    }
    onSubmit({ voterName, voteCount, schoolId: school.id });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Close Button */}
        <button onClick={onClose} className="close-button">✕</button>

        {/* School Info */}
        <h2>{school.name}</h2>
        <p>SUPPORT THIS CANDIDATE</p>

        {/* Voter Name Input */}
        <input
          type="text"
          value={voterName}
          onChange={e => setVoterName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-2 rounded-lg border-2 border-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-600"
        />

        {/* Vote Counter */}
        <div className="vote-counter">
          <button onClick={handleDecrement} className="counter-btn">-</button>
          <span className="counter-value">{voteCount}</span>
          <button onClick={handleIncrement} className="counter-btn">+</button>
        </div>

        {/* Quick Amount Buttons */}
        <div className="quick-amounts">
          <p>HIDE QUICK AMOUNTS</p>
          {quickAmounts.map(amount => (
            <button
              key={amount}
              onClick={() => setVoteCount(amount)}
              className="bg-white text-brown-900 font-semibold py-2 rounded-lg border-2 border-brown-800 hover:bg-yellow-300 transition"
            >
              {amount}
            </button>
          ))}
        </div>

        {/* Total Price */}
        <p>Total Price: Rp {voteCount * 1000}</p>

        {/* Info Boxes */}
        <div className="info-boxes">
          {/* Bisa ditambahkan info tambahan jika perlu */}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="bg-yellow-400 hover:bg-yellow-500 text-brown-900 font-bold py-2 px-4 rounded-lg transition"
        >
          ⚡ CAST VOTE!
        </button>
      </div>
    </div>
  );
}

export default VoteModal;
