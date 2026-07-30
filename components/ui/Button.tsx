import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-display text-xs font-black uppercase tracking-widest transition-all duration-300 py-3 px-6 overflow-hidden active:scale-95 rounded-lg";

  const variantStyles = {
    primary:
      "bg-brand-primary text-white hover:bg-brand-primary-hover border border-brand-primary hover:border-brand-primary-hover shadow-md font-semibold",
    secondary:
      "bg-brand-secondary text-brand-text hover:bg-brand-secondary-hover border border-brand-secondary hover:border-brand-secondary-hover shadow-md font-semibold",
    outline:
      "bg-transparent text-brand-text border border-brand-primary/20 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5",
  };

  const content = (
    <>
      {/* HUD corner notches (decorations for premium industrial feel) */}
      <span className="absolute top-0 left-0 w-1 h-[1px] bg-current opacity-20" />
      <span className="absolute top-0 left-0 w-[1px] h-1 bg-current opacity-20" />
      <span className="absolute bottom-0 right-0 w-1 h-[1px] bg-current opacity-20" />
      <span className="absolute bottom-0 right-0 w-[1px] h-1 bg-current opacity-20" />
      
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} onClick={onClick} className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      }`}
    >
      {content}
    </button>
  );
}
