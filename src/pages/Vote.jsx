import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Tambahkan ini
import { supabase } from "../utils/supabaseClient"; 
import Countdown from "../components/Countdown";
import SchoolCard from "../components/SchoolCard";
import VoteModal from "../components/VoteModal";

function Vote() {
  // Ambil searchParams dari URL
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 1. Mapping ID terbaru
  const categoryMap = {
    "SMP": 1,
    "SMA/SMK": 2
  };

  // 2. Inisialisasi state dari URL, jika tidak ada baru default ke "SMP"
  const categoryFromUrl = searchParams.get("category");
  const initialCategory = categoryMap[categoryFromUrl] ? categoryFromUrl : "SMP";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const eventEndTime = "2026-05-17T23:59:59";

  // Fungsi untuk ganti kategori sekaligus update URL
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSearchParams({ category: cat }); // Ini yang bikin pas refresh tetap di situ
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
    <div className="min-h-screen bg-[#072f47] text-white pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto bg-[#3b2a1a] rounded-3xl p-6 md:p-10 shadow-2xl border-4 border-yellow-500 relative">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-yellow-400 italic uppercase">Vote Now!</h1>
            <p className="text-yellow-100/70 font-bold italic">Support your favorite SMP & SMA contestants</p>
          </div>
          <input
            type="text"
            placeholder="Search school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-6 py-3 rounded-full border-4 border-yellow-500 bg-[#f7e6c4] text-[#3b2a1a] font-bold outline-none w-full md:w-72"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-3 mb-10">
          {Object.keys(categoryMap).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)} // Gunakan fungsi handle baru
              className={`px-6 py-2 rounded-full font-black transition-all border-2 ${
                selectedCategory === cat
                  ? "bg-yellow-400 text-[#3b2a1a] border-yellow-600 scale-105 shadow-lg"
                  : "bg-[#f7e6c4] text-[#5a3b1e] border-[#d8b36a] hover:bg-yellow-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* sisanya sama... */}
        <div className="mb-12 bg-black/40 p-6 rounded-2xl border border-yellow-600/20">
          <Countdown endTime={eventEndTime} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            <p className="col-span-full text-center text-yellow-500 font-bold animate-pulse uppercase tracking-widest">Loading Data...</p>
          ) : filteredSchools.length > 0 ? (
            filteredSchools.map((school) => (
              <SchoolCard 
                key={school.id} 
                school={school} 
                onVoteClick={() => setSelectedSchool(school)} 
              />
            ))
          ) : (
            <p className="col-span-full text-center italic text-yellow-100/40 py-10">No schools found in this category.</p>
          )}
        </div>
      </div>

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