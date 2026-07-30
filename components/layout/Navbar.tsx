"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRegistration } from "@/components/layout/RegistrationContext";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { IoChevronDown } from "react-icons/io5";
import { navLinks } from "@/data/navigation";
import { raceCategories } from "@/data/events";
import { registrationConfig } from "@/data/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollToOverview } = useRegistration();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/") {
      scrollToOverview();
    } else {
      router.push("/#event-highlights");
    }
  };

  useEffect(() => {
    if (!pathname) return;
  }, [pathname]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 border-b ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-brand-primary/12 py-3 shadow-sm"
            : "bg-white/80 border-transparent py-5"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <Link
              href="/"
              className="group flex flex-col tracking-tighter"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="font-display text-lg font-black tracking-[0.12em] text-brand-text group-hover:text-brand-primary transition-colors">
                FEEL THE <span className="text-brand-primary">BEAT</span>
              </span>
              <span className="font-mono text-[9px] tracking-[0.2em] text-brand-muted group-hover:text-brand-text transition-colors">
                Sree Jayam School
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                if (link.label === "Categories") {
                  return (
                    <div
                      key={link.label}
                      className="relative"
                      onMouseEnter={() => setMegaMenuOpen(true)}
                      onMouseLeave={() => setMegaMenuOpen(false)}
                    >
                      <button
                        suppressHydrationWarning
                        className="group flex items-center gap-1 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wider text-brand-text hover:text-brand-primary transition-colors"
                      >
                        {link.label}
                        <IoChevronDown
                          className={`text-xs transition-transform duration-300 ${
                            megaMenuOpen ? "rotate-180 text-brand-primary" : ""
                          }`}
                        />
                      </button>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="relative group px-4 py-2 font-display text-xs font-semibold uppercase tracking-wider text-brand-text hover:text-brand-primary transition-colors"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-brand-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Call To Action */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={handleRegisterClick}
                className="group relative overflow-hidden bg-brand-primary px-6 py-2.5 font-display text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-brand-primary-hover cursor-pointer border border-brand-primary rounded"
              >
                <span className="relative z-10">{registrationConfig.ctaText}</span>
              </button>
            </div>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center rounded border border-brand-primary/10 bg-brand-primary/5 p-2 text-brand-text hover:bg-brand-primary/10 lg:hidden"
            >
              {mobileMenuOpen ? <HiX size={20} /> : <HiMenuAlt3 size={20} />}
            </button>
          </div>
        </div>

        {/* Mega Menu Dropdown (Desktop hover) */}
        <div
          onMouseEnter={() => setMegaMenuOpen(true)}
          onMouseLeave={() => setMegaMenuOpen(false)}
          className={`absolute left-0 w-full bg-white border-b border-brand-primary/12 transition-all duration-300 overflow-hidden z-40 ${
            megaMenuOpen ? "max-h-[360px] opacity-100 py-8 shadow-md" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="mx-auto max-w-7xl px-8 grid grid-cols-4 gap-6">
            {raceCategories.map((category) => (
              <Link
                key={category.id}
                href="#categories"
                onClick={() => setMegaMenuOpen(false)}
                className="group relative block border border-brand-primary/8 bg-brand-surface p-5 hover:border-brand-primary/40 hover:bg-[#F8FAFD] transition-all shadow-sm rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold uppercase tracking-wider text-brand-text group-hover:text-brand-primary transition-colors">
                    {category.name}
                  </span>
                  <span className="font-mono text-xs text-brand-primary group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
                <p className="text-[11px] text-brand-muted mt-2 line-clamp-2">
                  {category.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-brand-primary/8 pt-3 text-[10px] font-mono text-brand-muted">
                  <span>START: {category.startTime}</span>
                  <span>CUTOFF: {category.cutoffTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`w-4/5 max-w-md h-full bg-white border-l border-brand-primary/12 p-8 flex flex-col justify-between transition-transform duration-500 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Panel */}
          <div className="flex flex-col gap-8 mt-12">
            <div className="flex flex-col tracking-tighter">
              <span className="font-display text-lg font-black tracking-widest text-brand-text">
                FEEL THE <span className="text-brand-primary">BEAT</span>
              </span>
              <span className="font-mono text-[9px] tracking-widest text-brand-muted mt-1">
                RUN FOR YOUR HEART • VELLORE • 2026
              </span>
            </div>

            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display text-lg font-bold uppercase tracking-wider text-brand-text hover:text-brand-primary transition-colors flex items-center justify-between border-b border-brand-primary/8 pb-2"
                >
                  {link.label}
                  <span className="font-mono text-[10px] text-brand-muted">→</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Bottom Call To Action */}
          <div className="flex flex-col gap-4">
            <button
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleRegisterClick(e);
              }}
              className="w-full text-center bg-brand-primary py-3 font-display text-xs font-black uppercase tracking-widest text-white hover:bg-brand-primary-hover transition-colors cursor-pointer text-center block rounded"
            >
              {registrationConfig.ctaText}
            </button>
            <div className="text-center font-mono text-[9px] text-brand-muted">
              © 2026 NEB Sports. All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
