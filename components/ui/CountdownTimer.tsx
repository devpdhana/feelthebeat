"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string;
  light?: boolean;
}

export default function CountdownTimer({ targetDate, light = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const targetTime = new Date(targetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className={`flex items-center justify-between border p-2 sm:p-2.5 max-w-[350px] sm:max-w-[400px] w-full h-[62px] sm:h-[68px] animate-pulse rounded-2xl ${
        light
          ? "border-[#DCEBFF] bg-white shadow-[0_10px_30px_rgba(81,132,238,0.08)]"
          : "border-white/10 bg-black/50 backdrop-blur-md"
      }`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 flex items-center justify-center relative">
            <div className="flex flex-col items-center justify-center py-1 px-1 sm:px-2.5 w-full">
              <span className="w-7 h-5 bg-[#F5FAFF]/20 rounded" />
              <span className="w-9 h-2 bg-[#F5FAFF]/10 rounded mt-1.5" />
            </div>
            {i < 4 && (
              <div className={`absolute right-0 top-1/2 -translate-y-1/2 h-7 sm:h-8 w-[1px] ${
                light ? "bg-[#DCEBFF]" : "bg-white/10"
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  }

  const timerItems = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.minutes },
    { label: "SECS", value: timeLeft.seconds },
  ];

  return (
    <div className={`flex items-center justify-between border p-2 sm:p-2.5 max-w-[350px] sm:max-w-[400px] w-full relative rounded-2xl ${
      light
        ? "border-[#DCEBFF] bg-white shadow-[0_10px_30px_rgba(81,132,238,0.08)]"
        : "border-white/10 bg-black/50 backdrop-blur-md"
    }`}>
      {/* Corner Notches */}
      <span className="absolute top-0 left-0 w-1.5 h-[1px] bg-brand-primary/30" />
      <span className="absolute top-0 left-0 w-[1px] h-1.5 bg-brand-primary/30" />
      <span className="absolute bottom-0 right-0 w-1.5 h-[1px] bg-brand-primary/30" />
      <span className="absolute bottom-0 right-0 w-[1px] h-1.5 bg-brand-primary/30" />

      {timerItems.map((item, idx) => (
        <div key={idx} className="flex-1 flex items-center justify-center relative">
          <div className="flex flex-col items-center justify-center py-1 px-1 sm:px-2.5 w-full">
            <span className="font-mono text-lg sm:text-xl md:text-2xl font-black tracking-tight text-brand-primary tabular-nums leading-none">
              {String(item.value).padStart(2, "0")}
            </span>
            <span className={`font-mono text-[8.5px] sm:text-[9.5px] tracking-[0.16em] uppercase mt-1 font-semibold ${
              light ? "text-brand-muted" : "text-white/80"
            }`}>
              {item.label}
            </span>
          </div>
          {/* Subtle vertical divider between items */}
          {idx < timerItems.length - 1 && (
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 h-7 sm:h-8 w-[1px] ${
              light ? "bg-[#DCEBFF]" : "bg-white/10"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}
