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
    answer: "Yes, you can authorize a representative. They must present a print/digital copy of your confirmation email/SMS, an authorization letter signed by you, and a photocopy of your valid photo ID.",
  },
  {
    id: "faq-cutoff",
    question: "What are the cut-off times for each race category?",
    answer: "To ensure runner safety and road re-opening protocols, cut-off times are: 10K Run has a 2-hour cut-off; 5K Run has a 1-hour 15-minute cut-off; and 2K Run has a 45-minute cut-off.",
  },
  {
    id: "faq-support",
    question: "Who can I contact for registration and technical timing issues?",
    answer: "For any registration errors or timings assistance, you can contact the support desk at contact@feelthebeatrun2026.com or support@nebsports.in.",
  },
];
