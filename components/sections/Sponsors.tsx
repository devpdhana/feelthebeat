"use client";

import { sponsors } from "@/data/sponsors";
import Image from "next/image";

export default function Sponsors() {
  // Duplicate sponsors list once for seamless infinite loop alignment
  const duplicatedSponsors = [...sponsors, ...sponsors];

  return (
    <section id="sponsors" className="relative py-[90px] bg-white overflow-hidden border-b border-brand-primary/12">
      {/* CSS Keyframes for hardware accelerated marquee animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 25s linear infinite;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `,
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section title */}
        <div className="mb-12 flex flex-col items-center text-center gap-2">
          <span className="font-mono text-xs tracking-[0.35em] text-brand-primary font-semibold">
            [06] PARTNERS_NETWORK
          </span>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-[#111827] md:text-4xl">
            SPONSORS & BRAND COLLABORATORS
          </h2>
          <div className="h-[1px] w-16 bg-brand-primary mt-2" />
        </div>
      </div>

      {/* Infinite slider container */}
      <div className="relative flex overflow-x-hidden w-full py-4 bg-white">
        {/* Fading gradient edges overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Marquee slider content track */}
        <div className="flex animate-marquee whitespace-nowrap gap-[60px] min-w-max px-[30px]">
          {duplicatedSponsors.map((sponsor, idx) => (
            <div
              key={idx}
              className="inline-flex flex-col items-center justify-between text-center bg-white border border-[#DCEBFF] rounded-[16px] p-6 shadow-[0_8px_24px_rgba(81,132,238,0.04)] w-[240px] h-[180px] shrink-0 transition-all duration-300 hover:border-brand-primary/30 hover:shadow-[0_12px_30px_rgba(81,132,238,0.08)] cursor-pointer"
            >
              {/* Logo container */}
              <div className="relative flex-grow w-full h-[80px] mb-4">
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  fill
                  sizes="180px"
                  className="object-contain"
                />
              </div>

              {/* Sponsor info */}
              <div>
                <h4 className="font-display text-sm font-bold text-[#111827] truncate max-w-[200px]">
                  {sponsor.name}
                </h4>
                <p className="font-mono text-[10px] text-brand-primary font-bold uppercase tracking-wider mt-0.5">
                  {sponsor.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
