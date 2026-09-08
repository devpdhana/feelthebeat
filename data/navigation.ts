export interface NavLink {
  label: string;
  href: string;
  isMega?: boolean;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Categories", href: "/#categories" },
  { label: "Prize Money", href: "/#prizes" },
  { label: "Route Map", href: "/#route-map" },
  { label: "Sponsors", href: "/#sponsors" },
  { label: "Gallery", href: "/#gallery" },
];

export const registrationConfig = {
  registerUrl: "/register",
  learnMoreUrl: "#about",
  ctaText: "REGISTER NOW",
};
