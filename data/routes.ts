export interface RouteCheckpointDisplay {
  label: string;
  location: string;
}

export interface RouteData {
  id: string;
  distance: string;
  title: string;
  categoryName: string;
  startPoint: string;
  finishPoint: string;
  description: string;
  estimatedDuration: string;
  elevationGain: string;
  image: string;
  waypointsSequence: string[];
  checkpointsList: RouteCheckpointDisplay[];
}

export const routesData: RouteData[] = [
  {
    id: "2km-kids",
    distance: "2 KM KIDS",
    title: "2 KM Kids Fun Run Route",
    categoryName: "2 KM Kids Fun Run",
    startPoint: "Deboer Ground",
    finishPoint: "Deboer Ground",
    description: "The 2 KM kids fun run route begins at Deboer Ground, reaches Sree Jayam School, makes a U-turn, and finishes back at Deboer Ground.",
    estimatedDuration: "10-15 MINS",
    elevationGain: "+2m",
    image: "/images/maps/2KM Kids.png",
    waypointsSequence: [
      "Deboer Ground",
      "Sree Jayam School",
      "U-turn",
      "Finish – Deboer Ground"
    ],
    checkpointsList: [
      { label: "🏁 START", location: "Deboer Ground" },
      { label: "📍 CHECKPOINT 1", location: "Sree Jayam School" },
      { label: "🏁 FINISH", location: "Deboer Ground" }
    ]
  },
  {
    id: "2km",
    distance: "2 KM ADULTS",
    title: "2 KM Adults Fun Run Route",
    categoryName: "2 KM Adults Fun Run",
    startPoint: "Deboer Ground",
    finishPoint: "Deboer Ground",
    description: "The 2 KM adults fun run route begins at Deboer Ground, reaches Sree Jayam School, makes a U-turn, and finishes back at Deboer Ground.",
    estimatedDuration: "10-15 MINS",
    elevationGain: "+2m",
    image: "/images/maps/2KM Adults.png",
    waypointsSequence: [
      "Deboer Ground",
      "Sree Jayam School",
      "U-turn",
      "Finish – Deboer Ground"
    ],
    checkpointsList: [
      { label: "🏁 START", location: "Deboer Ground" },
      { label: "📍 CHECKPOINT 1", location: "Sree Jayam School" },
      { label: "🏁 FINISH", location: "Deboer Ground" }
    ]
  },
  {
    id: "5km",
    distance: "5 KM",
    title: "5 KM Run Route",
    categoryName: "5 KM Run",
    startPoint: "Deboer Ground",
    finishPoint: "Deboer Ground",
    description: "The 5 KM route starts at Deboer Ground, continues through Bagayam to CHAD Hospital, makes a U-turn, and returns to Deboer Ground.",
    estimatedDuration: "25-35 MINS",
    elevationGain: "+5m",
    image: "/images/maps/5 km.png",
    waypointsSequence: [
      "Deboer Ground",
      "Bagayam",
      "CHAD Hospital",
      "U-turn",
      "Finish – Deboer Ground"
    ],
    checkpointsList: [
      { label: "🏁 START", location: "Deboer Ground" },
      { label: "📍 CHECKPOINT 1", location: "Bagayam" },
      { label: "📍 CHECKPOINT 2", location: "CHAD Hospital" },
      { label: "🏁 FINISH", location: "Deboer Ground" }
    ]
  },
  {
    id: "10km",
    distance: "10 KM",
    title: "10 KM Run Route",
    categoryName: "10 KM Run",
    startPoint: "Deboer Ground",
    finishPoint: "Deboer Ground",
    description: "The 10 KM route begins at Deboer Ground, proceeds through Bagayam, Otteri, Sankarapalayam, passes CMC Eye Hospital, continues to Raymond Shop, and returns to Deboer Ground for the finish.",
    estimatedDuration: "45-75 MINS",
    elevationGain: "+12m",
    image: "/images/maps/10 km.png",
    waypointsSequence: [
      "Deboer Ground",
      "Bagayam",
      "Otteri",
      "Sankarapalayam",
      "CMC Eye Hospital",
      "Raymond Shop",
      "Finish – Deboer Ground"
    ],
    checkpointsList: [
      { label: "🏁 START", location: "Deboer Ground" },
      { label: "📍 CHECKPOINT 1", location: "Bagayam" },
      { label: "📍 CHECKPOINT 2", location: "Otteri" },
      { label: "📍 CHECKPOINT 3", location: "Sankarapalayam" },
      { label: "📍 CHECKPOINT 4", location: "CMC Eye Hospital" },
      { label: "📍 CHECKPOINT 5", location: "Raymond Shop" },
      { label: "🏁 FINISH", location: "Deboer Ground" }
    ]
  }
];
