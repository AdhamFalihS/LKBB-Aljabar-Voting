export default function TopMarquee() {
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      {/* Container Marquee Utama */}
      <div className="w-full h-16 sm:h-20 overflow-hidden relative">
        <div className="w-full h-full marquee-bg animate-marquee" />
      </div>
      
      {/* Line Coklat Muda Elegan (Tan/Light Bronze) */}
      <div className="w-full h-[4px] sm:h-[5px] bg-gradient-to-r from-[#b45309] via-[#f59e0b] to-[#b45309] opacity-100" />
      
      {/* Garis Bayangan Halus untuk Kedalaman */}
      <div className="w-full h-[1px] sm:h-[2px] bg-amber-900/5" />
    </div>
  );
}