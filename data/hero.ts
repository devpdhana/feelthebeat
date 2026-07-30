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
  videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-runners-in-a-marathon-on-a-sunny-day-34351-large.mp4",
  fallbackImageUrl: "https://images.unsplash.com/photo-1502904585520-fac43722a578?q=80&w=1920&auto=format&fit=crop",
  telemetry: [
    { label: "DATE", value: "27.09.2026" },
    { label: "LOCATION", value: "VELLORE, TAMIL NADU" },
    { label: "ORGANIZER", value: "Sree Jayam School" },
    { label: "REGISTRATION", value: "OPEN / REGISTER NOW" },
  ],
};
