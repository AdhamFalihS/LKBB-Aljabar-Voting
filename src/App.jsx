import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Vote from './pages/Vote';
import Leaderboard from './pages/Leaderboard';
import TopVoter from './pages/TopVoter';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/top-voters" element={<TopVoter />} />
      </Routes>
    </Router>
  );
}

export default App;
