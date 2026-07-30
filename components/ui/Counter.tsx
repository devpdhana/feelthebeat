"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface CounterProps {
  end: number;
  suffix?: string;
  duration?: number;
}

export default function Counter({ end, suffix = "", duration = 1.5 }: CounterProps) {
  const [count, setCount] = useState(0);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const element = triggerRef.current;
    if (!element) return;

    const counterObj = { value: 0 };

    const tl = gsap.to(counterObj, {
      value: end,
      duration: duration,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 95%",
        toggleActions: "play none none none",
      },
      onUpdate: () => {
        setCount(Math.floor(counterObj.value));
      },
    });

    return () => {
      tl.kill();
    };
  }, [end, duration]);

  return (
    <span ref={triggerRef} className="font-mono tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
