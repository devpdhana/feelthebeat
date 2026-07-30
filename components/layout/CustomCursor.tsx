"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only initialize on desktop/fine-pointer devices
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    const scaleContainer = scaleRef.current;
    const heartElement = heartRef.current;
    if (!cursor || !scaleContainer || !heartElement) return;

    // Track coordinates with smooth hardware-accelerated GSAP quickTo interpolation
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.12, ease: "power2.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.12, ease: "power2.out" });

    // Enable custom cursor styles on the body (hides default browser cursor)
    document.body.classList.add("custom-cursor-active");

    const onMouseMove = (e: MouseEvent) => {
      // Offset by half of cursor size (28px / 2 = 14px) to align center with pointer tip
      xTo(e.clientX - 14);
      yTo(e.clientY - 14);
    };

    window.addEventListener("mousemove", onMouseMove);

    // Physiological Double-Beat (Lub-Dub) heartbeat animation
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let heartbeatTl: gsap.core.Timeline | null = null;

    if (!prefersReducedMotion) {
      heartbeatTl = gsap.timeline({ repeat: -1 })
        // First Lub beat
        .to(heartElement, {
          scale: 1.15,
          filter: "drop-shadow(0 0 12px rgba(6, 152, 243, 0.35))",
          duration: 0.18,
          ease: "power2.out"
        })
        .to(heartElement, {
          scale: 1.0,
          filter: "drop-shadow(0 0 6px rgba(6, 152, 243, 0.35))",
          duration: 0.15,
          ease: "power2.in"
        })
        // Second Dub beat
        .to(heartElement, {
          scale: 1.08,
          filter: "drop-shadow(0 0 10px rgba(6, 152, 243, 0.35))",
          duration: 0.15,
          ease: "power2.out"
        })
        .to(heartElement, {
          scale: 1.0,
          filter: "drop-shadow(0 0 6px rgba(6, 152, 243, 0.35))",
          duration: 0.47,
          ease: "power2.inOut"
        });
    }

    // Click Animations
    let isHovering = false;

    const onMouseDown = () => {
      gsap.to(scaleContainer, {
        scale: 1.4,
        opacity: 1,
        duration: 0.1,
        ease: "power2.out"
      });
    };

    const onMouseUp = () => {
      gsap.to(scaleContainer, {
        scale: isHovering ? 1.3 : 1.0,
        opacity: isHovering ? 0.95 : 0.7,
        duration: 0.16,
        ease: "power2.out"
      });
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    // Interactive Hover Listeners
    const onMouseEnterLink = () => {
      isHovering = true;
      gsap.to(scaleContainer, {
        scale: 1.3,
        opacity: 0.95,
        duration: 0.25,
        ease: "power2.out"
      });
      gsap.to(heartElement, {
        filter: "drop-shadow(0 0 16px #F8FC06)",
        duration: 0.25
      });
    };

    const onMouseLeaveLink = () => {
      isHovering = false;
      gsap.to(scaleContainer, {
        scale: 1.0,
        opacity: 0.7,
        duration: 0.25,
        ease: "power2.out"
      });
      gsap.to(heartElement, {
        filter: "drop-shadow(0 0 6px rgba(6, 152, 243, 0.35))",
        duration: 0.25
      });
    };

    // Register listeners on buttons, links, cards, navigation, tabs
    const registerHoverListeners = () => {
      const clickables = document.querySelectorAll(
        "a, button, input, textarea, select, [role='button'], .clickable, .card, [onClick]"
      );
      clickables.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterLink);
        el.removeEventListener("mouseleave", onMouseLeaveLink);
        el.addEventListener("mouseenter", onMouseEnterLink);
        el.addEventListener("mouseleave", onMouseLeaveLink);
      });
    };

    registerHoverListeners();

    // DOM Observer to re-register on page updates
    const observer = new MutationObserver(() => {
      registerHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.classList.remove("custom-cursor-active");
      observer.disconnect();
      if (heartbeatTl) heartbeatTl.kill();
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden lg:block"
        style={{
          transform: "translate3d(-100px, -100px, 0)",
          width: "28px",
          height: "28px",
          willChange: "transform"
        }}
      >
        <div
          ref={scaleRef}
          className="w-full h-full"
          style={{ transform: "scale(1)", opacity: 0.7, willChange: "transform, opacity" }}
        >
          <div
            ref={heartRef}
            className="w-full h-full"
            style={{ filter: "drop-shadow(0 0 6px rgba(6, 152, 243, 0.35))", willChange: "transform, filter" }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-full h-full text-brand-primary fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
