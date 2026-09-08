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
    label: "WINNER",
    tag: "1ST PLACE",
  },
  {
    position: "2nd Prize",
    rank: 2,
    amount: "₹7,000",
    rawAmount: 7000,
    label: "RUNNER-UP",
    tag: "2ND PLACE",
  },
  {
    position: "3rd Prize",
    rank: 3,
    amount: "₹5,000",
    rawAmount: 5000,
    label: "2ND RUNNER-UP",
    tag: "3RD PLACE",
  },
  {
    position: "4th Prize",
    rank: 4,
    amount: "₹3,000",
    rawAmount: 3000,
    label: "4TH PLACE",
  },
  {
    position: "5th Prize",
    rank: 5,
    amount: "₹2,000",
    rawAmount: 2000,
    label: "5TH PLACE",
  },
];

export const prizeDistributionData: DistancePrizeData[] = [
  {
    id: "10km-prizes",
    distance: "10 KM",
    title: "10 KM TIMED RUN",
    description:
      "Competitive 10K category cash prizes awarded separately for Men and Women top 5 finishers with official RFID chip timing.",
    totalPurse: "₹54,000",
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
    totalPurse: "₹54,000",
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
  badge: "FINISHER MEDAL",
  title: "Earn Your Finisher Medal",
  description:
    "Every participant who successfully completes the 5KM or 10KM run will receive the official FEEL THE BEAT RUN 2026 Finisher Medal.",
  qualifyingDistances: ["5 KM", "10 KM"],
  ruleNote:
    "There is one standard official Finisher Medal design. The same medal is awarded to every 5KM and 10KM finisher.",
};

export const prizeSummary = {
  totalPrizePool: "₹1,08,000+",
  qualifyingDistances: ["10 KM", "5 KM"],
  nonCashDistancesNotice:
    "Prize money distribution is exclusively applicable to the timed 10KM and 5KM categories. Every participant who completes the 5KM or 10KM run receives the official Finisher Medal & Certificate.",
};
