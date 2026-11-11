import { useEffect, useState } from "react";

function getTimeLeft(date) {
  const difference = Math.max(new Date(date) - new Date(), 0);

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function Countdown({ date }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(date));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(date)), 1000);
    return () => clearInterval(timer);
  }, [date]);

  return (
    <div className="countdown" aria-label="Time before the start">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div className="countdown-item" key={unit}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{unit}</span>
        </div>
      ))}
    </div>
  );
}
