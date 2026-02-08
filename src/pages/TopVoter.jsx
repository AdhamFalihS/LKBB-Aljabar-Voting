import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

function TopVoter() {
  const [topVoters, setTopVoters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopVoters();
  }, []);

  const fetchTopVoters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("voters")
        .select("*")
        .order("total_votes", { ascending: false })
        .limit(15);

      if (error) throw error;
      setTopVoters(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-amber-100 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 border-4 border-red-600 border-t-transparent mb-3 mx-auto"></div>
          <p className="text-red-600 font-bold text-sm sm:text-lg uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPodium = () => {
    if (topVoters.length === 0) return null;

    const podiumData = [
      { 
        data: topVoters[1], 
        medal: "🥈",
        bgColor: "from-blue-400 to-blue-600", 
        h: "h-36 sm:h-44 md:h-52",
        avatarSize: "w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20"
      },
      { 
        data: topVoters[0], 
        medal: "🥇",
        bgColor: "from-yellow-300 via-yellow-400 to-amber-500", 
        h: "h-44 sm:h-56 md:h-64",
        avatarSize: "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24",
        crown: true
      },
      { 
        data: topVoters[2], 
        medal: "🥉",
        bgColor: "from-orange-400 to-orange-600", 
        h: "h-32 sm:h-40 md:h-48",
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
                <div className={`${item.avatarSize} rounded-full bg-gradient-to-br ${item.bgColor} border-4 sm:border-[5px] border-white shadow-2xl flex items-center justify-center ring-2 ring-amber-200`}>
                  <span className={`${item.crown ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>👤</span>
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

  return (
    <div className="bg-gradient-to-b from-yellow-50 via-amber-100 to-orange-100 min-h-screen relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-amber-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-24 sm:pt-32 pb-12 sm:pb-16 relative z-10">
        
        {/* HEADER DESIGN: Skewed & More Compact */}
        <div className="mb-10 sm:mb-14 flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-red-600 rounded-2xl blur opacity-20 transition duration-1000"></div>
            
            <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-red-600 border-y-4 border-yellow-400 shadow-xl transform -skew-x-12 px-10 sm:px-16 md:px-20 py-4 sm:py-6 rounded-xl overflow-hidden">
              
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 pointer-events-none"></div>
              
              <div className="transform skew-x-12 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl sm:text-4xl md:text-5xl drop-shadow-md">🏆</span>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-md">
                    TOP VOTER
                  </h1>
                </div>
                
                {/* Compact Subtitle - No Stars, Closer to Title */}
                <div className="px-4 py-0.5 bg-black/20 rounded-full border border-yellow-400/30">
                  <p className="text-white font-black text-[10px] sm:text-sm md:text-base uppercase tracking-widest">
                    Para Pendukung Terbaik
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 transform rotate-12 hidden md:block">
               <span className="text-5xl drop-shadow-lg">👑</span>
            </div>
          </div>
        </div>

        {renderPodium()}

        {/* LIST RANK #4+ */}
        {topVoters.length > 3 && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-t-8 border-red-600">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-amber-100">
              <h3 className="font-black text-lg sm:text-2xl text-red-700 uppercase flex items-center gap-3 italic">
                <span className="bg-red-600 text-white p-1 rounded text-sm sm:text-lg">📊</span> 
                <span>Barisan Supporter</span>
              </h3>
              <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-black shadow-md">
                {topVoters.length} TOTAL
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {topVoters.slice(3).map((voter, i) => (
                <div
                  key={voter.id}
                  className="bg-gradient-to-r from-white to-amber-50 rounded-2xl border-2 border-amber-200 p-4 shadow-sm hover:shadow-xl hover:border-red-400 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-red-600 group-hover:bg-red-700 text-white font-black text-lg w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 transition-transform">
                      #{i + 4}
                    </div>
                    
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full border-2 border-amber-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <span className="text-xl sm:text-2xl">👤</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-800 text-[10px] sm:text-xs uppercase truncate group-hover:text-red-600 transition-colors">
                        {voter.name}
                      </p>
                      <div className="flex items-center gap-1">
                         <span className="text-amber-500 text-[10px]">★</span>
                         <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Loyal Supporter</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-red-700 text-base sm:text-lg leading-none">
                        {voter.total_votes}
                      </p>
                      <p className="text-[9px] font-black text-gray-400 uppercase">
                        Votes
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {topVoters.length === 0 && !loading && (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-dashed border-amber-300">
            <div className="text-6xl mb-4 opacity-20">🏅</div>
            <p className="text-gray-700 font-black text-lg uppercase italic">Menunggu Supporter Pertama</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default TopVoter;