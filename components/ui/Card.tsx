import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  dark?: boolean;
}

export default function Card({ children, className = "", hoverEffect = true, dark = false }: CardProps) {
  return (
    <div
      className={`relative rounded-[20px] p-6 transition-all duration-500 overflow-hidden ${
        dark
          ? "border border-white/8 bg-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
          : "border border-[#DCEBFF] bg-white shadow-[0_12px_30px_rgba(81,132,238,0.08)]"
      } ${
        hoverEffect
          ? dark
            ? "hover:border-[#5184EE] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(81,132,238,0.16)] glow-border"
            : "hover:border-[#5184EE] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(81,132,238,0.16)] glow-border"
          : ""
      } ${className}`}
    >
      {/* HUD Telemetry styling marks */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-brand-primary/20" />
      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-brand-primary/20" />
      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-brand-primary/20" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-brand-primary/20" />

      {children}
    </div>
  );
}
