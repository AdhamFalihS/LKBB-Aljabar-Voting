import Countdown from '../components/Countdown';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  // Update: Mengatur waktu berakhir ke 17 Mei 2026
  const eventEndTime = '2026-05-17T23:59:59';

  return (
    <div className="bg-gradient-to-b from-[#0b4f78] via-[#0a3b5c] to-[#072f47] text-white relative overflow-hidden min-h-screen">

      {/* CONTENT WRAPPER */}
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-20">

        {/* 1. TOP SECTION: BANNER */}
        <div className="flex justify-center mb-10">
          <div className="relative bg-[#123f5a] rounded-3xl p-4 shadow-2xl w-full border border-white/10 overflow-hidden">
            
            <div className="relative h-[350px] md:h-[500px] w-full group">
              <img
                src="/images/BG Aljabar.jpeg" 
                alt="Event Banner"
                className="rounded-2xl w-full h-full object-cover shadow-lg transition-transform duration-700 group-hover:scale-105"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent rounded-2xl"></div>

              <div className="absolute inset-0 flex flex-col justify-end items-center pb-8 md:pb-12 text-center px-4">
                <span className="bg-orange-500 text-[10px] md:text-xs px-4 py-1.5 rounded-full font-black tracking-widest uppercase shadow-lg mb-3 animate-fade-in">
                  LKBB ALJABAR
                </span>

                <h1 className="text-4xl md:text-7xl font-black tracking-tighter drop-shadow-2xl text-yellow-400 leading-none mb-2">
                  LKBB ALJABAR 2026
                </h1>

                <p className="text-white text-base md:text-xl font-bold opacity-90 drop-shadow-md">
                  SMKN 11 SEMARANG
                </p>

                <button 
                  onClick={() => navigate('/vote')}
                  className="mt-6 bg-orange-500 hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all px-10 py-4 rounded-2xl font-black shadow-[0_10px_25px_rgba(249,115,22,0.5)] tracking-widest uppercase text-sm border-b-4 border-orange-700"
                >
                  SUPPORT NOW
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MIDDLE SECTION: 2 COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* VOTE CARD (Hanya Mention SMP & SMA) */}
          <div 
            onClick={() => navigate('/vote')}
            className="group bg-gradient-to-br from-purple-600 to-indigo-800 rounded-3xl p-8 shadow-2xl border-4 border-yellow-400 flex flex-col items-center justify-center text-center transition-all duration-500 hover:rotate-2 hover:scale-[1.03] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] cursor-pointer"
          >
            <h3 className="font-black text-2xl tracking-tight text-white italic transition-all duration-500 group-hover:scale-110">
              SUPPORT YOUR FAVORITE!
            </h3>
            
            <p className="text-purple-100 mt-2 font-medium">
              Your vote determines the champion of SMP & SMA!
            </p>

            <button className="mt-6 bg-yellow-400 hover:bg-yellow-300 hover:scale-110 active:scale-90 transition-all text-[#3b2a1a] font-black px-10 py-4 rounded-2xl shadow-xl flex items-center gap-2 border-b-4 border-yellow-600 group-hover:animate-pulse">
              <span className="text-xl">💀</span> CAST YOUR VOTE
            </button>
          </div>

          {/* TEASER GALLERY */}
          <div className="bg-[#1c5d8a]/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/10">
            <h4 className="font-black text-xl mb-6 tracking-widest flex items-center gap-2 text-yellow-400">
              🖼️ TREASURE GALLERY
            </h4>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="group relative overflow-hidden rounded-2xl border-4 border-[#3b2a1a] shadow-lg transition-all duration-500 hover:rotate-6 hover:scale-110 cursor-pointer">
                 <img src="/images/foto1.jpg" alt="thumb" className="w-32 h-32 md:w-40 md:h-40 object-cover" />
              </div>
              <div className="group relative overflow-hidden rounded-2xl border-4 border-[#3b2a1a] shadow-lg transition-all duration-500 hover:-rotate-6 hover:scale-110 cursor-pointer">
                <img src="/images/foto2.jpg" alt="thumb" className="w-32 h-32 md:w-40 md:h-40 object-cover" />
              </div>
            </div>
          </div>

        </div>

        {/* 3. BOTTOM SECTION: COUNTDOWN & SCHEDULE */}
        <div className="space-y-10">
          
          <div className="bg-black/20 rounded-3xl p-8 backdrop-blur-md border border-white/5 shadow-inner">
            <h5 className="text-center font-black text-yellow-400 mb-6 tracking-widest uppercase flex items-center justify-center gap-2">
              <span className="animate-pulse">⏱️</span> Voting Ends In
            </h5>
            <Countdown endTime={eventEndTime} />
          </div>

          <div className="bg-[#f5e1b8] text-[#3b2a1a] rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-b-8 border-[#d8b36a]">
            <h2 className="font-black text-3xl mb-8 flex items-center gap-3 border-b-2 border-[#3b2a1a]/10 pb-4">
              📅 EVENT SCHEDULE
            </h2>

            <div className="space-y-6">
              {/* JADWAL SMP */}
              <div className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl bg-white/30 border border-white/20 hover:bg-white/50 transition duration-300">
                <span className="bg-red-600 text-white font-black px-6 py-2 rounded-xl text-lg shadow-md self-start">
                  07:00
                </span>
                <div>
                  <p className="font-black text-xl">Sabtu, 16 Mei 2026</p>
                  <p className="font-bold opacity-80 text-lg uppercase text-indigo-900">Tingkat SMP / MTs</p>
                  <p className="text-sm font-bold text-gray-600">SMKN 11 Semarang</p>
                  <p className="text-sm italic mt-2 text-red-600 font-bold">
                    ⚔️ Petualangan dimulai...
                  </p>
                </div>
              </div>

              {/* JADWAL SMA */}
              <div className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl bg-white/30 border border-white/20 hover:bg-white/50 transition duration-300">
                <span className="bg-red-600 text-white font-black px-6 py-2 rounded-xl text-lg shadow-md self-start">
                  07:00
                </span>
                <div>
                  <p className="font-black text-xl">Minggu, 17 Mei 2026</p>
                  <p className="font-bold opacity-80 text-lg uppercase text-indigo-900">Tingkat SMA / SMK / MA</p>
                  <p className="text-sm font-bold text-gray-600">SMKN 11 Semarang</p>
                  <p className="text-sm italic mt-2 text-red-600 font-bold">
                    ⚔️ Pertempuran Puncak...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;