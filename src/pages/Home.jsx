import Countdown from '../components/Countdown';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const eventEndTime = '2026-05-17T23:59:59';

  return (
    <div className="bg-gradient-to-b from-yellow-50 via-amber-100 to-orange-100 text-amber-900 relative overflow-hidden min-h-screen">

      {/* CONTENT WRAPPER - Perbaikan pada pt- (Padding Top) untuk mobile agar tidak terpotong */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-24 sm:pt-28 lg:pt-44 pb-24 sm:pb-20">

        {/* 1. HERO BANNER - PASUGAMA 2026 */}
        <div className="flex justify-center mb-8 sm:mb-12">
          {/* Container utama: Padding dihapus agar gambar bisa menempel ke border */}
          <div className="relative bg-gradient-to-br from-white to-amber-50 rounded-2xl sm:rounded-3xl shadow-2xl w-full border-2 border-amber-300 overflow-hidden group">
            
            {/* Wrapper Gambar: overflow-hidden di sini sangat penting */}
            <div className="relative h-[350px] sm:h-[400px] lg:h-[500px] w-full overflow-hidden">
              <img
                src="/images/BG Aljabar.jpeg" 
                alt="PASUGAMA Banner"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 origin-center"
              />
              
              {/* Overlay Gradient: Inset-0 untuk memastikan menutup seluruh area */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-red-800/40 to-transparent"></div>

              {/* Banner Content */}
              <div className="absolute inset-0 flex flex-col justify-end items-center pb-6 sm:pb-8 lg:pb-12 text-center px-3 sm:px-4">
                <span className="bg-red-600 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold tracking-wider uppercase shadow-lg mb-3 sm:mb-4 animate-pulse">
                  LOMBA PASKIBRA
                </span>

                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight drop-shadow-2xl text-white leading-tight mb-2">
                  PASUGAMA
                  <span className="block text-xl sm:text-3xl lg:text-5xl text-red-200 mt-1">2026</span>
                </h1>

                <p className="text-red-100 text-sm sm:text-base lg:text-xl font-semibold opacity-90 drop-shadow-md mb-4 sm:mb-6">
                  SMKN 11 SEMARANG
                </p>

                <button 
                  onClick={() => navigate('/vote')}
                  className="bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 transition-all duration-300 px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-xl tracking-wide uppercase text-sm sm:text-base border-b-4 border-red-800 text-white"
                >
                  <span className="hidden sm:inline">🏆 </span>DUKUNG SEKARANG
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. COUNTDOWN SECTION */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-gradient-to-r from-red-600/10 via-red-500/5 to-amber-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-sm border-2 border-red-200 shadow-xl">
            <h5 className="text-center font-bold text-red-700 mb-4 sm:mb-6 tracking-wide uppercase flex items-center justify-center gap-2 text-base sm:text-xl">
              <span className="animate-pulse">⏰</span> Voting Berakhir Dalam
            </h5>
            <Countdown endTime={eventEndTime} />
          </div>
        </div>

        {/* 3. JADWAL ACARA */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border-4 border-amber-200">
            <h2 className="font-black text-xl sm:text-3xl mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3 border-b-2 border-amber-200 pb-3 sm:pb-4 text-red-700">
              📅 JADWAL ACARA
            </h2>

            <div className="space-y-3 sm:space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border-2 border-red-200 hover:border-red-300 hover:shadow-lg transition-all duration-300">
                <span className="bg-red-600 text-white font-bold px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-lg shadow-md self-start whitespace-nowrap">
                  07:00
                </span>
                <div className="flex-1">
                  <p className="font-black text-base sm:text-xl text-red-700">Sabtu, 16 Mei 2026</p>
                  <p className="font-bold text-sm sm:text-base text-amber-800 uppercase mb-1">Tingkat SMP / MTs</p>
                  <p className="text-xs sm:text-sm font-semibold text-amber-700">SMKN 11 Semarang</p>
                  <p className="text-xs sm:text-sm italic mt-2 text-red-600 font-semibold">
                    🎖️ Hari pertama kompetisi
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border-2 border-red-200 hover:border-red-300 hover:shadow-lg transition-all duration-300">
                <span className="bg-red-600 text-white font-bold px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-lg shadow-md self-start whitespace-nowrap">
                  07:00
                </span>
                <div className="flex-1">
                  <p className="font-black text-base sm:text-xl text-red-700">Minggu, 17 Mei 2026</p>
                  <p className="font-bold text-sm sm:text-base text-amber-800 uppercase mb-1">Tingkat SMA / SMK / MA</p>
                  <p className="text-xs sm:text-sm font-semibold text-amber-700">SMKN 11 Semarang</p>
                  <p className="text-xs sm:text-sm italic mt-2 text-red-600 font-semibold">
                    🏆 Grand finale kompetisi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FEATURE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          
          <div 
            onClick={() => navigate('/vote')}
            className="group bg-gradient-to-br from-red-600 to-red-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-200 flex flex-col items-center justify-center text-center transition-all duration-500 hover:rotate-1 hover:scale-[1.02] hover:shadow-3xl cursor-pointer min-h-[240px] sm:min-h-[280px]"
          >
            <div className="bg-white/20 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl sm:text-4xl">🗳️</span>
            </div>
            <h3 className="font-black text-xl sm:text-2xl tracking-tight text-white mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-300">
              DUKUNG FAVORIT ANDA!
            </h3>
            <p className="text-red-100 text-sm sm:text-base font-medium mb-4 sm:mb-6 leading-relaxed">
              Suara Anda menentukan juara tingkat SMP & SMA/SMK
            </p>
            <div className="bg-white hover:bg-amber-50 hover:scale-105 active:scale-95 transition-all duration-300 text-red-600 font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg border-2 border-red-200">
              MULAI VOTING
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-200">
            <h4 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 tracking-wide flex items-center gap-2 text-amber-800">
              📸 GALERI KEGIATAN
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="group relative overflow-hidden rounded-xl border-3 border-amber-300 shadow-lg transition-all duration-500 hover:rotate-3 hover:scale-105 cursor-pointer aspect-square">
                <img src="/images/foto1.jpg" alt="Kegiatan 1" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="group relative overflow-hidden rounded-xl border-3 border-amber-300 shadow-lg transition-all duration-500 hover:-rotate-3 hover:scale-105 cursor-pointer aspect-square">
                <img src="/images/foto2.jpg" alt="Kegiatan 2" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button className="text-amber-700 hover:text-red-600 font-semibold text-sm transition-colors duration-200">
                Lihat Semua →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Home;