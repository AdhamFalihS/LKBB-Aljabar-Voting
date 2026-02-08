import { useState, useEffect } from 'react';

function Countdown({ endTime }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime) - new Date();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-4 sm:py-6 shadow-2xl border-2 sm:border-4 border-white/90 relative overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header - Hidden on mobile since it's shown in parent */}
        <h2 className="hidden sm:flex text-center font-bold tracking-wide text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 text-white items-center justify-center gap-2">
          <span className="animate-bounce">⏰</span> 
          <span>VOTING BERAKHIR DALAM</span>
        </h2>

        {/* Countdown Grid - HORIZONTAL, NO SCROLLBAR */}
        <div className="flex gap-2 sm:gap-4 justify-center items-center max-w-md sm:max-w-lg mx-auto scrollbar-hide">
          <TimeBox value={timeLeft.days} label="HARI" />
          <TimeBox value={timeLeft.hours} label="JAM" />
          <TimeBox value={timeLeft.minutes} label="MENIT" />
          <TimeBox value={timeLeft.seconds} label="DETIK" />
        </div>

        {/* Subtitle */}
        <p className="text-center text-red-100 text-[10px] sm:text-sm mt-3 sm:mt-4 font-medium opacity-90 px-2">
          Jangan sampai terlewat! Dukung kontestan favorit Anda
        </p>
      </div>
    </div>
  );
}

function TimeBox({ value, label }) {
  return (
    <div className="group relative flex-shrink-0">
      {/* Main Box */}
      <div className="bg-gradient-to-br from-white to-red-50 rounded-lg sm:rounded-xl w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 flex flex-col justify-center items-center shadow-xl border-2 sm:border-3 border-red-200 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl relative overflow-hidden">
        
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
        
        {/* Number */}
        <span className="text-xl sm:text-2xl lg:text-3xl font-black text-red-700 relative z-10 transition-all duration-300 group-hover:scale-110">
          {String(value).padStart(2, '0')}
        </span>
        
        {/* Label */}
        <span className="text-[9px] sm:text-[10px] lg:text-xs tracking-wider text-red-600 font-bold mt-0.5 sm:mt-1 relative z-10 uppercase">
          {label}
        </span>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-red-400/30 rounded-lg sm:rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
    </div>
  );
}

export default Countdown;