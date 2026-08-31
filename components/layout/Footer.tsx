"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/navigation";
import { useLenis } from "lenis/react";
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from "react-icons/fa";

export default function Footer() {
  const pathname = usePathname();
  const lenis = useLenis();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleFooterNavClick = (e: React.MouseEvent, href: string) => {
    if (!href.startsWith("/") && !href.startsWith("#")) return;

    const hashIndex = href.indexOf("#");
    const hash = hashIndex !== -1 ? href.substring(hashIndex) : "";

    if (pathname === "/") {
      e.preventDefault();

      if (hash) {
        window.history.pushState(null, "", href);

        const hashToIdMap: Record<string, string> = {
          "#hero": "hero",
          "#highlights": "event-highlights",
          "#about": "about",
          "#categories": "categories",
          "#route-map": "route",
          "#route": "route",
          "#sponsors": "sponsors",
          "#gallery": "gallery",
          "#faqs": "faq",
          "#faq": "faq",
        };

        const targetId = hashToIdMap[hash] || hash.replace("#", "");
        const target = document.getElementById(targetId);
        if (target) {
          if (lenis) {
            lenis.scrollTo(target, {
              offset: -95,
              duration: 1.2,
              easing: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2)),
            });
          } else {
            const targetTop = target.getBoundingClientRect().top + window.scrollY - 95;
            window.scrollTo({
              top: targetTop,
              behavior: "smooth",
            });
          }
        }
      } else {
        window.history.pushState(null, "", "/");
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }
  };

  return (
    <footer className="relative bg-[#181818] border-t border-white/10 pt-16 pb-8 overflow-hidden">
      {/* Decorative background grid elements */}
      <div className="absolute inset-0 telemetry-grid opacity-[0.02] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:gap-12">
          {/* Column 1: Company branding & tagline */}
          <div className="flex flex-col gap-4">
            <Link href="/" onClick={(e) => handleFooterNavClick(e, "/")} className="flex flex-col tracking-tighter">
              <span className="font-display text-xl font-black tracking-widest text-white">
                FEEL THE <span className="text-brand-primary">BEAT</span>
              </span>
              <span className="font-mono text-[9px] tracking-widest text-white/60 mt-1">
                27 SEPTEMBER 2026 • VELLORE
              </span>
            </Link>
            <p className="text-xs text-white/80 leading-relaxed max-w-sm">
              Vellore&apos;s premier running event to promote healthy hearts and fitness. Held on World Heart Day, encouraging people of all ages to run together and support cardiovascular health.
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

          {/* Column 2: Quick links */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-white border-l-2 border-brand-primary pl-2.5 mb-5 font-semibold">
              QUICK SECTIONS
            </h4>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleFooterNavClick(e, link.href)}
                    className="font-mono text-[11px] text-white/85 hover:text-[#1E90FF] hover:pl-1 transition-all inline-block"
                  >
                    {link.label.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Race information */}
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
                <span className="text-white/85 font-semibold">marathon@sreejayamschool.edu.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dynamic footer HUD metrics */}
        <div className="mt-16 pt-8 border-t border-white/12 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[9px] text-white/55">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>SREE JAYAM SCHOOL</span>
            <span>•</span>
            <span>VRG CEMENT MARKETING</span>
            <span>•</span>
            <span>WORLD HEART DAY 2026</span>
          </div>
          <div className="text-center sm:text-right">
            © Design and Developed by Man2web.
          </div>
        </div>
      </div>
    </footer>
  );
}
