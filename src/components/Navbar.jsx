import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <h1>🗳️ PASKIBRA VOTING</h1>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/vote">Vote</Link></li>
        <li><Link to="/leaderboard">Leaderboard</Link></li>
        <li><Link to="/top-voters">Top Voters</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
