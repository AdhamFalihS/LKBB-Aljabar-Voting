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
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="bg-[#0f3550] rounded-2xl px-6 py-4 shadow-xl border border-[#1f5f88]">
      
      <h2 className="text-center font-extrabold tracking-widest text-sm mb-4 text-yellow-300">
        ⏰ VOTING ENDS IN
      </h2>

      <div className="flex gap-4 justify-center">

        {/* DAYS */}
        <TimeBox value={timeLeft.days} label="DAYS" />

        {/* HOURS */}
        <TimeBox value={timeLeft.hours} label="HOURS" />

        {/* MINUTES */}
        <TimeBox value={timeLeft.minutes} label="MIN" />

        {/* SECONDS */}
        <TimeBox value={timeLeft.seconds} label="SEC" />

      </div>
    </div>
  );
}

function TimeBox({ value, label }) {
  return (
    <div className="bg-[#09283d] rounded-xl w-20 h-20 flex flex-col justify-center items-center shadow-inner border border-[#1f5f88]">
      <span className="text-3xl font-extrabold text-white">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] tracking-widest text-yellow-300 font-bold mt-1">
        {label}
      </span>
    </div>
  );
}

export default Countdown;
