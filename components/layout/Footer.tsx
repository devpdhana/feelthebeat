"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks, registrationConfig } from "@/data/navigation";
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from "react-icons/fa";

export default function Footer() {
  const pathname = usePathname();
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Subscribed to timing updates!");
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="relative bg-[#181818] border-t border-white/10 pt-16 pb-8 overflow-hidden">
      {/* Decorative background grid elements */}
      <div className="absolute inset-0 telemetry-grid opacity-[0.02] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          {/* Company branding & tagline */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex flex-col tracking-tighter">
              <span className="font-display text-xl font-black tracking-widest text-white">
                FEEL THE <span className="text-brand-primary">BEAT</span>
              </span>
              <span className="font-mono text-[9px] tracking-widest text-white/60 mt-1">
                27 SEPTEMBER 2026 • VELLORE
              </span>
            </Link>
            <p className="text-xs text-white/80 leading-relaxed">
              Vellore's premier running event to promote healthy hearts and fitness. Held on World Heart Day, encouraging people of all ages to run together and support cardiovascular health.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3.5 mt-2">
              {[
                { icon: <FaInstagram />, href: "https://instagram.com" },
                { icon: <FaTwitter />, href: "https://twitter.com" },
                { icon: <FaFacebookF />, href: "https://facebook.com" },
                { icon: <FaYoutube />, href: "https://youtube.com" },
              ].map((soc, idx) => (
                <a
                  key={idx}
                  href={soc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#222] text-white/85 hover:border-[#1E90FF] hover:text-[#1E90FF] hover:bg-[#1E90FF]/5 transition-all text-sm shadow-sm"
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-white border-l-2 border-brand-primary pl-2.5 mb-5 font-semibold">
              QUICK SECTIONS
            </h4>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-mono text-[11px] text-white/85 hover:text-[#1E90FF] hover:pl-1 transition-all"
                  >
                    {link.label.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Race information */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-white border-l-2 border-brand-primary pl-2.5 mb-5 font-semibold">
              RACE DIRECTIVE
            </h4>
            <ul className="space-y-3 font-mono text-[11px] text-white/80">
              <li className="flex flex-col gap-0.5">
                <span className="text-white/40 text-[9px] uppercase"> VENUE</span>
                <span className="text-white/85 font-semibold">Deboer Ground Vellore, Tamil Nadu</span>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="text-white/40 text-[9px] uppercase"> OCCASION</span>
                <span className="text-white/85 font-semibold">World Heart Day • Run for Your Heart</span>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="text-white/40 text-[9px] uppercase"> INQUIRIES</span>
                <span className="text-white/85 font-semibold">Tech@sreejayamschool.edu.in</span>
              </li>
            </ul>
          </div>

          {/* Newsletter signup */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-white border-l-2 border-brand-primary pl-2.5 mb-1 font-semibold">
              TELEMETRY UPDATES
            </h4>
            <p className="text-xs text-white/80 leading-relaxed">
              Subscribe to receive timing notifications, BIB distribution details and announcements.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                suppressHydrationWarning
                type="email"
                placeholder="ENTER EMAIL ADDRESS"
                required
                className="w-full bg-[#222] border border-white/10 px-4 py-2.5 font-mono text-[10px] uppercase text-white placeholder-white/30 focus:border-[#1E90FF] focus:outline-none transition-colors rounded"
              />
              <button
                suppressHydrationWarning
                type="submit"
                className="w-full bg-brand-primary py-2.5 font-display text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-primary-hover transition-colors rounded shadow"
              >
                SUBSCRIBE TO FEED
              </button>
            </form>
          </div>
        </div>

        {/* Dynamic footer HUD metrics */}
        <div className="mt-16 pt-8 border-t border-white/12 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[9px] text-white/55">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">

          </div>
          <div className="text-center sm:text-right">
            © Design and Developed by Man2web.
          </div>
        </div>
      </div>
    </footer>
  );
}
