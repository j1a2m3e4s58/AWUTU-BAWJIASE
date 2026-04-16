import React, { useState, useEffect } from 'react';

export default function FuneralCountdown({ targetDate, eventTitle }) {
  const [timeLeft, setTimeLeft] = useState({});
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setExpired(true); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (expired) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-sm p-8 text-center mb-12">
      <p className="text-xs uppercase tracking-[0.25em] text-primary font-medium mb-3">Ceremony Begins In</p>
      <p className="font-display text-lg text-foreground mb-6">{eventTitle}</p>
      <div className="flex justify-center gap-6 md:gap-10">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="font-display text-4xl md:text-5xl font-semibold text-foreground tabular-nums w-16 md:w-20">
              {String(value ?? 0).padStart(2, '0')}
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}