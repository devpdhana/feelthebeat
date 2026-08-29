"use client";

import { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react";
import { useLenis } from "lenis/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HiX } from "react-icons/hi";
import Button from "@/components/ui/Button";

interface RegistrationContextType {
  isFormOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
  eventOverviewRef: React.RefObject<HTMLDivElement | null>;
  scrollToOverview: () => void;
  shouldHighlight: boolean;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error("useRegistration must be used within a RegistrationProvider");
  }
  return context;
}

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [shouldHighlight, setShouldHighlight] = useState(false);
  const eventOverviewRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  // Handle incoming redirect scrolls via hash values
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hashToIdMap: Record<string, string> = {
        "#hero": "hero",
        "#highlights": "event-highlights",
        "#about": "about",
        "#categories": "categories",
        "#route-map": "route",
        "#sponsors": "sponsors",
        "#gallery": "gallery",
        "#faqs": "faq",
      };

      const scrollTrigger = () => {
        const hash = window.location.hash;
        const targetId = hashToIdMap[hash];
        if (!targetId) return;

        const target = document.getElementById(targetId);
        if (target) {
          if (lenis) {
            lenis.scrollTo(target, {
              offset: -95,
              duration: 1.0,
              easing: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2)),
            });
          } else {
            const targetTop = target.getBoundingClientRect().top + window.scrollY - 95;
            window.scrollTo({
              top: targetTop,
              behavior: "smooth",
            });
          }

          if (targetId === "event-highlights") {
            setShouldHighlight(true);
            setTimeout(() => setShouldHighlight(false), 1600);
          }
        }
      };

      // Slight timeout for layout mount stability
      const timer = setTimeout(scrollTrigger, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname, lenis]);

  const openForm = () => {
    setIsFormOpen(true);
    if (lenis) lenis.stop();
    document.body.style.overflow = "hidden";
  };

  const closeForm = () => {
    setIsFormOpen(false);
    if (lenis) lenis.start();
    document.body.style.overflow = "";
  };

  const scrollToOverview = () => {
    if (pathname !== "/") {
      router.push("/#event-highlights");
      return;
    }

    if (!eventOverviewRef.current) return;
    const targetElement = eventOverviewRef.current;

    if (lenis) {
      lenis.scrollTo(targetElement, {
        offset: -95, // Offset to fully reveal heading below sticky navbar
        duration: 1.0, // 1000ms duration
        easing: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2)), // easeInOutCubic
      });
    } else {
      const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - 95;
      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    }

    // Trigger brief highlighting overlay on highlights section
    setShouldHighlight(true);
    setTimeout(() => {
      setShouldHighlight(false);
    }, 1600);
  };

  return (
    <RegistrationContext.Provider
      value={{
        isFormOpen,
        openForm,
        closeForm,
        eventOverviewRef,
        scrollToOverview,
        shouldHighlight,
      }}
    >
      {children}
      <RegistrationFormModal isOpen={isFormOpen} onClose={closeForm} />
    </RegistrationContext.Provider>
  );
}

function RegistrationFormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "5k-run",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Success! ${formData.name} is registered for the ${formData.category.toUpperCase()}.`);
    onClose();
    setFormData({ name: "", email: "", phone: "", category: "5k-run" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative max-w-md w-full bg-[#0c0c0c] border border-white/10 p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HUD corners decorations */}
            <span className="absolute top-0 left-0 w-2 h-[2px] bg-brand-primary" />
            <span className="absolute top-0 left-0 w-[2px] h-2 bg-brand-primary" />
            <span className="absolute bottom-0 right-0 w-2 h-[2px] bg-brand-primary" />
            <span className="absolute bottom-0 right-0 w-[2px] h-2 bg-brand-primary" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex items-center gap-1 font-mono text-[9px] text-white/40 hover:text-white uppercase tracking-widest"
            >
              CLOSE <HiX className="text-sm" />
            </button>

            {/* Header */}
            <div className="mb-6 flex flex-col gap-1 border-b border-white/5 pb-4">
              <span className="font-mono text-[8px] text-brand-primary tracking-[0.2em] uppercase">
                SYSTEM_REGISTRY_PORTAL_FTB_2026
              </span>
              <h3 className="font-display text-xl font-black uppercase text-white tracking-tight">
                RACE REGISTRATION FORM
              </h3>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 font-mono">
                <label className="text-[9px] text-white/30 tracking-widest uppercase">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ENTER FULL NAME"
                  className="w-full bg-[#101010] border border-white/8 px-4 py-2.5 text-xs text-white placeholder-white/20 focus:border-brand-primary focus:outline-none transition-colors uppercase"
                />
              </div>

              <div className="flex flex-col gap-1 font-mono">
                <label className="text-[9px] text-white/30 tracking-widest uppercase">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ENTER EMAIL ADDRESS"
                  className="w-full bg-[#101010] border border-white/8 px-4 py-2.5 text-xs text-white placeholder-white/20 focus:border-brand-primary focus:outline-none transition-colors uppercase"
                />
              </div>

              <div className="flex flex-col gap-1 font-mono">
                <label className="text-[9px] text-white/30 tracking-widest uppercase">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="ENTER MOBILE NUMBER"
                  className="w-full bg-[#101010] border border-white/8 px-4 py-2.5 text-xs text-white placeholder-white/20 focus:border-brand-primary focus:outline-none transition-colors uppercase"
                />
              </div>

              <div className="flex flex-col gap-1 font-mono">
                <label className="text-[9px] text-white/30 tracking-widest uppercase">
                  RACE CATEGORY
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#101010] border border-white/8 px-4 py-2.5 text-xs text-white focus:border-brand-primary focus:outline-none transition-colors uppercase appearance-none cursor-pointer"
                >
                  <option value="2km-kids">2 KM KIDS FUN RUN — ₹199 (NON-TIMED | START: 6:30 AM | 8–16 YRS)</option>
                  <option value="2km">2 KM ADULTS FUN RUN — ₹199 (NON-TIMED | START: 6:30 AM | 18+ YRS)</option>
                  <option value="5km">5 KM RUN — ₹299 (TIMED | START: 6:00 AM | CUT-OFF: 7:00 AM | 12+ YRS)</option>
                  <option value="10km">10 KM RUN — ₹399 (TIMED | START: 5:30 AM | CUT-OFF: 7:00 AM | 14+ YRS)</option>
                </select>
              </div>

              {/* Submit CTA */}
              <Button type="submit" variant="primary" className="w-full py-3.5 mt-4 text-xs font-black">
                CONFIRM REGISTRATION
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
