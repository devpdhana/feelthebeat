"use client";

import {
  getRow1Sponsors,
  getRow2GoldSponsors,
  getRow2CoSponsors,
  getRow3OtherSponsors,
} from "@/data/sponsors";

export default function Sponsors() {
  const row1Sponsors = getRow1Sponsors();
  const row2GoldSponsors = getRow2GoldSponsors();
  const row2CoSponsors = getRow2CoSponsors();
  const row3OtherSponsors = getRow3OtherSponsors();

  // Uniform logo container dimensions and styles applied to EVERY sponsor logo
  const logoContainerClass =
    "w-full h-[80px] sm:h-[88px] md:h-[96px] flex items-center justify-center p-2";
  const logoImageClass =
    "max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105";

  return (
    <section
      id="sponsors"
      className="relative py-12 md:py-18 bg-white overflow-hidden border-b border-brand-primary/12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Section Header */}
        <div className="mb-10 md:mb-14 flex flex-col items-center text-center gap-2">
          <span className="font-mono text-xs tracking-[0.35em] text-brand-primary font-semibold uppercase">
            PARTNERS NETWORK
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-default">
            SPONSORS & BRAND COLLABORATORS
          </h2>
          <div className="h-0.5 w-16 bg-brand-primary mt-1.5 rounded-full" />
        </div>

        {/* Uniform Logo Showcase */}
        <div className="space-y-10 md:space-y-14">
          {/* ====================================================== */}
          {/* 1. ORGANIZER & TITLE SPONSOR                           */}
          {/* ====================================================== */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                ORGANIZER &amp; TITLE SPONSOR
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 w-full max-w-2xl">
              {row1Sponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="group flex flex-col items-center justify-between text-center w-[160px] sm:w-[180px] md:w-[200px] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-primary mb-1.5 truncate w-full">
                    {sponsor.role}
                  </span>

                  {/* Uniform Fixed Logo Container */}
                  <div className={logoContainerClass}>
                    <img
                      src={sponsor.logo || sponsor.image}
                      alt={sponsor.name}
                      className={logoImageClass}
                      loading="eager"
                    />
                  </div>

                  <h3
                    className="font-display text-xs sm:text-sm font-bold text-default mt-1.5 px-1 truncate w-full"
                    title={sponsor.name}
                  >
                    {sponsor.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          {/* ====================================================== */}
          {/* 2. GOLD SPONSORS & CO-SPONSORS                         */}
          {/* ====================================================== */}
          <div className="w-full max-w-5xl mx-auto space-y-10">
            {/* 2A. GOLD SPONSORS */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="h-px bg-amber-300 w-10 sm:w-20" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3.5 py-0.5 rounded-full border border-amber-200">
                  GOLD SPONSORS
                </h3>
                <div className="h-px bg-amber-300 w-10 sm:w-20" />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 w-full max-w-4xl">
                {row2GoldSponsors.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="group flex flex-col items-center justify-between text-center w-[160px] sm:w-[180px] md:w-[200px] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    {/* Uniform Fixed Logo Container */}
                    <div className={logoContainerClass}>
                      <img
                        src={sponsor.logo || sponsor.image}
                        alt={sponsor.name}
                        className={logoImageClass}
                        loading="lazy"
                      />
                    </div>

                    <h4
                      className="font-display text-xs sm:text-sm font-bold text-default mt-1.5 px-1 truncate w-full"
                      title={sponsor.name}
                    >
                      {sponsor.name}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* 2B. CO-SPONSORS */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="h-px bg-blue-200 w-10 sm:w-20" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-brand-primary bg-blue-50 px-3.5 py-0.5 rounded-full border border-brand-primary/20">
                  CO-SPONSORS
                </h3>
                <div className="h-px bg-blue-200 w-10 sm:w-20" />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 w-full max-w-2xl">
                {row2CoSponsors.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="group flex flex-col items-center justify-between text-center w-[160px] sm:w-[180px] md:w-[200px] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    {/* Uniform Fixed Logo Container */}
                    <div className={logoContainerClass}>
                      <img
                        src={sponsor.logo || sponsor.image}
                        alt={sponsor.name}
                        className={logoImageClass}
                        loading="lazy"
                      />
                    </div>

                    <h4
                      className="font-display text-xs sm:text-sm font-bold text-default mt-1.5 px-1 truncate w-full"
                      title={sponsor.name}
                    >
                      {sponsor.name}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ====================================================== */}
          {/* 3. OFFICIAL PARTNERS                                   */}
          {/* ====================================================== */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px bg-slate-200 w-10 sm:w-20" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-600 bg-slate-100 px-3.5 py-0.5 rounded-full border border-slate-200">
                OFFICIAL PARTNERS
              </h3>
              <div className="h-px bg-slate-200 w-10 sm:w-20" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-10 w-full max-w-6xl">
              {row3OtherSponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="group flex flex-col items-center justify-between text-center w-[150px] sm:w-[165px] md:w-[175px] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {/* Uniform Fixed Logo Container */}
                  <div className={logoContainerClass}>
                    <img
                      src={sponsor.logo || sponsor.image}
                      alt={sponsor.name}
                      className={logoImageClass}
                      loading="lazy"
                    />
                  </div>

                  <h5
                    className="font-display text-xs sm:text-[13px] font-bold text-default mt-1.5 px-0.5 truncate w-full"
                    title={sponsor.name}
                  >
                    {sponsor.name}
                  </h5>
                  <p className="font-mono text-[9px] text-brand-primary font-bold uppercase tracking-wider mt-0.5 truncate w-full">
                    {sponsor.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
