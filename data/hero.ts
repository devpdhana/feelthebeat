export interface HeroConfig {
  title: string;
  subtitle: string;
  videoUrl: string;
  fallbackImageUrl: string;
  telemetry: {
    label: string;
    value: string;
  }[];
}

export const heroData: HeroConfig = {
  title: "FEEL THE BEAT",
  subtitle: "RUN FOR YOUR HEART • SUNDAY, SEPTEMBER 27, 2026 • WORLD HEART DAY",
  videoUrl: "",
  fallbackImageUrl: "/images/hero/hero.png",
  telemetry: [
    { label: "DATE", value: "27.09.2026" },
    { label: "LOCATION", value: "VELLORE, TAMIL NADU" },
    { label: "ORGANIZER", value: "Sree Jayam School" },
    { label: "REGISTRATION", value: "OPEN / REGISTER NOW" },
  ],
};
