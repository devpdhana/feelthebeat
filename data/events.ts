export interface RaceCategory {
  id: string;
  name: string;
  distance: string;
  reportingTime: string;
  startTime: string;
  cutoffTime?: string;
  isTimed: boolean;
  timingType: "TIMED" | "NON-TIMED";
  ageLimit: string;
  eligibility: string;
  minAge: number;
  maxAge?: number;
  description: string;
  elevationGain?: string;
  registeredCount?: number;
  gradientFrom: string;
  gradientTo: string;
  routeHighlights: string[];
  fee: number;
}

export const raceCategories: RaceCategory[] = [
  {
    id: "2km-kids",
    name: "2 KM Kids Fun Run",
    distance: "2 KM",
    description:
      "Designed exclusively for children aged 8 to 16 to encourage healthy habits, active lifestyles, and participation in World Heart Day.",
    reportingTime: "5:00 AM",
    startTime: "6:30 AM",
    isTimed: false,
    timingType: "NON-TIMED",
    ageLimit: "8–16 Years",
    eligibility: "8–16 Years",
    minAge: 8,
    maxAge: 16,
    gradientFrom: "from-cyan-400",
    gradientTo: "to-blue-500",
    routeHighlights: [
      "Deboer Ground",
      "Sree Jayam School",
      "Deboer Ground",
    ],
    fee: 1,
  },
  {
    id: "2km",
    name: "2 KM Adults Fun Run",
    distance: "2 KM",
    description:
      "Perfect for beginners, fitness enthusiasts, and families participating in Feel The Beat Run 2026.",
    reportingTime: "5:00 AM",
    startTime: "6:30 AM",
    isTimed: false,
    timingType: "NON-TIMED",
    ageLimit: "18+ Years",
    eligibility: "18+ Years",
    minAge: 18,
    gradientFrom: "from-cyan-400",
    gradientTo: "to-blue-500",
    routeHighlights: [
      "Deboer Ground",
      "Sree Jayam School",
      "Deboer Ground",
    ],
    fee: 199,
  },
  {
    id: "5km",
    name: "5 KM Run",
    distance: "5 KM",
    description:
      "Ideal for fitness enthusiasts and casual runners looking for an energizing morning challenge.",
    reportingTime: "5:00 AM",
    startTime: "6:00 AM",
    cutoffTime: "7:00 AM",
    isTimed: true,
    timingType: "TIMED",
    ageLimit: "12+ Years",
    eligibility: "12+ Years",
    minAge: 12,
    gradientFrom: "from-green-400",
    gradientTo: "to-emerald-500",
    routeHighlights: [
      "Deboer Ground",
      "Bagayam",
      "CHAD Hospital",
      "Deboer Ground",
    ],
    fee: 299,
  },
  {
    id: "10km",
    name: "10 KM Run",
    distance: "10 KM",
    description:
      "Designed for experienced runners looking for a timed endurance run through Vellore.",
    reportingTime: "5:00 AM",
    startTime: "5:30 AM",
    cutoffTime: "7:00 AM",
    isTimed: true,
    timingType: "TIMED",
    ageLimit: "14+ Years",
    eligibility: "14+ Years",
    minAge: 14,
    gradientFrom: "from-red-400",
    gradientTo: "to-orange-500",
    routeHighlights: [
      "Deboer Ground",
      "Bagayam",
      "Otteri",
      "Sankarapalayam",
      "CMC Eye Hospital",
      "Raymond Shop",
      "Deboer Ground",
    ],
    fee: 399,
  },
];

export const statistics = [
  { label: "PARTICIPANTS", value: 5000, suffix: "+" },
  { label: "RACE CATEGORIES", value: 3, suffix: "" },
  { label: "EVENT DATE", value: 27, suffix: " SEP" },
  { label: "REPORTING TIME", value: 5, suffix: ":00 AM" },
];
