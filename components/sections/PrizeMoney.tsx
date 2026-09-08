"use client";

import Link from "next/link";
import { FaMedal, FaArrowRight, FaCheckCircle } from "react-icons/fa";

interface PrizeCardItem {
  id: string;
  category: string;
  badge: string;
  rankLabel: string;
  amount: string;
  gender: string;
  cashTiers: string;
}

const prizeCards: PrizeCardItem[] = [
  {
    id: "10k",
    category: "10KM TIMED RUN",
    badge: "10K",
    rankLabel: "1ST PRIZE",
    amount: "₹10,000",
    gender: "Men & Women (Each)",
    cashTiers: "Top 5 Cash Prizes • Purse ₹54,000",
  },
  {
    id: "5k",
    category: "5KM TIMED RUN",
    badge: "5K",
    rankLabel: "1ST PRIZE",
    amount: "₹10,000",
    gender: "Men & Women (Each)",
    cashTiers: "Top 5 Cash Prizes • Purse ₹54,000",
  },
];

export default function PrizeMoney() {
  return (
    <section
      id="prizes"
      aria-labelledby="prize-money-heading"
      className="relative py-12 md:py-16 bg-[#F8FAFC] border-b border-slate-200/80"
    >
      {/* Anchor for #prize-money hash routing */}
      <span
        id="prize-money"
        className="absolute -top-20 block invisible pointer-events-none"
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 md:mb-10 flex flex-col items-center text-center gap-1.5">
          <span className="font-mono text-xs tracking-[0.3em] text-brand-primary font-bold uppercase">
            REWARDS &amp; AWARDS
          </span>

          <h2
            id="prize-money-heading"
            className="font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900"
          >
            Prize Money
          </h2>

          <p className="max-w-md font-sans text-xs sm:text-sm text-slate-500 leading-relaxed">
            Run strong. Finish strong. Take home the rewards.
          </p>

          <div className="h-0.5 w-12 bg-brand-primary mt-1 rounded-full" />
        </div>

        {/* Compact Prize Cards Grid */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 items-stretch">
          {prizeCards.map((card) => (
            <article
              key={card.id}
              className="flex flex-col justify-between bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-brand-primary/40 transition-all duration-200"
            >
              <div>
                {/* Header: Category & Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-display text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">
                    {card.category}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded font-mono text-[11px] font-bold uppercase tracking-wider text-brand-primary bg-blue-50 border border-brand-primary/20">
                    {card.badge}
                  </span>
                </div>

                {/* Main Focus: Prize Amount */}
                <div className="mb-2">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400 font-bold block">
                    {card.rankLabel}
                  </span>
                  <div className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight my-0.5">
                    {card.amount}
                  </div>
                  <p className="font-mono text-xs text-slate-600 font-medium">
                    {card.gender}
                  </p>
                </div>
              </div>

              {/* Card Footer: Tier info */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>{card.cashTiers}</span>
                <span className="text-brand-primary font-semibold">RFID Timed</span>
              </div>
            </article>
          ))}
        </div>

        {/* Compact Finisher Recognition Row */}
        <div className="mt-4 sm:mt-5 max-w-3xl mx-auto rounded-xl border border-slate-200/90 bg-white px-4 sm:px-5 py-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-500 flex items-center justify-center text-sm shrink-0">
              <FaMedal />
            </div>
            <div>
              <h4 className="font-display text-xs sm:text-sm font-bold uppercase text-slate-900">
                Finisher Medal &amp; Certificate
              </h4>
              <p className="font-sans text-[11px] sm:text-xs text-slate-500">
                Awarded to all participants who complete 5KM &amp; 10KM
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-600 font-semibold shrink-0">
            <FaCheckCircle className="text-emerald-500 text-xs" />
            <span>All Finishers</span>
          </div>
        </div>

        {/* View Full Prize Pool Button */}
        <div className="mt-6 sm:mt-7 flex flex-col items-center justify-center gap-2">
          <Link
            href="/prize-money"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-brand-primary/40 text-slate-800 font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-200"
          >
            <span>View Full Prize Breakdown (1st–5th)</span>
            <FaArrowRight className="text-[10px] text-brand-primary" />
          </Link>
          <p className="font-mono text-[10px] text-slate-400">
            Official cash prize tables for Top 5 Men &amp; Women in 10K &amp; 5K
          </p>
        </div>
      </div>
    </section>
  );
}
