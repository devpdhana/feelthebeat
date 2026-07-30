export interface CheckpointNode {
  name: string;
  mileage: string;
  elevation: string;
  coordinates: { x: number; y: number };
}

export interface RouteCheckpointDisplay {
  label: string;
  location: string;
  nodeIndex: number;
}

export interface RouteData {
  id: string;
  distance: string;
  title: string;
  startPoint: string;
  finishPoint: string;
  description: string;
  estimatedDuration: string;
  elevationGain: string;
  waypointsSequence: string[];
  mapPath: string; // SVG path command string
  checkpoints: CheckpointNode[];
  checkpointsList: RouteCheckpointDisplay[];
}

export const routesData: RouteData[] = [
  {
    id: "2k-route",
    distance: "2 KM",
    title: "2 KM Family Route",
    startPoint: "Deboer Ground",
    finishPoint: "Deboer Ground",
    description: "The 2 KM family route begins at Deboer Ground, reaches Sree Jayam School, makes a U-turn, and finishes back at Deboer Ground.",
    estimatedDuration: "10-15 MINS",
    elevationGain: "+2m",
    waypointsSequence: [
      "Deboer Ground",
      "Sree Jayam School",
      "U-turn",
      "Finish – Deboer Ground"
    ],
    mapPath: "M 100,350 L 250,220 L 100,350",
    checkpoints: [
      { name: "Deboer Ground (Start)", mileage: "0.0 KM", elevation: "216m", coordinates: { x: 100, y: 350 } },
      { name: "Sree Jayam School", mileage: "1.0 KM", elevation: "217m", coordinates: { x: 250, y: 220 } },
      { name: "U-Turn Spot", mileage: "1.1 KM", elevation: "217m", coordinates: { x: 220, y: 240 } },
      { name: "Deboer Ground (Finish)", mileage: "2.0 KM", elevation: "216m", coordinates: { x: 100, y: 350 } }
    ],
    checkpointsList: [
      { label: "🏁 START", location: "Deboer Ground", nodeIndex: 0 },
      { label: "📍 CHECKPOINT 1", location: "Sree Jayam School", nodeIndex: 1 },
      { label: "🏁 FINISH", location: "Deboer Ground", nodeIndex: 3 }
    ]
  },
  {
    id: "5k-route",
    distance: "5 KM",
    title: "5 KM Fitness Route",
    startPoint: "Deboer Ground",
    finishPoint: "Deboer Ground",
    description: "The 5 KM route starts at Deboer Ground, continues through Bagayam to CHAD Hospital, makes a U-turn, and returns to Deboer Ground.",
    estimatedDuration: "25-35 MINS",
    elevationGain: "+5m",
    waypointsSequence: [
      "Deboer Ground",
      "Bagayam",
      "CHAD Hospital",
      "U-turn",
      "Finish – Deboer Ground"
    ],
    mapPath: "M 100,350 L 250,220 L 420,120 L 100,350",
    checkpoints: [
      { name: "Deboer Ground (Start)", mileage: "0.0 KM", elevation: "216m", coordinates: { x: 100, y: 350 } },
      { name: "Bagayam Junction", mileage: "2.2 KM", elevation: "218m", coordinates: { x: 250, y: 220 } },
      { name: "CHAD Hospital", mileage: "2.5 KM", elevation: "219m", coordinates: { x: 420, y: 120 } },
      { name: "U-Turn Gate", mileage: "2.6 KM", elevation: "219m", coordinates: { x: 380, y: 140 } },
      { name: "Deboer Ground (Finish)", mileage: "5.0 KM", elevation: "216m", coordinates: { x: 100, y: 350 } }
    ],
    checkpointsList: [
      { label: "🏁 START", location: "Deboer Ground", nodeIndex: 0 },
      { label: "📍 CHECKPOINT 1", location: "Bagayam", nodeIndex: 1 },
      { label: "📍 CHECKPOINT 2", location: "CHAD Hospital", nodeIndex: 2 },
      { label: "🏁 FINISH", location: "Deboer Ground", nodeIndex: 4 }
    ]
  },
  {
    id: "10k-route",
    distance: "10 KM",
    title: "10 KM Challenge Route",
    startPoint: "Deboer Ground",
    finishPoint: "Deboer Ground",
    description: "The 10 KM route begins at Deboer Ground, proceeds through Bagayam, Otteri, Sankarapalayam, passes CMC Eye Hospital, continues to Raymond Shop, and returns to Deboer Ground for the finish.",
    estimatedDuration: "45-75 MINS",
    elevationGain: "+12m",
    waypointsSequence: [
      "Deboer Ground",
      "Bagayam",
      "Otteri",
      "Sankarapalayam",
      "CMC Eye Hospital",
      "Raymond Shop",
      "Finish – Deboer Ground"
    ],
    mapPath: "M 100,350 L 220,260 L 350,180 L 480,110 L 520,250 L 350,360 Z",
    checkpoints: [
      { name: "Deboer Ground (Start)", mileage: "0.0 KM", elevation: "216m", coordinates: { x: 100, y: 350 } },
      { name: "Bagayam", mileage: "1.8 KM", elevation: "218m", coordinates: { x: 220, y: 260 } },
      { name: "Otteri Sector", mileage: "3.5 KM", elevation: "219m", coordinates: { x: 350, y: 180 } },
      { name: "Sankarapalayam", mileage: "5.2 KM", elevation: "220m", coordinates: { x: 480, y: 110 } },
      { name: "CMC Eye Hospital", mileage: "7.0 KM", elevation: "218m", coordinates: { x: 520, y: 250 } },
      { name: "Raymond Shop Junction", mileage: "8.5 KM", elevation: "217m", coordinates: { x: 350, y: 360 } },
      { name: "Deboer Ground (Finish)", mileage: "10.0 KM", elevation: "216m", coordinates: { x: 100, y: 350 } }
    ],
    checkpointsList: [
      { label: "🏁 START", location: "Deboer Ground", nodeIndex: 0 },
      { label: "📍 CHECKPOINT 1", location: "Bagayam", nodeIndex: 1 },
      { label: "📍 CHECKPOINT 2", location: "Otteri", nodeIndex: 2 },
      { label: "📍 CHECKPOINT 3", location: "Sankarapalayam", nodeIndex: 3 },
      { label: "📍 CHECKPOINT 4", location: "CMC Eye Hospital", nodeIndex: 4 },
      { label: "📍 CHECKPOINT 5", location: "Raymond Shop", nodeIndex: 5 },
      { label: "🏁 FINISH", location: "Deboer Ground", nodeIndex: 6 }
    ]
  }
];
