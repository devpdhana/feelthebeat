export interface RaceFee {
  id: string;
  name: string;
  distance: string;
  fee: number;
  reportingTime: string;
  startTime: string;
  cutoffTime?: string;
  isTimed: boolean;
  timingType: "TIMED" | "NON-TIMED";
  ageEligibility: string;
  minAge: number;
  maxAge?: number;
}

export const racePrices: Record<string, RaceFee> = {
  "2km-kids": {
    id: "2km-kids",
    name: "2 KM Kids Fun Run",
    distance: "2 KM",
    fee: 199,
    reportingTime: "5:00 AM",
    startTime: "6:30 AM",
    isTimed: false,
    timingType: "NON-TIMED",
    ageEligibility: "8–16 Years",
    minAge: 8,
    maxAge: 16,
  },
  "2km": {
    id: "2km",
    name: "2 KM Adults Fun Run",
    distance: "2 KM",
    fee: 199,
    reportingTime: "5:00 AM",
    startTime: "6:30 AM",
    isTimed: false,
    timingType: "NON-TIMED",
    ageEligibility: "18+ Years",
    minAge: 18,
  },
  "5km": {
    id: "5km",
    name: "5 KM Run",
    distance: "5 KM",
    fee: 299,
    reportingTime: "5:00 AM",
    startTime: "6:00 AM",
    cutoffTime: "7:00 AM",
    isTimed: true,
    timingType: "TIMED",
    ageEligibility: "12+ Years",
    minAge: 12,
  },
  "10km": {
    id: "10km",
    name: "10 KM Run",
    distance: "10 KM",
    fee: 399,
    reportingTime: "5:00 AM",
    startTime: "5:30 AM",
    cutoffTime: "7:00 AM",
    isTimed: true,
    timingType: "TIMED",
    ageEligibility: "14+ Years",
    minAge: 14,
  },
};
