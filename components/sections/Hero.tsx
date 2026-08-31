"use client";

import { heroData } from "@/data/hero";
import { registrationConfig } from "@/data/navigation";
import Button from "@/components/ui/Button";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[90vh] md:min-h-screen w-full flex-col justify-between overflow-hidden bg-black pt-28 pb-10"
      style={{
        backgroundImage: "url('/images/hero/hero.png')",
        backgroundSize: "cover",
        backgroundPosition: "center 25%",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Cinematic Gradient Overlays for optimal readability while keeping the image vibrant */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-black/90 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/20 via-black/50 to-black/85 pointer-events-none z-0" />
      <div className="absolute inset-0 telemetry-grid opacity-[0.05] pointer-events-none z-0" />

      {/* Top spacer */}
      <div className="h-2" />

      {/* Main Center Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center gap-3 sm:gap-4 my-auto">

        {/* Presenter / Sponsor Line */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-1 sm:gap-1.5"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm md:text-base font-bold tracking-widest text-white uppercase font-mono drop-shadow">
            <span className="text-white drop-shadow">SREE JAYAM SCHOOL</span>
            <span className="text-brand-secondary font-black text-xs sm:text-sm px-0.5">×</span>
            <span className="text-white drop-shadow">VRG CEMENT MARKETING PVT LTD</span>
          </div>
          <span className="font-mono text-[9px] sm:text-[11px] tracking-[0.4em] text-brand-secondary uppercase font-black drop-shadow">
            PRESENTS
          </span>
        </motion.div>

        {/* Main Event Title: FEEL THE BEAT */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-0 sm:gap-1"
        >
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black uppercase leading-[0.9] tracking-tighter text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)]">
            <span>FEEL THE </span>
            <motion.span
              animate={{
                scale: [1, 1.08, 1],
                textShadow: [
                  "0 0 0px rgba(255,242,0,0)",
                  "0 0 25px rgba(255,242,0,0.45)",
                  "0 0 0px rgba(255,242,0,0)",
                ],
              }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.3, 0.6],
              }}
              className="text-brand-secondary inline-block"
            >
              BEAT
            </motion.span>
          </h1>


        </motion.div>

        {/* Animated ECG Heartbeat Line */}
        <div className="w-48 sm:w-64 h-8 relative overflow-hidden opacity-90 my-1">
          <svg viewBox="0 0 300 50" className="w-full h-full text-brand-primary" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M 0,25 L 110,25 L 115,15 L 120,35 L 125,5 L 130,45 L 135,25 L 140,25 L 300,25"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </svg>
        </div>

        {/* Event Information Line */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="max-w-4xl px-2"
        >
          <p className="font-mono text-[11px] sm:text-xs md:text-sm lg:text-base font-bold uppercase tracking-wider md:tracking-widest text-white drop-shadow-md text-center leading-relaxed">
            <span className="text-brand-secondary font-black">RUN FOR YOUR HEART</span>
            <span className="mx-2 text-white/50 hidden sm:inline">•</span>
            <span className="block sm:inline my-0.5 sm:my-0 text-white">SUNDAY, SEPTEMBER 27, 2026</span>
            <span className="mx-2 text-white/50 hidden sm:inline">•</span>
            <span className="block sm:inline text-brand-primary font-bold">WORLD HEART DAY</span>
          </p>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
          className="my-1 scale-90 sm:scale-100"
        >
          <CountdownTimer targetDate="2026-09-27T05:00:00" light={false} />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="mt-2 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto items-center justify-center px-4"
        >
          <Button
            href="/register"
            variant="primary"
            className="w-full sm:w-auto px-10 py-4 text-xs sm:text-sm font-black tracking-widest shadow-[0_0_30px_rgba(6,152,243,0.5)] uppercase transition-transform hover:scale-105"
          >
            {registrationConfig.ctaText || "REGISTER NOW"}
          </Button>
          <Button
            href="#categories"
            variant="secondary"
            className="w-full sm:w-auto px-8 py-4 text-xs sm:text-sm font-bold tracking-wider uppercase border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          >
            VIEW CATEGORIES
          </Button>
        </motion.div>
      </div>

      {/* Telemetry Dashboard Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-6"
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4 border-t border-white/15 pt-6 md:grid-cols-4 bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
          {heroData.telemetry.map((tel, idx) => (
            <div key={idx} className="flex flex-col gap-0.5 border-r border-white/10 last:border-0 pr-2 sm:pr-4">
              <span className="font-mono text-[8px] sm:text-[9px] tracking-widest text-white/70">
                [{idx + 1}] {tel.label}
              </span>
              <span className="font-mono text-[11px] sm:text-xs md:text-sm font-bold tracking-wider text-white">
                {tel.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
