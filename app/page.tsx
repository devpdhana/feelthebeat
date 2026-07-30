import Hero from "@/components/sections/Hero";
import EventHighlights from "@/components/sections/EventHighlights";
import AboutEvent from "@/components/sections/AboutEvent";
import WhyParticipate from "@/components/sections/WhyParticipate";
import RaceCategories from "@/components/sections/RaceCategories";
import RouteInformation from "@/components/sections/RouteInformation";
import Sponsors from "@/components/sections/Sponsors";
import Gallery from "@/components/sections/Gallery";
import FAQ from "@/components/sections/FAQ";
import RegistrationCTA from "@/components/sections/RegistrationCTA";

export default function Home() {
  return (
    <>
      {/* Fullscreen Video Hero Banner */}
      <Hero />

      {/* Categories Overview & Numerical Stats Count Up */}
      <EventHighlights />

      {/* Parallax Details Section */}
      <AboutEvent />

      {/* Why Participate Icon Grid */}
      <WhyParticipate />

      {/* Race Categories premium cards & gradients */}
      <RaceCategories />

      {/* Interactive SVG route loop map & timeline */}
      <RouteInformation />

      {/* Infinite marquee sponsors partner carousel */}
      <Sponsors />

      {/* Lightbox Pinterest masonry photo gallery */}
      <Gallery />

      {/* Collapsible Accordion FAQs */}
      <FAQ />

      {/* Sign-off CTA registration block */}
      <RegistrationCTA />
    </>
  );
}
