"use client";

import { useState } from "react";
import { routesData, RouteData, CheckpointNode, RouteCheckpointDisplay } from "@/data/routes";
import RouteMap from "@/components/maps/RouteMap";
import { motion, AnimatePresence } from "framer-motion";

export default function RouteInformation() {
  const [selectedRoute, setSelectedRoute] = useState<RouteData>(routesData[2]); // Default 10K
  const [selectedNode, setSelectedNode] = useState<CheckpointNode>(routesData[2].checkpoints[0]);

  const handleRouteSelect = (route: RouteData) => {
    setSelectedRoute(route);
    setSelectedNode(route.checkpoints[0]);
  };

  const getCheckpointState = (idx: number) => {
    const activeIdx = selectedRoute.checkpointsList.findIndex(
      (c: RouteCheckpointDisplay) => selectedRoute.checkpoints[c.nodeIndex].name === selectedNode.name
    );
    if (idx === activeIdx) {
      return "active";
    } else if (idx < activeIdx) {
      return "completed";
    } else {
      return "upcoming";
    }
  };

  const getRouteType = (routeId: string): "2km" | "5km" | "10km" => {
    if (routeId.includes("2k")) return "2km";
    if (routeId.includes("5k")) return "5km";
    return "10km";
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
            Telemetry map showing the official loops of Feel The Beat Run 2026. Toggle tabs to preview different courses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Controls & Stepper Column (Left Side) */}
          <div className="lg:col-span-5 flex flex-col">

            {/* Route Tab Selectors */}
            <div className="flex gap-2 border-b border-white/10 pb-6 mb-8 w-full">
              {routesData.map((route: RouteData) => {
                const isActive = selectedRoute.id === route.id;
                return (
                  <button
                    suppressHydrationWarning
                    key={route.id}
                    onClick={() => handleRouteSelect(route)}
                    className={`flex-1 py-3 px-4 text-center font-display text-xs font-black uppercase tracking-widest border transition-all duration-300 active:scale-95 cursor-pointer relative rounded-lg ${isActive
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
                <div className="border-t border-white/10 pt-8 flex flex-col gap-8 relative pl-2">
                  {selectedRoute.checkpointsList.map((cp: RouteCheckpointDisplay, idx: number) => {
                    const state = getCheckpointState(idx);
                    const isSelected = state === "active";

                    return (
                      <div
                        key={idx}
                        className="flex gap-4 items-center relative cursor-pointer group"
                        onClick={() => setSelectedNode(selectedRoute.checkpoints[cp.nodeIndex])}
                      >
                        {/* Continuous Connecting Line between circles (animates drawing) */}
                        {idx < selectedRoute.checkpointsList.length - 1 && (
                          <div className="absolute left-[11px] top-[24px] bottom-[-32px] w-[2px] bg-white/10 z-0">
                            <motion.div
                              className="w-full h-full bg-[#1E90FF]/40 origin-top"
                              initial={{ scaleY: 0 }}
                              whileInView={{ scaleY: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                          </div>
                        )}

                        {/* Status Circle Indicators (22-24px size) */}
                        {state === "completed" && (
                          <div className="relative z-10 w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center shadow-[0_0_12px_#0698F3]">
                            <svg className="w-3.5 h-3.5 text-white stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <motion.div
                              className="absolute inset-0 rounded-full border border-brand-primary/40"
                              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                            />
                          </div>
                        )}

                        {state === "active" && (
                          <div className="relative z-10 w-6 h-6 rounded-full border border-brand-primary bg-[#111111] p-[3px] flex items-center justify-center shadow-[0_0_10px_rgba(6,152,243,0.5)]">
                            <motion.div
                              className="w-full h-full rounded-full bg-brand-primary"
                              animate={{ scale: [0.85, 1.05, 0.85] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            />
                          </div>
                        )}

                        {state === "upcoming" && (
                          <div className="relative z-10 w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center transition-colors group-hover:border-brand-primary/40" />
                        )}

                        {/* Checkpoint labels right beside it */}
                        <div className="flex flex-col gap-0.5 pl-2 select-none">
                          <span className="font-mono text-[9px] tracking-wider text-muted-white">
                            CHECKPOINT {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className={`font-display text-base font-bold transition-colors ${isSelected ? "text-brand-primary" : "text-white-default group-hover:text-brand-primary"
                            }`}>
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

          {/* Interactive Route Map (Right Side) */}
          <div className="lg:col-span-7 flex flex-col w-full min-h-[350px] md:min-h-[400px]">
            <RouteMap routeType={getRouteType(selectedRoute.id)} />
          </div>
        </div>
      </div>
    </section>
  );
}
