export interface NavLink {
  label: string;
  href: string;
  isMega?: boolean;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Highlights", href: "/#highlights" },
  { label: "About", href: "/#about" },
  { label: "Categories", href: "/#categories" },
  { label: "Route Map", href: "/#route-map" },
  { label: "Sponsors", href: "/#sponsors" },
  { label: "Gallery", href: "/#gallery" },
  { label: "FAQs", href: "/#faqs" },
];

export const registrationConfig = {
  registerUrl: "https://www.feelthebeatrun2026.com/register",
  learnMoreUrl: "#about",
  ctaText: "REGISTER NOW",
};
