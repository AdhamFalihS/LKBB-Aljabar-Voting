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

  if (loading) return (
    <div className="min-h-screen bg-[#0b4f78] flex items-center justify-center">
      <p className="text-yellow-400 font-black animate-bounce">MENGARUNGI LAUTAN...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1c5d8a] text-white pt-24 pb-20 px-4 relative overflow-hidden">
      
      {/* Background Luffy (Sesuai Gambar) */}
      <img src="/images/luffy.png" alt="Luffy" className="absolute top-40 right-4 md:right-20 w-24 md:w-32 opacity-90 animate-pulse pointer-events-none" />
      <div className="absolute bottom-40 left-10 bg-yellow-500 w-10 h-10 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.5)] flex items-center justify-center border-2 border-black">
        💎
      </div>

      {/* HEADER: Judul Melengkung Style */}
      <div className="text-center mb-20 relative z-10">
        <div className="inline-block relative">
            <div className="bg-[#9333ea] border-4 border-yellow-400 px-10 py-2 rounded-lg transform -rotate-1 shadow-[0_10px_0_#3b2a1a]">
                <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase">
                    👑 TOP VOTERS
                </h1>
            </div>
            <p className="mt-4 text-yellow-400 font-black tracking-widest text-xs md:text-sm uppercase drop-shadow-md">
                THE BIGGEST SUPPORTERS!
            </p>
        </div>
      </div>

      {/* PODIUM SECTION (Juara 1, 2, 3) */}
      <div className="flex justify-center items-end gap-2 md:gap-4 mb-16 relative z-10 max-w-4xl mx-auto">
        
        {/* Juara 2 */}
        {topVoters[1] && (
          <div className="flex flex-col items-center group">
            <div className="bg-[#3b82f6] w-24 md:w-40 h-44 md:h-56 rounded-t-3xl border-4 border-black relative flex flex-col items-center justify-between p-4 transition-transform group-hover:-translate-y-2">
               <div className="absolute -top-12 bg-[#3b82f6] w-12 h-12 rounded-full border-4 border-black flex items-center justify-center text-2xl font-black">2</div>
               <div className="text-center mt-4">
                 <p className="text-[10px] md:text-sm font-black uppercase leading-tight line-clamp-2">{topVoters[1].name}</p>
               </div>
               <div className="bg-yellow-400 text-black font-black px-4 py-1 rounded-md text-sm md:text-xl shadow-[4px_4px_0_#000]">
                 {topVoters[1].total_votes}
               </div>
               <p className="text-[8px] md:text-[10px] font-bold opacity-70">BOUNTY</p>
            </div>
          </div>
        )}

        {/* Juara 1 */}
        {topVoters[0] && (
          <div className="flex flex-col items-center group relative z-20">
            <span className="text-4xl md:text-6xl absolute -top-16 md:-top-20 animate-bounce">👑</span>
            <div className="bg-[#9333ea] w-28 md:w-48 h-56 md:h-72 rounded-t-3xl border-4 border-yellow-400 relative flex flex-col items-center justify-between p-4 transition-transform group-hover:-translate-y-2 shadow-[0_0_30px_rgba(147,51,234,0.5)]">
               <div className="absolute -top-12 bg-[#9333ea] w-14 h-14 rounded-full border-4 border-yellow-400 flex items-center justify-center text-3xl font-black">1</div>
               <div className="text-center mt-6">
                 <p className="text-[12px] md:text-lg font-black uppercase leading-tight">{topVoters[0].name}</p>
               </div>
               <div className="bg-yellow-400 text-black font-black px-6 py-2 rounded-md text-lg md:text-2xl shadow-[4px_4px_0_#000]">
                 {topVoters[0].total_votes}
               </div>
               <p className="text-[10px] md:text-xs font-bold text-yellow-200">SUPREME SUPPORTER</p>
            </div>
          </div>
        )}

        {/* Juara 3 */}
        {topVoters[2] && (
          <div className="flex flex-col items-center group">
            <div className="bg-[#ef4444] w-24 md:w-40 h-36 md:h-48 rounded-t-3xl border-4 border-black relative flex flex-col items-center justify-between p-4 transition-transform group-hover:-translate-y-2">
               <div className="absolute -top-12 bg-[#ef4444] w-12 h-12 rounded-full border-4 border-black flex items-center justify-center text-2xl font-black">3</div>
               <div className="text-center mt-4">
                 <p className="text-[10px] md:text-sm font-black uppercase leading-tight line-clamp-2">{topVoters[2].name}</p>
               </div>
               <div className="bg-yellow-400 text-black font-black px-4 py-1 rounded-md text-sm md:text-xl shadow-[4px_4px_0_#000]">
                 {topVoters[2].total_votes}
               </div>
               <p className="text-[8px] md:text-[10px] font-bold opacity-70">BOUNTY</p>
            </div>
          </div>
        )}
      </div>

      {/* LOWER RANKS GRID STYLE (Mirip Gambar #4 - #13) */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {topVoters.slice(3).map((voter, i) => (
          <div
            key={voter.id}
            className="bg-[#f7e6c4] border-4 border-[#3b2a1a] rounded-xl p-3 flex items-center justify-between shadow-[6px_6px_0_#3b2a1a] transition-transform hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <span className="text-[#3b2a1a] font-black text-xl italic italic">#{i + 4}</span>
              <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-[#3b2a1a] flex items-center justify-center overflow-hidden">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <p className="text-[#3b2a1a] font-black text-sm uppercase truncate w-32 md:w-48">{voter.name}</p>
                <p className="text-[9px] text-red-600 font-bold">SUPPORTS: TOP TEAM</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[#3b2a1a] font-black text-lg leading-none">{voter.total_votes}</p>
              <p className="text-[8px] font-bold text-[#3b2a1a]/60 uppercase">BOUNTY</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default TopVoter;