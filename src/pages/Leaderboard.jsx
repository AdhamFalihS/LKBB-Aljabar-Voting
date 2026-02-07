import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

function Leaderboard() {
  // 1. Mapping ID sesuai database terbaru (SMP=1, SMA/SMK=2)
  const categoryMap = { "SMP": 1, "SMA/SMK": 2 };
  
  // 2. Default state langsung ke SMP
  const [selectedCategory, setSelectedCategory] = useState("SMP");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCategory]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setLeaderboard([]); 
    
    try {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("category_id", categoryMap[selectedCategory])
        .order("total_votes", { ascending: false });

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPodium = () => {
    if (leaderboard.length === 0) return null;

    const top1 = leaderboard[0];
    const top2 = leaderboard[1];
    const top3 = leaderboard[2];

    const podiumData = [
      { data: top2, rank: "#2", color: "bg-[#3b82f6]", h: "h-32", crown: false },
      { data: top1, rank: "#1", color: "bg-[#eab308]", h: "h-44", crown: true },
      { data: top3, rank: "#3", color: "bg-[#f97316]", h: "h-28", crown: false },
    ];

    return (
      <div className="flex justify-center items-end gap-2 md:gap-6 mb-10 relative z-10">
        {podiumData.map((item, idx) => {
          // Spacer jika data juara 2 atau 3 belum ada
          if (!item.data) return <div key={idx} className="w-24 md:w-32" />;

          return (
            <div key={item.data.id} className="flex flex-col items-center animate-fade-in-up">
              <div className="relative mb-2">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-[6px] border-[#3b2a1a] overflow-hidden bg-[#f7e6c4] shadow-xl">
                  <img src={item.data.image_url} alt="img" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black text-yellow-400 text-[10px] font-bold px-3 py-1 rounded-full border border-yellow-400">
                  {item.data.total_votes}
                </div>
                {item.crown && <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl">👑</span>}
              </div>

              <div className={`${item.h} ${item.color} w-24 md:w-32 rounded-t-lg border-x-4 border-t-4 border-[#3b2a1a] flex flex-col items-center shadow-2xl`}>
                <h2 className="text-4xl md:text-6xl font-black text-black/30 italic">{item.rank}</h2>
                <div className="bg-white px-2 py-1 mt-auto mb-4 w-[90%] text-center border-2 border-black">
                   <p className="text-[10px] font-black text-black uppercase truncate">{item.data.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const others = leaderboard.slice(3);
  const maxVotes = leaderboard[0]?.total_votes || 1;

  return (
    <div className="min-h-screen bg-[#0b4f78] pt-24 pb-20 px-4 relative overflow-hidden">
      {/* Background Ornamen */}
      <img src="/images/ship.png" alt="ship" className="absolute bottom-10 left-4 w-48 md:w-80 opacity-80 pointer-events-none z-0" />
      <img src="/images/luffy.png" alt="luffy" className="absolute top-40 right-10 w-24 md:w-40 pointer-events-none z-0" />

      {/* Tabs Kategori (Hanya SMP & SMA/SMK) */}
      <div className="flex justify-center gap-3 mb-16 relative z-10">
        {Object.keys(categoryMap).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-1 rounded-md font-black text-sm transition-all border-2 ${
              selectedCategory === cat 
                ? "bg-[#9333ea] text-white border-white scale-110 shadow-lg" 
                : "bg-[#f7e6c4] text-[#3b2a1a] border-[#3b2a1a]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-yellow-400 font-black h-64 flex items-center justify-center">LOADING...</div>
      ) : (
        renderPodium()
      )}

      {/* List Rank #4 ke bawah */}
      <div className="max-w-3xl mx-auto bg-[#f7e6c4] rounded-xl border-4 border-[#3b2a1a] p-4 shadow-[10px_10px_0_rgba(0,0,0,0.3)] relative z-10">
        {!loading && others.length > 0 ? others.map((school, i) => {
          const percent = (school.total_votes / maxVotes) * 100;
          return (
            <div key={school.id} className="flex items-center gap-3 mb-4 last:mb-0">
              <span className="font-black text-xl text-[#3b2a1a] w-8 italic">#{i + 4}</span>
              <div className="w-12 h-12 rounded-full border-2 border-[#3b2a1a] overflow-hidden flex-shrink-0">
                <img src={school.image_url} alt="logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <p className="font-black text-[#3b2a1a] text-sm uppercase truncate">{school.name}</p>
                  <p className="font-black text-[#3b2a1a] text-sm italic">{school.total_votes}</p>
                </div>
                <div className="w-full h-3 bg-white border-2 border-[#3b2a1a] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 border-r-2 border-[#3b2a1a] transition-all duration-1000" 
                    style={{ width: `${percent}%` }} 
                  />
                </div>
              </div>
            </div>
          );
        }) : !loading && (
          <p className="text-center font-bold text-[#3b2a1a]/50 italic py-4">Mengarungi lautan mencari peserta...</p>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;