"use client";

import { useState } from "react";
import { routesData, RouteData, CheckpointNode, RouteCheckpointDisplay } from "@/data/routes";
import Card from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

export default function RouteInformation() {
  const [selectedRoute, setSelectedRoute] = useState<RouteData>(routesData[2]); // Default 10K
  const [selectedNode, setSelectedNode] = useState<CheckpointNode>(routesData[2].checkpoints[0]);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleRouteSelect = (route: RouteData) => {
    setSelectedRoute(route);
    setSelectedNode(route.checkpoints[0]);
    setZoomLevel(1); // Reset zoom
  };

  const handleZoom = () => {
    setZoomLevel(zoomLevel === 1 ? 1.3 : 1);
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
            <span className="font-mono text-xs tracking-[0.35em] text-white font-semibold">
              [05] NAVIGATIONAL_MAP
            </span>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
              ROUTE DIRECTIVES
            </h2>
          </div>
          <p className="max-w-md font-mono text-xs leading-relaxed text-white">
            Telemetry map showing the official loops of Feel The Beat Run 2026. Toggle tabs to preview different courses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
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
                    className={`flex-1 py-3 px-4 text-center font-display text-xs font-black uppercase tracking-widest border transition-all duration-300 active:scale-95 cursor-pointer relative rounded-lg ${
                      isActive
                        ? "bg-brand-primary/10 border-brand-primary text-brand-primary font-bold shadow-sm"
                        : "bg-[#111111] border-white/12 text-[#D1D5DB] hover:text-brand-primary hover:border-brand-primary/30 shadow-sm"
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
                  <span className="bg-white/5 border border-white/12 px-3 py-1 font-mono text-[9px] text-[#D1D5DB] uppercase tracking-wider rounded">
                    EST_TIME: {selectedRoute.estimatedDuration}
                  </span>
                  <span className="bg-white/5 border border-white/12 px-3 py-1 font-mono text-[9px] text-[#D1D5DB] uppercase tracking-wider rounded">
                    GAIN: {selectedRoute.elevationGain}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-white uppercase">
                  {selectedRoute.title}
                </h3>

                <p className="text-xs font-mono text-white leading-relaxed mb-4">
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
                          <span className="font-mono text-[9px] tracking-wider text-[#D1D5DB]">
                            CHECKPOINT {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className={`font-display text-base font-bold transition-colors ${
                            isSelected ? "text-brand-primary" : "text-white group-hover:text-brand-primary"
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

          {/* Interactive SVG Telemetry Vector Map (Right Side) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Card className="relative overflow-hidden aspect-[4/3] w-full flex items-center justify-center" hoverEffect={false} dark={true}>
              
              {/* Zoom control toggle */}
              <button
                suppressHydrationWarning
                onClick={handleZoom}
                className="absolute top-4 right-4 z-20 font-mono text-[9px] border border-white/12 px-3 py-1.5 bg-[#111111] text-white hover:border-brand-primary hover:text-brand-primary transition-all uppercase cursor-pointer shadow-sm rounded"
              >
                ZOOM: {zoomLevel === 1 ? "1.0X" : "1.3X"}
              </button>

              {/* Live coordinates telemetry banner */}
              <div className="absolute bottom-4 left-4 z-20 font-mono text-[8px] text-[#D1D5DB] flex flex-col gap-0.5 bg-[#111111]/90 p-2 border border-white/12 rounded shadow-sm">
                <span>TARGET_SYS: AFLI_FTB_GRID</span>
                <span className="text-brand-primary font-bold">NODE: {selectedNode.name.toUpperCase()}</span>
                <span>COORD_MAP: {selectedNode.coordinates.x}X, {selectedNode.coordinates.y}Y</span>
              </div>

              {/* Vector Map Container */}
              <motion.div
                animate={{ scale: zoomLevel }}
                transition={{ duration: 0.4 }}
                className="w-full h-full p-8 flex items-center justify-center"
              >
                <svg
                  viewBox="0 0 600 450"
                  className="w-full h-full max-h-[350px] opacity-85"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Decorative background radar circles */}
                  <circle cx="300" cy="225" r="200" stroke="rgba(30, 144, 255, 0.12)" strokeWidth="1" strokeDasharray="5 5" />
                  <circle cx="300" cy="225" r="120" stroke="rgba(30, 144, 255, 0.12)" strokeWidth="1" />

                  {/* Grid Lines */}
                  <line x1="0" y1="225" x2="600" y2="225" stroke="rgba(30, 144, 255, 0.12)" strokeWidth="1" />
                  <line x1="300" y1="0" x2="300" y2="450" stroke="rgba(30, 144, 255, 0.12)" strokeWidth="1" />

                  {/* Static trace path background */}
                  <path
                    d={selectedRoute.mapPath}
                    stroke="rgba(30, 144, 255, 0.15)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Animated Active Course Loop Overlay (Draws path from 0 to 1 on route switch) */}
                  <motion.path
                    key={selectedRoute.id}
                    d={selectedRoute.mapPath}
                    stroke="#1E90FF"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.0, ease: "easeInOut" }}
                  />

                  {/* Interactive checkpoint markers */}
                  {selectedRoute.checkpoints.map((checkpoint: CheckpointNode, checkpointIdx: number) => {
                    const isSelected = selectedNode.name === checkpoint.name;
                    const isStartOrFinish = checkpointIdx === 0 || checkpointIdx === selectedRoute.checkpoints.length - 1;

                    return (
                      <g key={checkpointIdx} className="cursor-pointer" onClick={() => setSelectedNode(checkpoint)}>
                        {/* Glowing active node outer circle */}
                        {isSelected && (
                          <motion.circle
                            cx={checkpoint.coordinates.x}
                            cy={checkpoint.coordinates.y}
                            r="14"
                            fill="rgba(30, 144, 255, 0.2)"
                            stroke="#1E90FF"
                            strokeWidth="1"
                            animate={{ scale: [1, 1.4, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}

                        {/* Start/Finish markers glowing pulse (always active) */}
                        {isStartOrFinish && !isSelected && (
                          <motion.circle
                            cx={checkpoint.coordinates.x}
                            cy={checkpoint.coordinates.y}
                            r="10"
                            fill="rgba(255, 90, 0, 0.15)"
                            stroke="#FF5A00"
                            strokeWidth="1"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}

                        {/* Node point marker dot */}
                        <circle
                          cx={checkpoint.coordinates.x}
                          cy={checkpoint.coordinates.y}
                          r={isSelected ? "6" : isStartOrFinish ? "5" : "3.5"}
                          fill={isSelected ? "#1E90FF" : isStartOrFinish ? "#FF5A00" : "#FFFFFF"}
                          className="transition-all duration-300"
                        />

                        {/* Hover tag label text */}
                        <text
                          x={checkpoint.coordinates.x + 10}
                          y={checkpoint.coordinates.y - 10}
                          fill={isSelected ? "#1E90FF" : isStartOrFinish ? "rgba(255, 90, 0, 0.8)" : "#D1D5DB"}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight={isSelected ? "bold" : "normal"}
                        >
                          {checkpoint.mileage}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </motion.div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
