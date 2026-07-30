export interface RaceFee {
  id: string;
  name: string;
  distance: string;
  fee: number;
}

export const racePrices: Record<string, RaceFee> = {
  "2km": {
    id: "2km",
    name: "2 KM Fun Run",
    distance: "2 KM",
    fee: 150,
  },
  "2km-kids": {
    id: "2km-kids",
    name: "2 KM Kids Run",
    distance: "2 KM",
    fee: 150,
  },
  "5km": {
    id: "5km",
    name: "5 KM Run",
    distance: "5 KM",
    fee: 200,
  },
  "10km": {
    id: "10km",
    name: "10 KM Run",
    distance: "10 KM",
    fee: 250,
  },
};
