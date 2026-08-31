import type { Metadata } from "next";
import { Montserrat, Inter, Jost } from "next/font/google";
import "../styles/globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { RegistrationProvider } from "@/components/layout/RegistrationContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Feel The Beat Run 2026",
    template: "%s | Feel The Beat Run",
  },
  description: "Official site for the Feel The Beat Run 2026 on Sunday, September 27, 2026, in Vellore, Tamil Nadu. Register now to celebrate World Heart Day and run for your heart (10K, 5K, 2K categories).",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://marathon.sreejayamschool.edu.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Feel The Beat Run 2026",
    description: "Join the World Heart Day community run on Sunday, September 27, 2026, in Vellore, Tamil Nadu. Register today!",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://marathon.sreejayamschool.edu.in",
    siteName: "Feel The Beat Run",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Feel The Beat Run 2026",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Feel The Beat Run 2026",
    description: "Join the World Heart Day community run on Sunday, September 27, 2026, in Vellore, Tamil Nadu. Register today!",
    images: ["/images/og-image.jpg"],
  },
  icons: {
    icon: [
      {
        url: "/images/favicon/Frame 1000004377.png",
        type: "image/png",
      },
    ],
    shortcut: "/images/favicon/Frame 1000004377.png",
    apple: [
      {
        url: "/images/favicon/Frame 1000004377.png",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${montserrat.variable} ${jost.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-brand-primary selection:text-black">
        <SmoothScroll>
          <RegistrationProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </RegistrationProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
