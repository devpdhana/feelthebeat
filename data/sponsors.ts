export type SponsorCategory =
  | "ORGANIZER"
  | "TITLE SPONSOR"
  | "GOLD SPONSORS"
  | "CO-SPONSORS"
  | "TECHNOLOGY PARTNER"
  | "DIGITAL PARTNER"
  | "OTHER PARTNER";

export interface Sponsor {
  id: number;
  name: string;
  role: string;
  category: SponsorCategory;
  logo: string;
  image: string;
  order?: number;
}

export const SPONSOR_CATEGORY_PRIORITY: Record<SponsorCategory, number> = {
  "ORGANIZER": 1,
  "TITLE SPONSOR": 2,
  "GOLD SPONSORS": 3,
  "CO-SPONSORS": 4,
  "TECHNOLOGY PARTNER": 5,
  "DIGITAL PARTNER": 6,
  "OTHER PARTNER": 7,
};

export const sponsors: Sponsor[] = [
  // ROW 1: ORGANIZER & TITLE SPONSOR
  {
    id: 1,
    name: "Sree Jayam School",
    role: "Organiser",
    category: "ORGANIZER",
    logo: "/images/sponsors/sree-jayam-school.png",
    image: "/images/sponsors/sree-jayam-school.png",
    order: 1,
  },
  {
    id: 2,
    name: "VRG Cement Marketing",
    role: "Title Sponsor",
    category: "TITLE SPONSOR",
    logo: "/images/sponsors/vrg.jpeg",
    image: "/images/sponsors/vrg.jpeg",
    order: 2,
  },

  // ROW 2: GOLD SPONSORS & CO-SPONSORS
  {
    id: 14,
    name: "Sagar Cement",
    role: "Gold Sponsor",
    category: "GOLD SPONSORS",
    logo: "/images/sponsors/sagar cement.jpeg",
    image: "/images/sponsors/sagar cement.jpeg",
    order: 1,
  },
  {
    id: 3,
    name: "Arani CMR",
    role: "Gold Sponsor",
    category: "GOLD SPONSORS",
    logo: "/images/sponsors/cmr-logo.png",
    image: "/images/sponsors/cmr-logo.png",
    order: 2,
  },
  {
    id: 4,
    name: "SSI",
    role: "Gold Sponsor",
    category: "GOLD SPONSORS",
    logo: "/images/sponsors/SSI.jpg",
    image: "/images/sponsors/SSI.jpg",
    order: 3,
  },
  {
    id: 5,
    name: "Durga",
    role: "Gold Sponsor",
    category: "GOLD SPONSORS",
    logo: "/images/sponsors/DURGA.jpg",
    image: "/images/sponsors/DURGA.jpg",
    order: 4,
  },
  {
    id: 6,
    name: "Dr. Agarwals Eye Hospital",
    role: "Co-Sponsor",
    category: "CO-SPONSORS",
    logo: "/images/sponsors/Agarwals.jpg",
    image: "/images/sponsors/Agarwals.jpg",
    order: 5,
  },
  {
    id: 7,
    name: "Thirumagal Tamil",
    role: "Co-Sponsor",
    category: "CO-SPONSORS",
    logo: "/images/sponsors/thirumagal-tamil.png",
    image: "/images/sponsors/thirumagal-tamil.png",
    order: 6,
  },

  // ROW 3: OTHER SPONSORS & PARTNERS
  {
    id: 8,
    name: "Man2Web",
    role: "Technology Partner",
    category: "TECHNOLOGY PARTNER",
    logo: "/images/sponsors/man2web.png",
    image: "/images/sponsors/man2web.png",
    order: 1,
  },
  {
    id: 13,
    name: "Vybe Haus",
    role: "Digital Partner",
    category: "DIGITAL PARTNER",
    logo: "/images/sponsors/The Vybe Haus Black.png",
    image: "/images/sponsors/The Vybe Haus Black.png",
    order: 2,
  },
  {
    id: 9,
    name: "Kannan & Co",
    role: "Hydration Partner",
    category: "OTHER PARTNER",
    logo: "/images/sponsors/kannan-soda.jpeg",
    image: "/images/sponsors/kannan-soda.jpeg",
    order: 3,
  },
  {
    id: 10,
    name: "Saranya",
    role: "LED Partner",
    category: "OTHER PARTNER",
    logo: "/images/sponsors/saranya.jpeg",
    image: "/images/sponsors/saranya.jpeg",
    order: 4,
  },
  {
    id: 11,
    name: "My Race",
    role: "Timing Partner",
    category: "OTHER PARTNER",
    logo: "/images/sponsors/my-race.jpg",
    image: "/images/sponsors/my-race.jpg",
    order: 5,
  },
  {
    id: 12,
    name: "Suryan FM Radio",
    role: "Radio Partner",
    category: "OTHER PARTNER",
    logo: "/images/sponsors/suryan.jpg",
    image: "/images/sponsors/suryan.jpg",
    order: 6,
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

export const getRow1Sponsors = (list: Sponsor[] = sponsors): Sponsor[] => {
  return list.filter((s) => s.category === "ORGANIZER" || s.category === "TITLE SPONSOR");
};

export const getRow2GoldSponsors = (list: Sponsor[] = sponsors): Sponsor[] => {
  return list.filter((s) => s.category === "GOLD SPONSORS");
};

export const getRow2CoSponsors = (list: Sponsor[] = sponsors): Sponsor[] => {
  return list.filter((s) => s.category === "CO-SPONSORS");
};

export const getRow3OtherSponsors = (list: Sponsor[] = sponsors): Sponsor[] => {
  return list.filter(
    (s) =>
      s.category === "TECHNOLOGY PARTNER" ||
      s.category === "DIGITAL PARTNER" ||
      s.category === "OTHER PARTNER"
  );
};
