export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqData: FAQItem[] = [
  {
    id: "faq-date-venue",
    question: "When and where is the Feel The Beat Run 2026 held?",
    answer: "The Feel The Beat Run 2026 is scheduled for Sunday, September 27, 2026, in Vellore, Tamil Nadu, India, to celebrate World Heart Day. The start line is located near the historic Vellore Fort Gate.",
  },
  {
    id: "faq-bib-collect",
    question: "Can I collect my BIB on the race day?",
    answer: "No, BIB collection is strictly limited to the Pre-Race Expo dates (September 25 & 26). No BIBs will be distributed on the race day morning to avoid gate congestion.",
  },
  {
    id: "faq-bib-third-party",
    question: "Can someone else collect my BIB on my behalf?",
    answer: "Yes, you can authorize a representative. They must present a print/digital copy of your confirmation email/WhatsApp message, an authorization letter signed by you, and a photocopy of your valid photo ID.",
  },
  {
    id: "faq-cutoff",
    question: "What are the reporting time, start times, and cut-off times?",
    answer: "Reporting time is 5:00 AM for all participants. Race start times are: 10 KM at 5:30 AM, 5 KM at 6:00 AM, and 2 KM (both Kids & Adults) at 6:30 AM. Timed races (5 KM & 10 KM) have a cut-off time of 7:00 AM. 2 KM Kids Fun Run and 2 KM Adults Fun Run are non-timed fun runs.",
  },
  {
    id: "faq-age-eligibility",
    question: "What is the age eligibility for each race category?",
    answer: "Age eligibility requirements are: 2 KM Kids Fun Run requires participants to be between 8 and 16 years, 2 KM Adults Fun Run requires 18+ years, 5 KM category requires 12+ years, and 10 KM category requires 14+ years.",
  },
  {
    id: "faq-support",
    question: "Who can I contact for registration and technical timing issues?",
    answer: "For any registration queries or timing assistance, you can contact the support desk at marathon@sreejayamschool.edu.in.",
  },
];

