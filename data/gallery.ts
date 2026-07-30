export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  year: string;
}

export const galleryImages: GalleryImage[] = [
  {
    id: "run-start",
    url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop",
    title: "Flag Off Ceremony",
    category: "Start Line",
    year: "2025",
  },
  {
    id: "marathon-pack",
    url: "https://images.unsplash.com/photo-1502904585520-fac43722a578?q=80&w=800&auto=format&fit=crop",
    title: "Elite Runners Pack",
    category: "Race Day",
    year: "2025",
  },
  {
    id: "hydration-cheer",
    url: "https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=800&auto=format&fit=crop",
    title: "Hydration Support Station",
    category: "Support",
    year: "2024",
  },
  {
    id: "sachin-ambassador",
    url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop",
    title: "Sachin Tendulkar Flagging Off",
    category: "Ceremony",
    year: "2024",
  },
  {
    id: "finish-line-victory",
    url: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?q=80&w=800&auto=format&fit=crop",
    title: "Finisher Victory Cross",
    category: "Finish Line",
    year: "2025",
  },
  {
    id: "bkc-runners-loop",
    url: "https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?q=80&w=800&auto=format&fit=crop",
    title: "BKC Loop Stretch",
    category: "BKC Course",
    year: "2023",
  },
];
