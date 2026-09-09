export interface PrizeTier {
  position: string;
  rank: number;
  amount: string;
  rawAmount: number;
  label: string;
  badgeColor?: string;
  tag?: string;
}

export interface GenderPrizeCategory {
  gender: "MEN" | "WOMEN";
  label: string;
  prizes: PrizeTier[];
}

export interface DistancePrizeData {
  id: string;
  distance: string;
  title: string;
  description: string;
  totalPurse: string;
  timingType: "TIMED RUN";
  categories: GenderPrizeCategory[];
}

export const standardPrizes: PrizeTier[] = [
  {
    position: "1st Prize",
    rank: 1,
    amount: "₹10,000",
    rawAmount: 10000,
    label: "1ST PRIZE (10K)",
    tag: "1ST PLACE",
  },
  {
    position: "2nd Prize",
    rank: 2,
    amount: "₹7,000",
    rawAmount: 7000,
    label: "2ND PRIZE (7K)",
    tag: "2ND PLACE",
  },
  {
    position: "3rd Prize",
    rank: 3,
    amount: "₹5,000",
    rawAmount: 5000,
    label: "3RD PRIZE (5K)",
    tag: "3RD PLACE",
  },
  {
    position: "4th Prize",
    rank: 4,
    amount: "₹2,000",
    rawAmount: 2000,
    label: "4TH PRIZE (2K)",
    tag: "4TH PLACE",
  },
  {
    position: "5th Prize",
    rank: 5,
    amount: "₹1,000",
    rawAmount: 1000,
    label: "5TH PRIZE (1K)",
    tag: "5TH PLACE",
  },
];

export const prizeDistributionData: DistancePrizeData[] = [
  {
    id: "10km-prizes",
    distance: "10 KM",
    title: "10 KM TIMED RUN",
    description:
      "Competitive 10K category cash prizes awarded separately for Men and Women top 5 finishers with official RFID chip timing.",
    totalPurse: "₹50,000",
    timingType: "TIMED RUN",
    categories: [
      {
        gender: "MEN",
        label: "10KM – MEN",
        prizes: standardPrizes,
      },
      {
        gender: "WOMEN",
        label: "10KM – WOMEN",
        prizes: standardPrizes,
      },
    ],
  },
  {
    id: "5km-prizes",
    distance: "5 KM",
    title: "5 KM TIMED RUN",
    description:
      "Competitive 5K category cash prizes awarded separately for Men and Women top 5 finishers with official RFID chip timing.",
    totalPurse: "₹50,000",
    timingType: "TIMED RUN",
    categories: [
      {
        gender: "MEN",
        label: "5KM – MEN",
        prizes: standardPrizes,
      },
      {
        gender: "WOMEN",
        label: "5KM – WOMEN",
        prizes: standardPrizes,
      },
    ],
  },
];

export const finisherMedalInfo = {
  badge: "FINISHER RECOGNITION",
  title: "Official Finisher Medal & Certificate",
  description:
    "Every participant who successfully completes the 5KM or 10KM run will receive the official Feel The Beat Run 2026 Finisher Medal and downloadable Timing Certificate.",
  qualifyingDistances: ["5 KM", "10 KM"],
  ruleNote:
    "Awarded to ALL successful finishers of 5KM and 10KM, not only prize winners.",
};

export const prizeSummary = {
  totalPrizePool: "₹1,00,000",
  qualifyingDistances: ["10 KM", "5 KM"],
  nonCashDistancesNotice:
    "Prize money distribution is exclusively applicable to the timed 10KM and 5KM categories. Every participant who completes the 5KM or 10KM run receives the official Finisher Medal & Certificate.",
};
