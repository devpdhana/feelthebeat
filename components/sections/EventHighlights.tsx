"use client";

import { raceCategories, statistics } from "@/data/events";
import Card from "@/components/ui/Card";
import Counter from "@/components/ui/Counter";
import { motion } from "framer-motion";
import { useRegistration } from "@/components/layout/RegistrationContext";
import Link from "next/link";

export default function EventHighlights() {
  const { eventOverviewRef, shouldHighlight } = useRegistration();

  return (
    <section
      id="event-highlights"
      ref={eventOverviewRef}
      className={`relative py-[90px] bg-[#F5FAFF] overflow-hidden border-y border-brand-primary/12 transition-all duration-700 scroll-mt-[95px] ${shouldHighlight
        ? "border-brand-primary/80 shadow-[0_0_50px_rgba(81,132,238,0.15)]"
        : "border-brand-primary/12 shadow-none"
        }`}
    >
      {/* Decorative vertical coordinates overlay */}
      <div className="absolute right-8 top-12 font-mono text-[9px] text-brand-muted/15 uppercase tracking-widest hidden md:block">
        INDEX_REGISTRY_FTB_SYS_02
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs tracking-[0.35em] text-brand-primary font-semibold">
              EVENT OVERVIEW
            </span>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-default md:text-5xl">
              RACE DISTANCES
            </h2>
          </div>
          <p className="max-w-md font-mono text-xs leading-relaxed text-muted-default">
            Engineered telemetry profiles for each category. Standard routes mapping the heart of Vellore&apos;s historic loop.
          </p>
        </div>

        {/* Categories grid (4 columns on desktop/laptop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-20 w-full items-stretch">
          {raceCategories.map((category, idx) => (
            <Card
              key={category.id}
              className="flex flex-col min-h-[360px] h-full"
            >
              <div>
                {/* HUD Header */}
                <div className="flex items-center justify-between border-b border-brand-primary/8 pb-4 mb-5">
                  <span className="font-mono text-xs text-brand-primary font-bold">
                    REF_0{idx + 1}
                  </span>
                  <span className={`font-mono text-[9px] font-semibold ${category.isTimed ? "text-brand-muted/50" : "text-brand-primary"}`}>
                    STATUS: {category.timingType || (category.isTimed ? "TIMED" : "NON-TIMED")}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-default mb-1">
                  {category.name}
                </h3>
                <div className="font-mono text-2xl font-black tracking-tight text-brand-primary">
                  {category.distance}
                </div>
                <div className="mt-4">
                  <span className="font-mono text-[9px] tracking-widest text-muted-default uppercase block">
                    REGISTRATION FEE
                  </span>
                  <span className="text-lg font-bold text-brand-primary">
                    ₹{category.fee}
                  </span>
                </div>
                <p className="text-xs text-muted-default leading-relaxed mt-4">
                  {category.description}
                </p>
              </div>

              {/* HUD Footer & Registration Trigger Button (mt-auto pushes this block to the very bottom) */}
              <div className="border-t border-brand-primary/8 pt-4 mt-auto flex flex-col gap-2 font-mono text-[10px] text-muted-default">
                <div className="flex justify-between">
                  <span>REPORTING:</span>
                  <span className="text-default font-bold">{category.reportingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>START TIME:</span>
                  <span className="text-default font-bold">{category.startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>AGE ELIGIBILITY:</span>
                  <span className="text-default font-bold">{category.ageLimit}</span>
                </div>
                {category.isTimed && category.cutoffTime && (
                  <div className="flex justify-between mb-2">
                    <span>CUT-OFF:</span>
                    <span className="text-brand-primary font-black">{category.cutoffTime}</span>
                  </div>
                )}

                {/* Form trigger action */}
                <Link
                  href={`/register?category=${category.id}`}
                  className="w-full mt-2 bg-brand-primary border border-brand-primary hover:bg-brand-primary-hover py-2.5 font-display text-[10px] font-black uppercase tracking-widest text-white transition-all duration-300 active:scale-95 cursor-pointer text-center block rounded shadow-sm"
                >
                  REGISTER NOW
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Statistics section */}
        <div className="border-t border-brand-primary/12 pt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          {statistics.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="flex flex-col gap-1 md:border-r border-brand-primary/8 last:border-0 pr-4"
            >
              <div className="font-display text-4xl md:text-5xl font-black tracking-tighter text-default">
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <span className="font-mono text-[9px] md:text-xs tracking-widest text-muted-default mt-2 font-semibold">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
