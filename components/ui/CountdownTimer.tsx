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
      <div className={`flex gap-3 border p-3 max-w-sm w-full h-[58px] animate-pulse rounded-[18px] ${
        light
          ? "border-[#DCEBFF] bg-white shadow-[0_10px_30px_rgba(81,132,238,0.08)]"
          : "border-white/10 bg-black/45 backdrop-blur-sm"
      }`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`flex-1 border-r last:border-0 flex flex-col items-center justify-center ${
            light ? "border-[#DCEBFF]" : "border-white/10"
          }`}>
            <span className="w-6 h-4 bg-[#F5FAFF]/20 rounded" />
            <span className="w-8 h-2 bg-[#F5FAFF]/10 rounded mt-1.5" />
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
    <div className={`flex gap-3 border p-3 max-w-sm w-full relative rounded-[18px] ${
      light
        ? "border-[#DCEBFF] bg-white shadow-[0_10px_30px_rgba(81,132,238,0.08)]"
        : "border-white/10 bg-black/45 backdrop-blur-sm"
    }`}>
      {/* Corner Notches */}
      <span className="absolute top-0 left-0 w-1 h-[1px] bg-brand-primary/20" />
      <span className="absolute top-0 left-0 w-[1px] h-1 bg-brand-primary/20" />
      <span className="absolute bottom-0 right-0 w-1 h-[1px] bg-brand-primary/20" />
      <span className="absolute bottom-0 right-0 w-[1px] h-1 bg-brand-primary/20" />

      {timerItems.map((item, idx) => (
        <div key={idx} className={`flex-1 flex flex-col items-center justify-center border-r last:border-0 ${
          light ? "border-[#DCEBFF]" : "border-white/10"
        }`}>
          <span className="font-mono text-base md:text-lg font-black tracking-tight text-brand-primary tabular-nums">
            {String(item.value).padStart(2, "0")}
          </span>
          <span className={`font-mono text-[8px] tracking-widest mt-0.5 ${
            light ? "text-brand-muted" : "text-white/80"
          }`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
