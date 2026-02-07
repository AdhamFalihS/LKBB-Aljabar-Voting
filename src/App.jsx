import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import TopMarquee from "./components/TopMarquee";

import Home from "./pages/Home";
import Vote from "./pages/Vote";
import Leaderboard from "./pages/Leaderboard";
import TopVoter from "./pages/TopVoter";

function App() {
  return (
    <Router>
      {/* Wrapper Utama dengan Background Biru Konsisten */}
      <div className="min-h-screen bg-[#0b4f78] text-white">
        
        {/* MARQUEE */}
        <TopMarquee />

        {/* NAVBAR */}
        <Navbar />

        {/* PAGE CONTENT */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/top-voters" element={<TopVoter />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;