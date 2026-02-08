// Vote.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient"; 
import Countdown from "../components/Countdown";
import SchoolCard from "../components/SchoolCard";
import VoteModal from "../components/VoteModal";

function Vote() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryMap = {
    "SMP": 1,
    "SMA/SMK": 2
  };

  const categoryFromUrl = searchParams.get("category");
  const initialCategory = categoryMap[categoryFromUrl] ? categoryFromUrl : "SMP";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const eventEndTime = "2026-05-17T23:59:59";

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSearchParams({ category: cat });
  };

  const loadSchools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("category_id", categoryMap[selectedCategory]) 
        .order("total_votes", { ascending: false });

      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, [selectedCategory]);

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-b from-yellow-50 via-amber-100 to-orange-100 min-h-screen relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-amber-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 relative z-10">
        
        {/* Header Section with Banner Style */}
        <div className="mb-6 sm:mb-10">
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-amber-200 relative overflow-hidden">
            
            {/* Decorative Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" 
                   style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px"}}>
              </div>
            </div>

            <div className="relative z-10">
              {/* Title Section */}
              <div className="text-center">
                <span className="inline-block bg-white/20 text-white text-xs sm:text-sm px-4 py-2 rounded-full font-bold tracking-wider uppercase shadow-lg mb-3 sm:mb-4 animate-pulse border-2 border-white/30">
                  🗳️ VOTING ONLINE
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-2xl mb-2 sm:mb-3">
                  DUKUNG FAVORIT ANDA!
                </h1>
                <p className="text-red-100 text-sm sm:text-lg font-semibold opacity-90">
                  Suara Anda Menentukan Juara Pasugama 2026
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Section */}
        <div className="mb-6 sm:mb-10">
          <div className="bg-gradient-to-r from-red-600/10 via-red-500/5 to-amber-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-sm border-2 border-red-200 shadow-xl">
            <h5 className="text-center font-bold text-red-700 mb-4 sm:mb-6 tracking-wide uppercase flex items-center justify-center gap-2 text-base sm:text-xl">
              <span className="animate-pulse">⏰</span> Voting Berakhir Dalam
            </h5>
            <Countdown endTime={eventEndTime} />
          </div>
        </div>

        {/* Category Tabs & Search */}
        <div className="mb-6 sm:mb-10">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border-2 border-amber-200">
            <h3 className="text-center font-black text-red-700 mb-4 sm:mb-6 text-lg sm:text-2xl tracking-wide flex items-center justify-center gap-2">
              <span>🏆</span> PILIH KATEGORI
            </h3>
            
            {/* Category Buttons - HORIZONTAL di mobile, CENTER compact di desktop */}
            <div className="flex flex-row sm:justify-center gap-3 sm:gap-4 mb-5 sm:mb-6">
              {Object.keys(categoryMap).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`flex-1 sm:flex-none px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black transition-all duration-300 border-4 text-sm sm:text-lg uppercase tracking-wide shadow-lg ${
                    selectedCategory === cat
                      ? "bg-red-600 text-white border-red-800 scale-105 shadow-2xl transform hover:scale-110"
                      : "bg-white text-red-600 border-amber-200 hover:bg-amber-50 hover:border-red-300 hover:scale-105"
                  }`}
                >
                  <span className="hidden sm:inline">
                    {cat === "SMP" ? "🎓 " : "🎯 "}
                  </span>
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Cari nama sekolah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-4 border-amber-300 bg-white text-amber-900 font-bold outline-none focus:border-red-400 focus:ring-4 focus:ring-red-200/50 transition-all shadow-lg text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Schools Grid */}
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border-2 border-amber-200">
          
          {/* Grid Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 border-b-2 border-amber-200">
            <h3 className="font-black text-lg sm:text-2xl text-red-700 flex items-center gap-2">
              <span>📋</span>
              <span className="hidden sm:inline">Daftar Peserta</span>
              <span className="sm:hidden">Peserta</span>
            </h3>
            <div className="bg-red-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-base shadow-lg">
              {filteredSchools.length} Sekolah
            </div>
          </div>

          {/* Schools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-20">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-red-600 border-t-transparent mb-4"></div>
                <p className="text-red-600 font-bold text-base sm:text-xl animate-pulse uppercase tracking-widest">
                  Memuat Data...
                </p>
              </div>
            ) : filteredSchools.length > 0 ? (
              filteredSchools.map((school) => (
                <SchoolCard 
                  key={school.id} 
                  school={school} 
                  onVoteClick={() => setSelectedSchool(school)} 
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16 sm:py-20">
                <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 opacity-20">🔍</div>
                <p className="text-amber-700 font-bold text-base sm:text-xl mb-2">
                  Tidak Ada Sekolah Ditemukan
                </p>
                <p className="text-amber-600 text-sm sm:text-base">
                  Coba ubah kata kunci pencarian Anda
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 sm:mt-10">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-amber-200">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="bg-red-600 text-white rounded-full p-3 sm:p-4 shadow-lg flex-shrink-0">
                <span className="text-2xl sm:text-3xl">💡</span>
              </div>
              <div className="flex-1">
                <h4 className="font-black text-red-700 text-base sm:text-lg mb-1 sm:mb-2">
                  Cara Memberikan Vote
                </h4>
                <p className="text-amber-800 text-xs sm:text-sm font-semibold leading-relaxed">
                  Klik kartu sekolah favorit Anda → Masukkan nama → Pilih jumlah vote → Kirim! 
                  <span className="text-red-600 font-bold"> Setiap vote = Rp 1.000</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vote Modal */}
      {selectedSchool && (
        <VoteModal 
          school={selectedSchool} 
          onClose={() => setSelectedSchool(null)} 
          onSuccess={loadSchools} 
        />
      )}
    </div>
  );
}

export default Vote;