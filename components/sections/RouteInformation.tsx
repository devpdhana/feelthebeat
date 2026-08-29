"use client";

import { useState } from "react";
import Image from "next/image";
import { routesData, RouteData, RouteCheckpointDisplay } from "@/data/routes";
import { motion, AnimatePresence } from "framer-motion";

export default function RouteInformation() {
  const [selectedRoute, setSelectedRoute] = useState<RouteData>(routesData[2]); // Default 10K

  const handleRouteSelect = (route: RouteData) => {
    setSelectedRoute(route);
  };

  return (
    <section
      id="route"
      className="relative py-[90px] bg-black overflow-hidden border-b border-white/10"
    >
      <div className="absolute inset-0 telemetry-grid opacity-[0.03] pointer-events-none z-0" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Title Section */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs tracking-[0.35em] text-white-default font-semibold">
              NAVIGATIONAL MAP
            </span>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white-default md:text-5xl">
              ROUTE DIRECTIVES
            </h2>
          </div>
          <p className="max-w-md font-mono text-xs leading-relaxed text-muted-white">
            Official route directives of Feel The Beat Run 2026. Select a category tab to view its corresponding course map.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Controls & Stepper Column (Left Side) */}
          <div className="lg:col-span-5 flex flex-col">

            {/* Route Tab Selectors: Exactly 3 tabs: 2 KM, 5 KM, 10 KM */}
            <div className="grid grid-cols-3 gap-2 border-b border-white/10 pb-6 mb-8 w-full">
              {routesData.map((route: RouteData) => {
                const isActive = selectedRoute.id === route.id;
                return (
                  <button
                    suppressHydrationWarning
                    key={route.id}
                    onClick={() => handleRouteSelect(route)}
                    className={`py-3 px-3 text-center font-display text-xs font-black uppercase tracking-wider border transition-all duration-300 active:scale-95 cursor-pointer relative rounded-lg ${
                      isActive
                        ? "bg-brand-primary/10 border-brand-primary text-brand-primary font-bold shadow-sm"
                        : "bg-[#111111] border-white/12 text-muted-white hover:text-brand-primary hover:border-brand-primary/30 shadow-sm"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1E90FF]" />
                    )}
                    {route.distance}
                  </button>
                );
              })}
            </div>

            {/* Route Content (Animate tab transitions with fade and slide effect) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRoute.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                {/* Distance & Info badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-brand-primary/10 border border-white/12 px-3 py-1 font-mono text-[9px] text-brand-primary uppercase tracking-wider rounded font-semibold">
                    TARGET: {selectedRoute.distance}
                  </span>
                  <span className="bg-white/5 border border-white/12 px-3 py-1 font-mono text-[9px] text-muted-white uppercase tracking-wider rounded">
                    EST_TIME: {selectedRoute.estimatedDuration}
                  </span>
                  <span className="bg-white/5 border border-white/12 px-3 py-1 font-mono text-[9px] text-muted-white uppercase tracking-wider rounded">
                    GAIN: {selectedRoute.elevationGain}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-white-default uppercase">
                  {selectedRoute.title}
                </h3>

                <p className="text-xs font-mono text-muted-white leading-relaxed mb-4">
                  {selectedRoute.description}
                </p>

                {/* Vertical Stepper Container */}
                <div className="border-t border-white/10 pt-8 flex flex-col gap-6 relative pl-2">
                  {selectedRoute.checkpointsList.map((cp: RouteCheckpointDisplay, idx: number) => {
                    return (
                      <div
                        key={idx}
                        className="flex gap-4 items-center relative"
                      >
                        {/* Continuous Connecting Line between circles */}
                        {idx < selectedRoute.checkpointsList.length - 1 && (
                          <div className="absolute left-[11px] top-[24px] bottom-[-24px] w-[2px] bg-white/10 z-0">
                            <motion.div
                              className="w-full h-full bg-[#1E90FF]/40 origin-top"
                              initial={{ scaleY: 0 }}
                              whileInView={{ scaleY: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                          </div>
                        )}

                        {/* Status Circle Indicator */}
                        <div className="relative z-10 w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center shadow-[0_0_12px_#0698F3]">
                          <svg className="w-3.5 h-3.5 text-white stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>

                        {/* Checkpoint labels right beside it */}
                        <div className="flex flex-col gap-0.5 pl-2 select-none">
                          <span className="font-mono text-[9px] tracking-wider text-muted-white">
                            {cp.label}
                          </span>
                          <span className="font-display text-base font-bold text-white-default">
                            {cp.location}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Category Route Map Image Display (Right Side) */}
          <div className="lg:col-span-7 flex flex-col w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRoute.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="relative w-full rounded-[20px] overflow-hidden border border-white/8 bg-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.45)] p-2 sm:p-3"
              >
                <div className="relative w-full overflow-hidden rounded-[16px]">
                  <Image
                    src={selectedRoute.image}
                    alt={selectedRoute.title}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-contain rounded-[14px] transition-all duration-300"
                    priority
                  />

                  {/* HUD overlay badges */}
                  <div className="absolute top-4 left-4 font-mono text-[9px] text-muted-white bg-[#111111]/85 px-2.5 py-1 backdrop-blur-sm border border-white/8 rounded">
                    SYS: {selectedRoute.distance}_ROUTE_MAP
                  </div>
                  <div className="absolute bottom-4 right-4 font-mono text-[9px] text-brand-primary bg-[#111111]/85 px-2.5 py-1 backdrop-blur-sm border border-white/8 rounded">
                    FTB_OFFICIAL_ROUTE
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
