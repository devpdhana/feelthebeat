export interface RaceCategory {
  id: string;
  name: string;
  distance: string;
  ageLimit?: string;
  eligibility?: string;
  cutoffTime: string;
  startTime: string;
  description: string;
  elevationGain?: string;
  registeredCount?: number;
  gradientFrom: string;
  gradientTo: string;
  routeHighlights: string[];
}

export const raceCategories: RaceCategory[] = [
  {
    id: "2km",
    name: "2 KM Fun Run",
    distance: "2 KM",
    description:
      "Perfect for children, beginners, and families participating in Feel The Beat Run 2026.",
    startTime: "6:30 AM",
    cutoffTime: "7:30 AM",
    ageLimit: "8 – 17 Years",
    eligibility: "Adults Only",
    gradientFrom: "from-cyan-400",
    gradientTo: "to-blue-500",
    routeHighlights: [
      "Deboer Ground",
      "Sree Jayam School",
      "Deboer Ground",
    ],
  },
  {
    id: "2km-kids",
    name: "2 KM Kids Run",
    distance: "2 KM",
    description:
      "Designed exclusively for children to encourage healthy habits, active lifestyles, and participation in World Heart Day. A safe and enjoyable run for young participants.",
    startTime: "6:30 AM",
    cutoffTime: "7:30 AM",
    ageLimit: "8 – 17 Years",
    eligibility: "Kids Only",
    gradientFrom: "from-cyan-400",
    gradientTo: "to-blue-500",
    routeHighlights: [
      "Deboer Ground",
      "Sree Jayam School",
      "Deboer Ground",
    ],
  },
  {
    id: "5km",
    name: "5 KM Run",
    distance: "5 KM",
    description:
      "Ideal for fitness enthusiasts and casual runners.",
    startTime: "6:30 AM",
    cutoffTime: "8:00 AM",
    ageLimit: "14+ Years",
    gradientFrom: "from-green-400",
    gradientTo: "to-emerald-500",
    routeHighlights: [
      "Deboer Ground",
      "Bagayam",
      "CHAD Hospital",
      "Deboer Ground",
    ],
  },
  {
    id: "10km",
    name: "10 KM Run",
    distance: "10 KM",
    description:
      "Designed for experienced runners looking for a greater challenge.",
    startTime: "6:30 AM",
    cutoffTime: "9:00 AM",
    ageLimit: "16+ Years",
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
  },
];

export const statistics = [
  { label: "PARTICIPANTS", value: 5000, suffix: "+" },
  { label: "RACE CATEGORIES", value: 4, suffix: "" },
  { label: "EVENT DATE", value: 27, suffix: " SEP" },
  { label: "START TIME", value: 6, suffix: ":30 AM" },
];
