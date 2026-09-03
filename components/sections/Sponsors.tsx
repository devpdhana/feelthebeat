"use client";

import { sponsors, getSortedSponsors } from "@/data/sponsors";
import Image from "next/image";

export default function Sponsors() {
  const sortedSponsors = getSortedSponsors(sponsors);
  // Duplicate sorted sponsors array for seamless infinite marquee loop
  const duplicatedSponsors = [...sortedSponsors, ...sortedSponsors];

  return (
    <section id="sponsors" className="relative py-[90px] bg-white overflow-hidden border-b border-brand-primary/12">
      {/* Hardware-accelerated CSS Keyframes for seamless infinite marquee */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .sponsor-marquee-track {
              display: flex;
              width: max-content;
              animation: marquee 40s linear infinite;
              will-change: transform;
            }
            .sponsor-marquee-container:hover .sponsor-marquee-track {
              animation-play-state: paused;
            }
            @media (prefers-reduced-motion: reduce) {
              .sponsor-marquee-track {
                animation: none;
                overflow-x: auto;
              }
            }
          `,
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section title */}
        <div className="mb-14 flex flex-col items-center text-center gap-2">
          <span className="font-mono text-xs tracking-[0.35em] text-brand-primary font-semibold">
            PARTNERS NETWORK
          </span>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-default md:text-4xl">
            SPONSORS & BRAND COLLABORATORS
          </h2>
          <div className="h-[1px] w-16 bg-brand-primary mt-2" />
        </div>
      </div>

      {/* Infinite moving carousel container */}
      <div className="sponsor-marquee-container relative flex overflow-x-hidden w-full py-4 bg-white group select-none">
        {/* Gradient edge masks for smooth appearance/disappearance */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 md:w-40 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 md:w-40 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* Marquee slider track */}
        <div className="sponsor-marquee-track flex items-center gap-6 sm:gap-8 px-4">
          {duplicatedSponsors.map((sponsor, idx) => (
            <div
              key={`${sponsor.id}-${idx}`}
              className="flex flex-col items-center justify-between text-center bg-white border border-[#DCEBFF] rounded-2xl p-6 shadow-[0_8px_24px_rgba(6,152,243,0.05)] w-[210px] sm:w-[240px] md:w-[260px] h-[190px] md:h-[200px] shrink-0 transition-all duration-300 hover:border-brand-primary hover:shadow-[0_12px_32px_rgba(6,152,243,0.12)] hover:-translate-y-1 cursor-pointer"
            >
              {/* Logo container */}
              <div className="relative flex-grow w-full h-[85px] md:h-[95px] flex items-center justify-center mb-3">
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  fill
                  sizes="(max-width: 768px) 180px, 220px"
                  className="object-contain p-1"
                />
              </div>

              {/* Sponsor info */}
              <div className="w-full flex flex-col items-center gap-0.5 border-t border-brand-primary/8 pt-3">
                <h4 className="font-display text-xs md:text-sm font-bold text-default truncate w-full px-1" title={sponsor.name}>
                  {sponsor.name}
                </h4>
                <p className="font-mono text-[9px] md:text-[10px] text-brand-primary font-bold uppercase tracking-wider">
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
