import type { Metadata } from "next";
import Link from "next/link";
import {
  FaMedal,
  FaAward,
  FaFileAlt,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { IoMaleOutline, IoFemaleOutline } from "react-icons/io5";
import { standardPrizes, prizeSummary } from "@/data/prizes";

export const metadata: Metadata = {
  title: "Prize Money & Finisher Recognition | Feel The Beat Run 2026",
  description:
    "Official Prize Money breakdown and Finisher Recognition for Feel The Beat Run 2026 in Vellore. Cash prizes for top 5 Men and Women in 10KM & 5KM, plus Finisher Medal & Certificate for all finishers.",
  alternates: {
    canonical: "/prize-money",
  },
  openGraph: {
    title: "Prize Money & Finisher Recognition | Feel The Beat Run 2026",
    description:
      "Win up to ₹10,000 in 10K & 5K timed runs. Total cash purse ₹1,08,000+ awarded across Men and Women divisions. Finisher Medal & Certificate for all 5K & 10K finishers.",
    url: "/prize-money",
  },
};

export default function PrizeMoneyPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#FFFFFF] via-[#F5FAFF] to-[#EEF8FF] text-slate-900 selection:bg-brand-primary selection:text-white">
      {/* Soft abstract ambient glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-primary/5 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-amber-400/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-2/3 left-10 w-[450px] h-[450px] bg-blue-400/5 blur-[150px] pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20 sm:pb-24">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 font-mono text-xs text-slate-500">
          <Link
            href="/"
            className="hover:text-brand-primary transition-colors flex items-center gap-1.5 font-medium"
          >
            <FaArrowLeft className="text-[10px]" />
            HOME
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-brand-primary font-bold">PRIZE MONEY &amp; REWARDS</span>
        </div>

        {/* Page Hero Header */}
        <div className="mb-12 sm:mb-16 text-center flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full shadow-sm">
            <FaAward className="text-amber-500 text-sm" />
            <span className="font-mono text-xs tracking-[0.25em] text-brand-primary font-bold uppercase">
              OFFICIAL CASH PURSE &bull; 2026 EDITION
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-slate-900 max-w-4xl">
            GRAND PRIZE POOL
          </h1>

          <p className="max-w-2xl font-sans text-sm sm:text-base text-slate-600 leading-relaxed">
            Feel The Beat Run 2026 rewards competitive excellence with equal cash prizes for Men and Women in timed categories, verified by official RFID chip timing.
          </p>

          <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-brand-primary to-transparent mt-1" />

          {/* Highlights Metric Bar */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl">
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-amber-200/80 shadow-sm">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                TOTAL CASH PURSE
              </span>
              <span className="font-display text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                {prizeSummary.totalPrizePool}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                CASH WINNERS
              </span>
              <span className="font-display text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                20 WINNERS
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-blue-200/80 shadow-sm">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                TIMED RACES
              </span>
              <span className="font-display text-2xl sm:text-3xl font-black text-brand-primary mt-1">
                10K &amp; 5K
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-sm">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                GENDER ELIGIBILITY
              </span>
              <span className="font-display text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                EQUAL REWARDS
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1. CASH PRIZES (10KM & 5KM TIMED CATEGORIES)              */}
        {/* ========================================================= */}
        <div className="mb-14 sm:mb-18 space-y-8 sm:space-y-10">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
              COMPETITIVE CASH PRIZES (10KM &amp; 5KM)
            </h2>
            <p className="font-mono text-xs text-slate-500 mt-1">
              Official cash awards for the Top 5 Men and Top 5 Women finishers with verified RFID chip timing.
            </p>
          </div>

          {/* 10KM Breakdown */}
          <div className="rounded-[24px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-7">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-display font-black text-lg rounded-xl shadow-sm">
                  10 KM
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
                    10 KM TIMED RUN
                  </h3>
                  <span className="font-mono text-xs text-slate-500">
                    Category Purse: <strong className="text-slate-900 font-bold">₹54,000</strong> (10 Cash Winners)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                <span className="text-brand-primary bg-blue-50 border border-brand-primary/20 px-3 py-1 rounded-full font-bold">
                  RFID CHIP TIMED
                </span>
              </div>
            </div>

            {/* Men & Women 10K Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* 10K Men */}
              <div className="rounded-2xl border border-slate-200/80 bg-[#F8FAFC] p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <IoMaleOutline className="text-xl" />
                    <h4 className="font-display text-base sm:text-lg font-black uppercase text-slate-900 tracking-wider">
                      10KM MEN
                    </h4>
                  </div>
                  <span className="font-mono text-xs text-brand-primary font-bold">
                    PURSE: ₹27,000
                  </span>
                </div>

                <div className="space-y-2.5">
                  {standardPrizes.map((tier) => (
                    <div
                      key={tier.rank}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        tier.rank === 1
                          ? "bg-amber-50/80 border-amber-300/80 text-slate-900 shadow-xs"
                          : "bg-white border-slate-200/70 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-black ${
                            tier.rank === 1
                              ? "bg-amber-400 text-slate-950 shadow-xs"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {tier.rank}
                        </span>
                        <span className="font-display text-sm font-bold uppercase">
                          {tier.position}
                        </span>
                      </div>

                      <span
                        className={`font-display text-lg font-black tracking-tight ${
                          tier.rank === 1 ? "text-amber-700" : "text-slate-900"
                        }`}
                      >
                        {tier.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 10K Women */}
              <div className="rounded-2xl border border-slate-200/80 bg-[#F8FAFC] p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
                  <div className="flex items-center gap-2 text-pink-600">
                    <IoFemaleOutline className="text-xl" />
                    <h4 className="font-display text-base sm:text-lg font-black uppercase text-slate-900 tracking-wider">
                      10KM WOMEN
                    </h4>
                  </div>
                  <span className="font-mono text-xs text-brand-primary font-bold">
                    PURSE: ₹27,000
                  </span>
                </div>

                <div className="space-y-2.5">
                  {standardPrizes.map((tier) => (
                    <div
                      key={tier.rank}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        tier.rank === 1
                          ? "bg-amber-50/80 border-amber-300/80 text-slate-900 shadow-xs"
                          : "bg-white border-slate-200/70 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-black ${
                            tier.rank === 1
                              ? "bg-amber-400 text-slate-950 shadow-xs"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {tier.rank}
                        </span>
                        <span className="font-display text-sm font-bold uppercase">
                          {tier.position}
                        </span>
                      </div>

                      <span
                        className={`font-display text-lg font-black tracking-tight ${
                          tier.rank === 1 ? "text-amber-700" : "text-slate-900"
                        }`}
                      >
                        {tier.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5KM Breakdown */}
          <div className="rounded-[24px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-7">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-display font-black text-lg rounded-xl shadow-sm">
                  5 KM
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
                    5 KM TIMED RUN
                  </h3>
                  <span className="font-mono text-xs text-slate-500">
                    Category Purse: <strong className="text-slate-900 font-bold">₹54,000</strong> (10 Cash Winners)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                <span className="text-brand-primary bg-blue-50 border border-brand-primary/20 px-3 py-1 rounded-full font-bold">
                  RFID CHIP TIMED
                </span>
              </div>
            </div>

            {/* Men & Women 5K Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* 5K Men */}
              <div className="rounded-2xl border border-slate-200/80 bg-[#F8FAFC] p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <IoMaleOutline className="text-xl" />
                    <h4 className="font-display text-base sm:text-lg font-black uppercase text-slate-900 tracking-wider">
                      5KM MEN
                    </h4>
                  </div>
                  <span className="font-mono text-xs text-brand-primary font-bold">
                    PURSE: ₹27,000
                  </span>
                </div>

                <div className="space-y-2.5">
                  {standardPrizes.map((tier) => (
                    <div
                      key={tier.rank}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        tier.rank === 1
                          ? "bg-amber-50/80 border-amber-300/80 text-slate-900 shadow-xs"
                          : "bg-white border-slate-200/70 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-black ${
                            tier.rank === 1
                              ? "bg-amber-400 text-slate-950 shadow-xs"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {tier.rank}
                        </span>
                        <span className="font-display text-sm font-bold uppercase">
                          {tier.position}
                        </span>
                      </div>

                      <span
                        className={`font-display text-lg font-black tracking-tight ${
                          tier.rank === 1 ? "text-amber-700" : "text-slate-900"
                        }`}
                      >
                        {tier.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5K Women */}
              <div className="rounded-2xl border border-slate-200/80 bg-[#F8FAFC] p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
                  <div className="flex items-center gap-2 text-pink-600">
                    <IoFemaleOutline className="text-xl" />
                    <h4 className="font-display text-base sm:text-lg font-black uppercase text-slate-900 tracking-wider">
                      5KM WOMEN
                    </h4>
                  </div>
                  <span className="font-mono text-xs text-brand-primary font-bold">
                    PURSE: ₹27,000
                  </span>
                </div>

                <div className="space-y-2.5">
                  {standardPrizes.map((tier) => (
                    <div
                      key={tier.rank}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        tier.rank === 1
                          ? "bg-amber-50/80 border-amber-300/80 text-slate-900 shadow-xs"
                          : "bg-white border-slate-200/70 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-black ${
                            tier.rank === 1
                              ? "bg-amber-400 text-slate-950 shadow-xs"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {tier.rank}
                        </span>
                        <span className="font-display text-sm font-bold uppercase">
                          {tier.position}
                        </span>
                      </div>

                      <span
                        className={`font-display text-lg font-black tracking-tight ${
                          tier.rank === 1 ? "text-amber-700" : "text-slate-900"
                        }`}
                      >
                        {tier.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. FINISHER RECOGNITION (MEDAL + CERTIFICATE)             */}
        {/* ========================================================= */}
        <div className="mb-14 sm:mb-18">
          <div className="border-b border-slate-200 pb-4 mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
              FINISHER RECOGNITION
            </h2>
            <p className="font-mono text-xs text-slate-500 mt-1">
              All 5KM &amp; 10KM finishers receive a Medal and Certificate upon completing the race.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medal Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 text-xl mb-4">
                  <FaMedal />
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-slate-900 mb-2">
                  Official Finisher Medal
                </h3>
                <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Every 5KM and 10KM participant who successfully completes the race receives a medal. The medal is awarded to all qualifying finishers, not only cash prize winners.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 font-mono text-xs text-slate-700 font-semibold">
                <FaCheckCircle className="text-emerald-500 text-xs" />
                <span>Awarded to all 5KM &amp; 10KM Finishers</span>
              </div>
            </div>

            {/* Certificate Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-brand-primary text-xl mb-4">
                  <FaFileAlt />
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-slate-900 mb-2">
                  Official Timing Certificate
                </h3>
                <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Every 5KM and 10KM participant who successfully completes the race receives a certificate with their official verified RFID chip finish time.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 font-mono text-xs text-slate-700 font-semibold">
                <FaCheckCircle className="text-emerald-500 text-xs" />
                <span>Downloadable for all 5KM &amp; 10KM Finishers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="rounded-[24px] border border-brand-primary/25 bg-gradient-to-r from-blue-50 via-white to-blue-50 p-8 sm:p-12 text-center flex flex-col items-center gap-4 shadow-sm">
          <span className="font-mono text-xs tracking-[0.3em] text-brand-primary font-bold uppercase">
            FEEL THE BEAT RUN 2026 &bull; VELLORE
          </span>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase text-slate-900 tracking-tight max-w-2xl">
            REGISTER FOR THE RUN
          </h2>

          <p className="max-w-xl font-sans text-xs sm:text-sm text-slate-600">
            Registrations are open for 10KM, 5KM, and 2KM categories. Secure your spot now to run for your heart, earn your official Finisher Medal &amp; Certificate (5K &amp; 10K), and compete for the Grand Prize Pool.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
            <Link
              href="/register"
              className="bg-brand-primary hover:bg-brand-primary-hover text-white font-display text-xs sm:text-sm font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-[0_8px_20px_rgba(30,144,255,0.25)] transition-all duration-300 active:scale-95 flex items-center gap-2"
            >
              <span>REGISTER FOR THE MARATHON</span>
              <FaArrowRight />
            </Link>

            <Link
              href="/"
              className="bg-white hover:bg-slate-50 text-slate-800 font-display text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-4 rounded-xl border border-slate-200 shadow-xs transition-all duration-300"
            >
              BACK TO HOME
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
