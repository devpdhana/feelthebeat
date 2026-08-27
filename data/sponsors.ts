export interface Sponsor {
  id: number;
  name: string;
  role: string;
  logo: string;
}

export const sponsors: Sponsor[] = [
  {
    id: 1,
    name: "Sree Jayam School",
    role: "Organiser",
    logo: "/images/sponsors/sree-jayam-school.png",
  },
  {
    id: 2,
    name: "VRG Cement Marketing",
    role: "Title Sponsor",
    logo: "/images/sponsors/vrg.jpeg",
  },
  {
    id: 3,
    name: "Man2Web",
    role: "Technology Partner",
    logo: "/images/sponsors/man2web.png",
  },
  {
    id: 4,
    name: "ARANI CMR",
    role: "Gold Sponsor",
    logo: "/images/sponsors/cmr-logo.png",
  },
];

