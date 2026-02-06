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
    <div>
      <h2>⏰ VOTING ENDS IN</h2>

      <div>
        <span>{timeLeft.days}</span>
        <span>DAYS</span>
      </div>

      <div>
        <span>{timeLeft.hours}</span>
        <span>HOURS</span>
      </div>

      <div>
        <span>{timeLeft.minutes}</span>
        <span>MIN</span>
      </div>

      <div>
        <span>{timeLeft.seconds}</span>
        <span>SEC</span>
      </div>
    </div>
  );
}

export default Countdown;
