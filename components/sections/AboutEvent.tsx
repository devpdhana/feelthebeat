"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export default function AboutEvent() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Scroll Tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Transform coordinates for subtle image shift
  const yParallax = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative py-[90px] bg-black overflow-hidden border-b border-white/10"
    >
      <div className="absolute inset-0 telemetry-grid opacity-[0.05] pointer-events-none z-0" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <span className="font-mono text-xs tracking-[0.35em] text-white-default font-semibold">
              ABOUT THE EVENT
            </span>

            <h2 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white-default leading-none">
              FEEL THE BEAT RUN 2026
            </h2>

            <div className="h-[1px] w-16 bg-brand-primary" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs text-muted-white mt-2">
              <div className="flex flex-col gap-4">
                <p className="leading-relaxed text-muted-white">
                  <span className="text-white-default font-bold">RUN FOR YOUR HEART:</span> Feel The Beat Run 2026 is a community running event held in Vellore to celebrate World Heart Day. The event encourages people of all ages to embrace a healthy lifestyle through running while raising awareness about cardiovascular health.
                </p>
                <p className="leading-relaxed text-muted-white">
                  Every step taken during the event represents a commitment to stronger hearts, healthier lives, and a more active community.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <p className="leading-relaxed text-white-default font-bold">
                  TELEMETRY RECON:
                  <br />
                  • VENUE: Deboer Ground, Vellore, TN
                  <br />
                  • DATE: Sunday, September 27, 2026
                  <br />
                  • OCCASION: World Heart Day
                </p>
                <p className="leading-relaxed text-muted-white">
                  Whether you are a beginner, a family group running the 2K, or an experienced runner tackling the 10K, join us to celebrate fitness and heart health.
                </p>
              </div>
            </div>
          </div>

          {/* Image Column with Parallax Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full border border-white/8 bg-[#111111] rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
              <Image
                src="/images/about/about-event.png"
                alt="Feel The Beat Run 2026"
                width={1200}
                height={800}
                className="w-full h-auto object-contain rounded-[20px]"
                priority
              />

              {/* HUD corner borders */}
              <div className="absolute top-4 left-4 font-mono text-[9px] text-muted-white bg-[#111111]/85 px-2 py-1 backdrop-blur-sm border border-white/8 rounded">
                SYS: ACTIVE_CAM_01
              </div>
              <div className="absolute bottom-4 right-4 font-mono text-[9px] text-brand-primary bg-[#111111]/85 px-2 py-1 backdrop-blur-sm border border-white/8 rounded">
                FTB_GRID_SYS
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
