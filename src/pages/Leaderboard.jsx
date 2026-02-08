import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

function Leaderboard() {
  const categoryMap = { "SMP": 1, "SMA/SMK": 2 };
  
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
      { 
        data: top2, 
        rank: "#2", 
        bgColor: "from-blue-400 to-blue-600", 
        h: "h-36 sm:h-44 md:h-52", 
        medal: "🥈",
        avatarSize: "w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20"
      },
      { 
        data: top1, 
        rank: "#1", 
        bgColor: "from-yellow-300 via-yellow-400 to-amber-500", 
        h: "h-44 sm:h-56 md:h-64", 
        medal: "🥇",
        avatarSize: "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24",
        crown: true
      },
      { 
        data: top3, 
        rank: "#3", 
        bgColor: "from-orange-400 to-orange-600", 
        h: "h-32 sm:h-40 md:h-48", 
        medal: "🥉",
        avatarSize: "w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20"
      },
    ];

    return (
      <div className="flex justify-center items-end gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        {podiumData.map((item, idx) => {
          if (!item.data) return <div key={idx} className="w-20 sm:w-28 md:w-36" />;

          return (
            <div key={item.data.id} className="flex flex-col items-center">
              {item.crown && (
                <div className="mb-2 animate-bounce">
                  <span className="text-3xl sm:text-4xl md:text-5xl drop-shadow-lg">👑</span>
                </div>
              )}

              <div className="relative mb-2 sm:mb-3">
                <div className={`${item.avatarSize} rounded-full border-4 sm:border-[5px] border-amber-400 overflow-hidden bg-white shadow-2xl ring-2 ring-amber-200`}>
                  <img 
                    src={item.data.image_url} 
                    alt={item.data.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] sm:text-xs font-black px-2 py-0.5 sm:py-1 rounded-full border-2 border-white shadow-lg">
                  {item.data.total_votes}
                </div>
              </div>

              <div className={`${item.h} w-20 sm:w-28 md:w-36 bg-gradient-to-b ${item.bgColor} rounded-t-2xl border-x-4 border-t-4 sm:border-x-[5px] sm:border-t-[5px] border-amber-400 flex flex-col items-center justify-start pt-2 sm:pt-3 shadow-2xl`}>
                <div className="bg-white rounded-full w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center shadow-lg border-2 border-amber-300 mb-1 sm:mb-2">
                  <span className="text-xl sm:text-2xl md:text-3xl">{item.medal}</span>
                </div>
                
                <div className="bg-white px-2 py-1 sm:px-3 sm:py-1.5 mt-auto mb-2 sm:mb-3 md:mb-4 w-[88%] text-center border-2 border-amber-400 rounded-lg shadow-md">
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-black text-gray-800 uppercase leading-tight line-clamp-2">
                    {item.data.name}
                  </p>
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
    <div className="bg-gradient-to-b from-yellow-50 via-amber-100 to-orange-100 min-h-screen relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-amber-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-24 sm:pt-32 pb-12 sm:pb-16 relative z-10">
        
        {/* HEADER - Ukuran diperbesar untuk Desktop dan jarak diatur */}
        <div className="mb-6 sm:mb-10 flex justify-center">
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 border-4 sm:border-[6px] border-yellow-400 rounded-xl sm:rounded-2xl px-8 sm:px-14 md:px-20 py-4 sm:py-6 shadow-2xl">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <span className="text-3xl sm:text-4xl md:text-6xl">🏆</span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-widest uppercase drop-shadow-lg">
                PAPAN PERINGKAT
              </h1>
            </div>
          </div>
        </div>

        {/* CATEGORY BUTTONS */}
        <div className="mb-8 sm:mb-10 flex justify-center gap-2 sm:gap-4">
          {Object.keys(categoryMap).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 sm:px-12 md:px-16 py-3 sm:py-4 rounded-full font-black text-xs sm:text-lg md:text-xl uppercase tracking-wide border-4 shadow-lg transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-red-600 text-white border-red-800 scale-105"
                  : "bg-white text-red-600 border-yellow-400 hover:bg-amber-50"
              }`}
            >
              <span className="hidden sm:inline mr-2">
                {cat === "SMP" ? "🎓" : "🎯"}
              </span>
              {cat}
            </button>
          ))}
        </div>

        {/* CROWN SEPARATOR */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="bg-gradient-to-br from-yellow-300 to-amber-400 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl rotate-45 border-4 border-amber-500 shadow-xl flex items-center justify-center">
            <span className="text-xl sm:text-2xl md:text-3xl -rotate-45">👑</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mb-3"></div>
            <p className="text-red-600 font-bold uppercase">Loading...</p>
          </div>
        ) : (
          <div key={selectedCategory}>
            {renderPodium()}

            {others.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border-3 border-amber-300">
                <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-amber-200">
                  <h3 className="font-black text-sm sm:text-lg text-red-700 uppercase flex items-center gap-2">
                    <span>📊</span> 
                    <span>Peringkat Lainnya</span>
                  </h3>
                  <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold">
                    {leaderboard.length} Peserta
                  </div>
                </div>

                <div className="space-y-3">
                  {others.map((school, i) => {
                    const percent = (school.total_votes / maxVotes) * 100;
                    return (
                      <div 
                        key={school.id} 
                        className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 p-3 shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-red-600 text-white font-black text-sm sm:text-lg w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                            #{i + 4}
                          </div>
                          
                          <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden bg-white">
                            <img src={school.image_url} alt={school.name} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-black text-gray-800 text-xs uppercase truncate">{school.name}</p>
                              <p className="font-black text-red-700 text-sm">{school.total_votes}</p>
                            </div>
                            <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Leaderboard;