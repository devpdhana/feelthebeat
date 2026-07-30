"use client";

import { ReactLenis } from "lenis/react";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Refresh ScrollTrigger on Lenis scroll if necessary
    const handleScroll = () => {
      ScrollTrigger.update();
    };

    // Force ScrollTrigger refresh on mount
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.killAll();
    };
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, syncTouch: true }}>
      {children}
    </ReactLenis>
  );
}
