"use client";

import Button from "@/components/ui/Button";
import { registrationConfig } from "@/data/navigation";
import { motion } from "framer-motion";
import { useRegistration } from "@/components/layout/RegistrationContext";

export default function RegistrationCTA() {
  const { scrollToOverview } = useRegistration();

  return (
    <section
      id="register-cta"
      className="relative flex min-h-[70vh] w-full flex-col justify-center items-center overflow-hidden bg-[#F5FAFF] py-[90px] text-center"
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1502904585520-fac43722a578?q=80&w=1920&auto=format&fit=crop"
          alt="Vellore Fort Running background"
          className="h-full w-full object-cover opacity-10 filter grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5FAFF] via-white/80 to-[#F5FAFF]" />
      </div>

      {/* Grid Pattern HUD Overlays */}
      <div className="absolute inset-0 telemetry-grid opacity-[0.07] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6">
        <span className="font-mono text-xs tracking-[0.35em] text-brand-primary font-semibold">
          [10] END_OF_MISSION_RECON
        </span>

        <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tighter text-brand-text leading-none">
          Join the Movement. Run for Every Heartbeat.
        </h2>

        <p className="max-w-md font-mono text-xs text-brand-muted leading-relaxed">
          Grid allocations for the Feel The Beat Run 2026 are now open. Secure your slots today to lock in your timed finisher medals and celebrate World Heart Day.
        </p>

        {/* Dynamic telemetry status box */}
        <div className="border border-brand-primary/12 bg-white p-4 font-mono text-[10px] text-left text-brand-muted w-full max-w-sm flex flex-col gap-1.5 backdrop-blur-sm rounded-xl shadow-sm">
          <div className="flex justify-between">
            <span>REGISTRATION STATUS:</span>
            <span className="text-brand-primary font-bold">OPEN / REGISTER NOW</span>
          </div>
          <div className="flex justify-between">
            <span>RACE DAY GATE OFF:</span>
            <span className="text-brand-text font-bold">SEPTEMBER 27, 2026  06:15 AM</span>
          </div>
          <div className="flex justify-between">
            <span>GRID SYSTEM HEALTH:</span>
            <span className="text-green-600 font-bold">100% OPERATIONAL</span>
          </div>
        </div>

        {/* CTA Button */}
        <motion.div whileHover={{ scale: 1.05 }} className="mt-4">
          <Button
            onClick={scrollToOverview}
            variant="primary"
            className="px-10 py-4 text-sm font-black"
          >
            {registrationConfig.ctaText}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
