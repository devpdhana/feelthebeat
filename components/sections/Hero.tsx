"use client";

import { heroData } from "@/data/hero";
import { registrationConfig } from "@/data/navigation";
import Button from "@/components/ui/Button";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { HiArrowDown } from "react-icons/hi2";
import { motion } from "framer-motion";
import { useRegistration } from "@/components/layout/RegistrationContext";

export default function Hero() {
  const { scrollToOverview } = useRegistration();
  return (
    <section
      id="hero"
      className="relative flex h-screen w-full flex-col justify-between overflow-hidden bg-black pt-24 pb-8"
    >
      {/* Grid Pattern HUD Overlays */}
      <div className="absolute inset-0 telemetry-grid opacity-[0.08] pointer-events-none z-0" />

      {/* Empty spacer to align content */}
      <div />

      {/* Main Center Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center md:text-left flex flex-col items-center md:items-start gap-4">
        {/* Index telemetry prefix */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-mono text-[9px] md:text-xs tracking-[0.3em] text-white font-semibold"
        >
          INBOUND_METRICS_ACTIVE
        </motion.div>

        {/* Big Bold Headline with Pulse Beat Effect */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl font-display text-4xl font-black uppercase leading-[0.95] tracking-tighter text-white sm:text-6xl md:text-7xl lg:text-8xl flex flex-wrap items-center justify-center md:justify-start gap-x-4 md:gap-x-6"
        >
          <span className="text-white">FEEL THE</span>
          <motion.span
            animate={{
              scale: [1, 1.12, 1],
              textShadow: [
                "0 0 0px rgba(255,242,0,0)",
                "0 0 15px rgba(255,242,0,0.35)",
                "0 0 0px rgba(255,242,0,0)"
              ]
            }}
            transition={{
              duration: 0.95,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.3, 0.6]
            }}
            className="text-brand-secondary inline-block"
          >
            BEAT
          </motion.span>
        </motion.h1>

        {/* Animated ECG Heartbeat Line */}
        <div className="w-56 h-10 relative overflow-hidden -mt-1 md:-mt-2 opacity-80">
          <svg viewBox="0 0 300 50" className="w-full h-full text-brand-primary/70" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                ease: "linear"
              }}
            />
          </svg>
        </div>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="mt-1"
        >
          <CountdownTimer targetDate="2026-09-27T06:30:00" light={false} />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="max-w-2xl font-jost text-xs md:text-sm font-semibold tracking-widest text-white uppercase text-center md:text-left mt-2"
        >
          {heroData.subtitle}
        </motion.p>

        {/* CTA Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="mt-4 flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <Button
            onClick={scrollToOverview}
            variant="primary"
            className="px-8"
          >
            {registrationConfig.ctaText}
          </Button>
          <Button href={registrationConfig.learnMoreUrl} variant="secondary" className="px-8">
            LEARN MORE
          </Button>
        </motion.div>
      </div>

      {/* Telemetry Dashboard footer (Telemetry Grid details) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-8 md:grid-cols-4">
          {heroData.telemetry.map((tel, idx) => (
            <div key={idx} className="flex flex-col gap-1 border-r border-white/10 last:border-0 pr-4">
              <span className="font-mono text-[8px] md:text-[9px] tracking-widest text-white/75">
                [{idx + 1}]  {tel.label}
              </span>
              <span className="font-mono text-xs md:text-sm font-bold tracking-wider text-white">
                {tel.value}
              </span>
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="mt-8 flex items-center justify-between text-white/75">
          <span className="font-mono text-[9px] tracking-widest">
            HEART_RATE_STANDBY: 72BPM  SIGNAL_OK
          </span>
          <a
            href="#highlights"
            className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-white hover:text-white transition-colors cursor-pointer"
          >
            SCROLL DOWN
            <HiArrowDown className="animate-bounce" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
