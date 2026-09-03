export type SponsorCategory =
  | "ORGANIZER"
  | "CO-SPONSORS"
  | "GOLD SPONSORS"
  | "TECHNOLOGY PARTNER"
  | "OTHER PARTNER";

export interface Sponsor {
  id: number;
  name: string;
  role: string;
  category: SponsorCategory;
  logo: string;
  order?: number;
}

export const SPONSOR_CATEGORY_PRIORITY: Record<SponsorCategory, number> = {
  "ORGANIZER": 1,
  "CO-SPONSORS": 2,
  "GOLD SPONSORS": 3,
  "TECHNOLOGY PARTNER": 4,
  "OTHER PARTNER": 5,
};

export const sponsors: Sponsor[] = [
  // 1. ORGANIZER
  {
    id: 1,
    name: "Sree Jayam School",
    role: "Organiser",
    category: "ORGANIZER",
    logo: "/images/sponsors/sree-jayam-school.png",
    order: 1,
  },
  {
    id: 2,
    name: "VRG Cement Marketing",
    role: "Title Sponsor",
    category: "ORGANIZER",
    logo: "/images/sponsors/vrg.jpeg",
    order: 2,
  },

  // 2. CO-SPONSORS
  {
    id: 3,
    name: "Dr. Agarwals Eye Hospital",
    role: "Co-Sponsor",
    category: "CO-SPONSORS",
    logo: "/images/sponsors/Agarwals.jpg",
    order: 1,
  },
  {
    id: 4,
    name: "Thirumagal Tamil",
    role: "Co-Sponsor",
    category: "CO-SPONSORS",
    logo: "/images/sponsors/thirumagal TAMIL.png",
    order: 2,
  },

  // 3. GOLD PARTNER / GOLD SPONSORS
  {
    id: 5,
    name: "Arani CMR",
    role: "Gold Sponsor",
    category: "GOLD SPONSORS",
    logo: "/images/sponsors/cmr-logo.png",
    order: 1,
  },
  {
    id: 6,
    name: "SSI",
    role: "Gold Sponsor",
    category: "GOLD SPONSORS",
    logo: "/images/sponsors/SSI.jpg",
    order: 2,
  },
  {
    id: 7,
    name: "Durga",
    role: "Gold Sponsor",
    category: "GOLD SPONSORS",
    logo: "/images/sponsors/DURGA.jpg",
    order: 3,
  },

  // 4. TECHNOLOGY PARTNER
  {
    id: 8,
    name: "Man2Web",
    role: "Technology Partner",
    category: "TECHNOLOGY PARTNER",
    logo: "/images/sponsors/man2web.png",
    order: 1,
  },

  // 5. OTHER PARTNER
  {
    id: 9,
    name: "Kannan & Co",
    role: "Hydration Partner",
    category: "OTHER PARTNER",
    logo: "/images/sponsors/kannan soda.jpeg",
    order: 1,
  },
  {
    id: 10,
    name: "Saranya",
    role: "LED Partner",
    category: "OTHER PARTNER",
    logo: "/images/sponsors/saranya.jpeg",
    order: 2,
  },
  {
    id: 11,
    name: "My Race",
    role: "Timing Partner",
    category: "OTHER PARTNER",
    logo: "/images/sponsors/my Race Red Logo_1_page-0001.jpg",
    order: 3,
  },
  {
    id: 12,
    name: "Suryan FM Radio",
    role: "Radio Partner",
    category: "OTHER PARTNER",
    logo: "/images/sponsors/suryan.jpg",
    order: 4,
  },
];

export const getSortedSponsors = (list: Sponsor[] = sponsors): Sponsor[] => {
  return [...list].sort((a, b) => {
    const priorityA = SPONSOR_CATEGORY_PRIORITY[a.category] || 99;
    const priorityB = SPONSOR_CATEGORY_PRIORITY[b.category] || 99;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return (a.order ?? a.id) - (b.order ?? b.id);
  });
};
