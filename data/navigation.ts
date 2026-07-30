export interface NavLink {
  label: string;
  href: string;
  isMega?: boolean;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "#hero" },
  { label: "Highlights", href: "#highlights" },
  { label: "About", href: "#about" },
  { label: "Categories", href: "#categories" },
  { label: "Route Map", href: "#route" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "Gallery", href: "#gallery" },
  { label: "FAQs", href: "#faq" },
];

export const registrationConfig = {
  registerUrl: "https://www.feelthebeatrun2026.com/register",
  learnMoreUrl: "#about",
  ctaText: "REGISTER NOW",
};
