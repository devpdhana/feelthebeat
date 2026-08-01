"use client";

import { raceCategories } from "@/data/events";
import { motion } from "framer-motion";
import { HiOutlineMap, HiOutlineClock } from "react-icons/hi";

export default function RaceCategories() {
  return (
    <section
      id="categories"
      className="relative py-[90px] bg-black overflow-hidden border-b border-white/10"
    >
      <div className="absolute inset-0 telemetry-grid opacity-[0.03] pointer-events-none z-0" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="mb-16 flex flex-col items-center text-center gap-2">
          <span className="font-mono text-xs tracking-[0.35em] text-white-default font-semibold">
            [04] TIER_REGISTRY
          </span>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white-default md:text-5xl">
            RACE CATEGORIES & LOGISTICS
          </h2>
          <div className="h-[1px] w-24 bg-brand-primary mt-2" />
        </div>

        {/* Premium Cards with Gradients & Hover Effects */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {raceCategories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ scale: 1.02 }}
              className="relative group flex flex-col justify-between border border-white/8 bg-[#111111] rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.45)] p-8 transition-all duration-300 overflow-hidden hover:border-[#5184EE] hover:shadow-[0_18px_40px_rgba(81,132,238,0.16)]"
            >
              {/* Outer Glowing Border Effect */}
              <div className="absolute inset-0 rounded-2xl border border-brand-primary opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300 pointer-events-none" />

              {/* Background gradient hint */}
              <div className={`absolute top-0 right-0 h-40 w-40 rounded-full blur-[100px] opacity-10 bg-gradient-to-br ${category.gradientFrom} ${category.gradientTo}`} />

              {/* Large Index Number */}
              <div className="absolute top-4 right-6 font-display text-6xl font-black text-white/8 select-none transition-colors group-hover:text-white/12">
                0{idx + 1}
              </div>

              <div>
                <span className="font-mono text-[9px] tracking-widest text-muted-white uppercase">
                  CLASSIFICATION: TIMED_RUN
                </span>
                <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white-default mt-1 group-hover:text-brand-primary transition-colors">
                  {category.name}
                </h3>
                
                {/* Distance display with custom gradient styling */}
                <div className={`text-4xl font-display font-black tracking-tighter bg-gradient-to-r ${category.gradientFrom} ${category.gradientTo} bg-clip-text text-transparent mt-2`}>
                  {category.distance}
                </div>

                <p className="text-xs font-mono text-muted-white mt-4 leading-relaxed max-w-lg">
                  {category.description}
                </p>

                {/* Key specs */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5 mt-6 font-mono text-[11px] text-muted-white">
                  <div className="flex items-center gap-2">
                    <HiOutlineClock className="text-brand-primary text-sm shrink-0" />
                    <div>
                      <div className="text-[9px] text-muted-white">START TIMING</div>
                      <div className="font-bold text-white-default">{category.startTime}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiOutlineMap className="text-brand-primary text-sm shrink-0" />
                    <div>
                      <div className="text-[9px] text-muted-white">CUT-OFF TIME</div>
                      <div className="text-brand-primary font-bold">{category.cutoffTime}</div>
                    </div>
                  </div>
                </div>

                {/* Route Highlights list */}
                <div className="mt-5 border-t border-white/10 pt-4">
                  <span className="font-mono text-[9px] text-muted-white tracking-widest uppercase block mb-2 font-semibold">
                    KEY CHECKPOINTS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {category.routeHighlights.map((hl, hlIdx) => (
                      <span key={hlIdx} className="bg-white/5 border border-white/12 px-2.5 py-1 font-mono text-[9px] text-white-default rounded">
                        {hl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
