import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { motion } from "framer-motion";

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
        .limit(50);

      if (error) throw error;
      setTopVoters(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     🎬 ANIMATION VARIANTS
     ======================= */
  
  // Bar naik dari bawah
  const barVariant = {
    hidden: { scaleY: 0 },
    visible: (delay) => ({
      scaleY: 1,
      transition: {
        delay,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  // Avatar muncul setelah bar selesai
  const avatarVariant = {
    hidden: { scale: 0, opacity: 0 },
    visible: (delay) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay,
        duration: 0.3,
        ease: "backOut"
      }
    })
  };

  // Mahkota muncul terakhir dengan bounce
  const crownVariant = {
    hidden: { y: -30, opacity: 0, scale: 0 },
    visible: (delay) => ({
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay,
        duration: 0.4,
        ease: "backOut"
      }
    })
  };

  // Animasi untuk list item (fade in dari bawah)
  const listItemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 2.0 + (index * 0.05),
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-amber-100 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  /* =======================
     🏆 PODIUM RENDER
     ======================= */
  const renderPodium = () => {
    if (topVoters.length === 0) return null;

    const podiumData = [
      { 
        data: topVoters[1], 
        medal: "🥈", 
        barDelay: 0.6,
        avatarDelay: 1.1,
        h: "h-36 sm:h-44 md:h-52",
        bgColor: "from-blue-400 to-blue-600",
        avatarSize: "w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20"
      },
      { 
        data: topVoters[0], 
        medal: "🥇", 
        barDelay: 0,
        avatarDelay: 0.5,
        crownDelay: 0.8,
        h: "h-44 sm:h-56 md:h-64", 
        crown: true,
        bgColor: "from-yellow-300 via-yellow-400 to-amber-500",
        avatarSize: "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
      },
      { 
        data: topVoters[2], 
        medal: "🥉", 
        barDelay: 1.2,
        avatarDelay: 1.7,
        h: "h-32 sm:h-40 md:h-48",
        bgColor: "from-orange-400 to-orange-600",
        avatarSize: "w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20"
      }
    ];

    return (
      <div className="flex justify-center items-end gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        {podiumData.map((item, i) => {
          if (!item.data) return <div key={i} className="w-20 sm:w-28 md:w-36" />;

          return (
            <div key={item.data.id} className="flex flex-col items-center">

              {/* 👑 MAHKOTA - muncul paling akhir */}
              {item.crown && (
                <motion.div
                  variants={crownVariant}
                  initial="hidden"
                  animate="visible"
                  custom={item.crownDelay}
                  className="mb-2"
                >
                  <span className="text-3xl sm:text-4xl md:text-5xl drop-shadow-lg">👑</span>
                </motion.div>
              )}

              {/* 👤 AVATAR - muncul setelah bar */}
              <motion.div
                variants={avatarVariant}
                initial="hidden"
                animate="visible"
                custom={item.avatarDelay}
                className="relative mb-2 sm:mb-3"
              >
                <div className={`${item.avatarSize} rounded-full border-4 sm:border-[5px] border-amber-400 bg-white flex items-center justify-center shadow-2xl ring-2 ring-amber-200`}>
                  <span className="text-2xl sm:text-3xl md:text-4xl">👤</span>
                </div>
                <div className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] sm:text-xs font-black px-2 py-0.5 sm:py-1 rounded-full border-2 border-white shadow-lg">
                  {item.data.total_votes}
                </div>
              </motion.div>

              {/* 🟨 BAR - naik duluan dengan warna sesuai juara */}
              <motion.div
                variants={barVariant}
                initial="hidden"
                animate="visible"
                custom={item.barDelay}
                style={{ originY: 1 }}
                className={`${item.h} w-20 sm:w-28 md:w-36 bg-gradient-to-b ${item.bgColor} rounded-t-2xl shadow-2xl flex flex-col items-center pt-2 sm:pt-3 border-x-4 border-t-4 sm:border-x-[5px] sm:border-t-[5px] border-amber-400`}
              >
                <div className="bg-white rounded-full w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center shadow-lg border-2 border-amber-300 mb-1 sm:mb-2">
                  <span className="text-xl sm:text-2xl md:text-3xl">{item.medal}</span>
                </div>

                <div className="mt-auto mb-2 sm:mb-3 md:mb-4 bg-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border-2 border-amber-400 shadow-md w-[88%] text-center">
                  <p className="text-[8px] sm:text-[10px] md:text-xs font-black uppercase text-gray-800 leading-tight line-clamp-2">
                    {item.data.name}
                  </p>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-yellow-50 via-amber-100 to-orange-100 min-h-screen relative overflow-hidden">
      
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-amber-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-24 sm:pt-32 pb-12 sm:pb-16 relative z-10">
      
        {/* HEADER DESIGN: Skewed & More Compact */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-14 flex justify-center"
        >
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
        </motion.div>

        {/* CROWN SEPARATOR */}
        <motion.div 
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 1, rotate: 45 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center mb-8 sm:mb-10"
        >
          <div className="bg-gradient-to-br from-yellow-300 to-amber-400 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl rotate-45 border-4 border-amber-500 shadow-xl flex items-center justify-center">
            <span className="text-xl sm:text-2xl md:text-3xl -rotate-45">👑</span>
          </div>
        </motion.div>

        {renderPodium()}

        {/* LIST RANK 4 - 50 dengan GRID 2 KOLOM */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.8 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border-3 border-amber-300"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-amber-200">
            <h3 className="font-black text-sm sm:text-lg text-red-700 uppercase flex items-center gap-2">
              <span>📊</span> 
              <span>Supporter Lainnya</span>
            </h3>
            <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold">
              {topVoters.length} Total
            </div>
          </div>

          {/* GRID 2 KOLOM untuk layout: #4 kiri, #5 kanan, #6 kiri, #7 kanan dst */}
          <div className="grid md:grid-cols-2 gap-3">
            {topVoters.slice(3).map((voter, i) => (
              <motion.div
                key={voter.id}
                variants={listItemVariant}
                initial="hidden"
                animate="visible"
                custom={i}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 p-3 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 text-white font-black text-sm sm:text-lg w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                    #{i + 4}
                  </div>
                  
                  <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-white flex items-center justify-center shadow-md">
                    <span className="text-2xl">👤</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-800 text-xs uppercase truncate mb-0.5">
                      {voter.name}
                    </p>
                    <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                      <span>⭐</span>
                      <span>LOYAL SUPPORTER</span>
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-black text-red-700 text-lg sm:text-xl">
                      {voter.total_votes}
                    </p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">VOTES</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TopVoter;