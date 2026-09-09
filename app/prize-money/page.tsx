import type { Metadata } from "next";
import Link from "next/link";
import {
  FaMedal,
  FaAward,
  FaFileAlt,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaHeartbeat,
  FaTshirt,
  FaFirstAid,
  FaIdCard,
  FaUtensils,
  FaAppleAlt,
  FaEnvelope,
  FaGlobe,
} from "react-icons/fa";
import { IoMaleOutline, IoFemaleOutline } from "react-icons/io5";
import { standardPrizes, prizeSummary } from "@/data/prizes";

export const metadata: Metadata = {
  title: "Prize Money & Medals | Feel The Beat Run 2026",
  description:
    "Official Prize Money breakdown and Finisher Recognition for Feel The Beat Run 2026 in Vellore. Cash prizes for Top 5 Men & Women in 10K & 5K (1st: 10K, 2nd: 7K, 3rd: 5K, 4th: 2K, 5th: 1K). Finisher Medal & Certificate for all 5K & 10K finishers.",
  alternates: {
    canonical: "/prize-money",
  },
  openGraph: {
    title: "Prize Money & Medals | Feel The Beat Run 2026",
    description:
      "Win up to ₹10,000 in 10K & 5K timed runs. Total cash purse ₹1,00,000 awarded across Top 5 Men and Women divisions. Finisher Medal & Certificate for all 5K & 10K finishers.",
    url: "/prize-money",
  },
};

export default function PrizeMoneyPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#FFFFFF] via-[#F5FAFF] to-[#EEF8FF] text-slate-900 selection:bg-brand-primary selection:text-white">
      {/* Soft abstract ambient background glows */}
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
          <span className="text-brand-primary font-bold">PRIZE MONEY &amp; MEDALS</span>
        </div>

        {/* Page Hero Header */}
        <div className="mb-10 sm:mb-14 text-center flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full shadow-sm">
            <FaAward className="text-amber-500 text-sm" />
            <span className="font-mono text-xs tracking-[0.25em] text-brand-primary font-bold uppercase">
              OFFICIAL CASH PURSE &bull; 2026 EDITION
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-slate-900 max-w-4xl">
            PRIZE MONEY &amp; MEDALS
          </h1>

          {/* Heart Health Slogan Ribbon */}
          <div className="w-full max-w-3xl mt-2 rounded-2xl border-2 border-brand-primary/30 bg-white/90 backdrop-blur-sm p-4 sm:p-5 shadow-sm flex items-center justify-center gap-3 sm:gap-4 text-center">
            <span className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-xl shrink-0">
              <FaHeartbeat className="animate-pulse" />
            </span>
            <p className="font-display font-bold text-base sm:text-lg md:text-xl text-slate-800 tracking-tight">
              &ldquo;Feel the beat, protect your heart. It&apos;s the rhythm of a healthy life&rdquo;
            </p>
          </div>

          {/* Reporting Time & Venue Strip */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-mono font-bold text-slate-700">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
              <FaClock className="text-amber-600" />
              <span>REPORTING TIME: <strong className="text-slate-900">5.00 AM</strong></span>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl">
              <FaMapMarkerAlt className="text-brand-primary" />
              <span>STARTING &amp; FINISHING AT: <strong className="text-slate-900 italic">DE BOER GROUND</strong></span>
            </div>
          </div>

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
        {/* 1. PRIZE MONEY TABLES (MEN & WOMEN - 10K & 5K)             */}
        {/* ========================================================= */}
        <div className="mb-14 sm:mb-18 space-y-8 sm:space-y-10">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
              CASH PRIZE BREAKDOWN (10K &amp; 5K)
            </h2>
            <p className="font-mono text-xs text-slate-500 mt-1">
              Official cash awards for the Top 5 Men and Top 5 Women in 10K &amp; 5K verified by official RFID chip timing.
            </p>
          </div>

          {/* Men & Women Side-by-Side Unified Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* MEN PRIZE CARD */}
            <div className="rounded-[24px] border-2 border-blue-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1 bg-brand-primary text-white font-display font-black text-base rounded-lg uppercase tracking-wider">
                    MEN
                  </span>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
                      10K &amp; 5K
                    </h3>
                    <span className="font-mono text-xs text-slate-500">
                      Top 5 Cash Prizes in Each Category
                    </span>
                  </div>
                </div>
                <IoMaleOutline className="text-3xl text-brand-primary" />
              </div>

              <div className="space-y-3">
                {standardPrizes.map((tier) => (
                  <div
                    key={tier.rank}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${tier.rank === 1
                        ? "bg-amber-50/90 border-amber-300 text-slate-900 shadow-xs"
                        : "bg-[#F8FAFC] border-slate-200/80 text-slate-800"
                      }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-black ${tier.rank === 1
                            ? "bg-amber-400 text-slate-950 shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700"
                          }`}
                      >
                        {tier.rank}
                      </span>
                      <div>
                        <span className="font-display text-sm sm:text-base font-black uppercase text-slate-900">
                          {tier.position}
                        </span>
                        {tier.rank === 1 && (
                          <span className="ml-2 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded">
                            WINNER
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-display text-xl sm:text-2xl font-black tracking-tight ${tier.rank === 1 ? "text-amber-700" : "text-slate-900"
                          }`}
                      >
                        {tier.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-500 font-medium">Purse Per Distance (Men):</span>
                <strong className="text-brand-primary font-bold">₹25,000</strong>
              </div>
            </div>

            {/* WOMEN PRIZE CARD */}
            <div className="rounded-[24px] border-2 border-pink-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1 bg-pink-600 text-white font-display font-black text-base rounded-lg uppercase tracking-wider">
                    WOMEN
                  </span>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
                      10K &amp; 5K
                    </h3>
                    <span className="font-mono text-xs text-slate-500">
                      Top 5 Cash Prizes in Each Category
                    </span>
                  </div>
                </div>
                <IoFemaleOutline className="text-3xl text-pink-600" />
              </div>

              <div className="space-y-3">
                {standardPrizes.map((tier) => (
                  <div
                    key={tier.rank}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${tier.rank === 1
                        ? "bg-amber-50/90 border-amber-300 text-slate-900 shadow-xs"
                        : "bg-[#F8FAFC] border-slate-200/80 text-slate-800"
                      }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-black ${tier.rank === 1
                            ? "bg-amber-400 text-slate-950 shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700"
                          }`}
                      >
                        {tier.rank}
                      </span>
                      <div>
                        <span className="font-display text-sm sm:text-base font-black uppercase text-slate-900">
                          {tier.position}
                        </span>
                        {tier.rank === 1 && (
                          <span className="ml-2 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded">
                            WINNER
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-display text-xl sm:text-2xl font-black tracking-tight ${tier.rank === 1 ? "text-amber-700" : "text-slate-900"
                          }`}
                      >
                        {tier.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-500 font-medium">Purse Per Distance (Women):</span>
                <strong className="text-pink-600 font-bold">₹25,000</strong>
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
              FINISHER RECOGNITION (5KM &amp; 10KM)
            </h2>
            <p className="font-mono text-xs text-slate-500 mt-1">
              Every participant who successfully completes the 5KM or 10KM distance receives an official Finisher Medal and Certificate.
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
                  Every participant who successfully finishes the <strong>5KM</strong> or <strong>10KM</strong> race receives the official Finisher Medal. This medal is awarded to <strong>ALL successful finishers</strong>, not only prize winners.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 font-mono text-xs text-slate-700 font-semibold">
                <FaCheckCircle className="text-emerald-500 text-xs shrink-0" />
                <span>Awarded to every successful 5KM &amp; 10KM finisher</span>
              </div>
            </div>

            {/* Certificate Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-brand-primary text-xl mb-4">
                  <FaFileAlt />
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-slate-900 mb-2">
                  Official Timing E-Certificate
                </h3>
                <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Every participant who successfully finishes the <strong>5KM</strong> or <strong>10KM</strong> race receives an official downloadable E-Certificate with their verified RFID chip timing.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 font-mono text-xs text-slate-700 font-semibold">
                <FaCheckCircle className="text-emerald-500 text-xs shrink-0" />
                <span>Available to every successful 5KM &amp; 10KM finisher</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. PARTICIPANT INCLUSIONS & PERKS (FROM POSTER)           */}
        {/* ========================================================= */}
        <div className="mb-14 sm:mb-18">
          <div className="border-b border-slate-200 pb-4 mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
              PARTICIPANT INCLUSIONS
            </h2>
            <p className="font-mono text-xs text-slate-500 mt-1">
              Everything included with your registration kit based on category.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* For 10K & 5K */}
            <div className="rounded-2xl border-2 border-brand-primary/30 bg-white p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  (FOR 10K &amp; 5K)
                </span>
                <span className="font-mono text-xs text-slate-500 font-semibold">Timed Categories</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <FaTshirt className="text-xl text-blue-600 mb-1.5" />
                  <span className="font-display text-xs font-bold uppercase text-slate-900">T-SHIRTS</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <FaMedal className="text-xl text-amber-600 mb-1.5" />
                  <span className="font-display text-xs font-bold uppercase text-amber-950">MEDALS</span>
                  <span className="text-[10px] font-mono text-amber-700">All Finishers</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <FaFileAlt className="text-xl text-brand-primary mb-1.5" />
                  <span className="font-display text-xs font-bold uppercase text-brand-primary">E-CERTIFICATE</span>
                  <span className="text-[10px] font-mono text-blue-600">All Finishers</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <FaAppleAlt className="text-xl text-emerald-600 mb-1.5" />
                  <span className="font-display text-xs font-bold uppercase text-slate-900">REFRESHMENTS</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <FaFirstAid className="text-xl text-red-600 mb-1.5" />
                  <span className="font-display text-xs font-bold uppercase text-slate-900">MEDICAL SUPPORT</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <FaIdCard className="text-xl text-purple-600 mb-1.5" />
                  <span className="font-display text-xs font-bold uppercase text-slate-900">BIB</span>
                  <span className="text-[10px] font-mono text-slate-500">RFID Timed</span>
                </div>
                <div className="col-span-2 sm:col-span-3 flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <FaUtensils className="text-base text-amber-600" />
                  <span className="font-display text-xs font-bold uppercase text-slate-900">BREAKFAST INCLUDED</span>
                </div>
              </div>
            </div>

            {/* For 2K */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  (FOR 2K)
                </span>
                <span className="font-mono text-xs text-slate-500 font-semibold">Fun &amp; Family Run</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <FaTshirt className="text-xl text-blue-600 mb-1.5" />
                  <span className="font-display text-xs font-bold uppercase text-slate-900">T-SHIRTS</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <FaAppleAlt className="text-xl text-emerald-600 mb-1.5" />
                  <span className="font-display text-xs font-bold uppercase text-slate-900">REFRESHMENTS</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <FaUtensils className="text-xl text-amber-600 mb-1.5" />
                  <span className="font-display text-xs font-bold uppercase text-slate-900">BREAKFAST</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <FaFirstAid className="text-xl text-red-600 mb-1.5" />
                  <span className="font-display text-xs font-bold uppercase text-slate-900">MEDICAL SUPPORT</span>
                </div>
                <div className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <FaIdCard className="text-base text-purple-600" />
                  <span className="font-display text-xs font-bold uppercase text-slate-900">OFFICIAL RUN BIB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. REGISTRATION PRICING & CALL TO ACTION                   */}
        {/* ========================================================= */}
        <div className="rounded-[24px] border-2 border-brand-primary/30 bg-gradient-to-br from-blue-50 via-white to-blue-50/80 p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-sm">
          <span className="font-mono text-xs tracking-[0.3em] text-brand-primary font-bold uppercase">
            REGISTRATION &bull; JOIN THE RUN!
          </span>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase text-slate-900 tracking-tight max-w-2xl">
            REGISTRATION FEES
          </h2>

          {/* Registration Price Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-xs flex flex-col items-center">
              <span className="px-3 py-0.5 bg-blue-100 text-brand-primary font-mono text-xs font-black rounded-full mb-2">
                10K
              </span>
              <span className="font-display text-3xl font-black text-slate-900">
                RS.399/-
              </span>
              <span className="font-mono text-[11px] text-slate-500 mt-1">Timed Run</span>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs flex flex-col items-center">
              <span className="px-3 py-0.5 bg-emerald-100 text-emerald-700 font-mono text-xs font-black rounded-full mb-2">
                5K
              </span>
              <span className="font-display text-3xl font-black text-slate-900">
                RS.299/-
              </span>
              <span className="font-mono text-[11px] text-slate-500 mt-1">Timed Run</span>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-xs flex flex-col items-center">
              <span className="px-3 py-0.5 bg-purple-100 text-purple-700 font-mono text-xs font-black rounded-full mb-2">
                2K
              </span>
              <span className="font-display text-3xl font-black text-slate-900">
                RS.199/-
              </span>
              <span className="font-mono text-[11px] text-slate-500 mt-1">Fun Run</span>
            </div>
          </div>

          <p className="max-w-xl font-sans text-xs sm:text-sm text-slate-600">
            Secure your spot now to protect your heart, earn your official Finisher Medal &amp; Certificate (5K &amp; 10K), and compete for the Grand Cash Prize Pool!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
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

          {/* Contact Details from Poster */}
          <div className="mt-4 pt-5 border-t border-blue-100 w-full max-w-xl flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-mono text-xs text-slate-600">
            <a
              href="mailto:sjs.marathon@sreejayamschool.edu.in"
              className="inline-flex items-center gap-1.5 hover:text-brand-primary transition-colors"
            >
              <FaEnvelope className="text-brand-primary" />
              <span>sjs.marathon@sreejayamschool.edu.in</span>
            </a>
            <span className="text-slate-300 hidden sm:inline">&bull;</span>
            <a
              href="https://marathon.sreejayamschool.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-brand-primary transition-colors"
            >
              <FaGlobe className="text-brand-primary" />
              <span>marathon.sreejayamschool.edu.in</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
