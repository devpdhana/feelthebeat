import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlineInformationCircle, HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker, HiOutlineGlobeAlt } from "react-icons/hi";
import { BiRun } from "react-icons/bi";
import { FiCheckCircle } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Terms & Conditions | Sree Jayam School Marathon",
  description: "Official Terms and Conditions for participants and parents registering for the Sree Jayam School Marathon.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
  openGraph: {
    title: "Terms & Conditions | Sree Jayam School Marathon",
    description: "Official Terms and Conditions for participants and parents registering for the Sree Jayam School Marathon.",
    url: "/terms-and-conditions",
    type: "website",
  },
};

const SECTIONS = [
  { id: "categories", title: "1. Event Categories" },
  { id: "registration", title: "2. Registration" },
  { id: "kids-fun-run", title: "3. Kids Fun Run" },
  { id: "adult-run", title: "4. Adult Run & Other Categories" },
  { id: "health-safety", title: "5. Health & Safety" },
  { id: "race-bib", title: "6. Race Bib" },
  { id: "event-rules", title: "7. Event Rules" },
  { id: "event-changes", title: "8. Event Changes" },
  { id: "photos-videos", title: "9. Photos & Videos" },
  { id: "personal-information", title: "10. Personal Information" },
  { id: "communication", title: "11. Communication" },
  { id: "cancellation-refund", title: "12. Cancellation & Refund" },
  { id: "acceptance", title: "13. Acceptance" },
  { id: "contact-us", title: "14. Contact Us" },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="relative min-h-screen bg-[#0E1318] text-white pt-28 pb-20 overflow-hidden font-sans">
      {/* Background Grid & Ambient Glow */}
      <div className="absolute inset-0 telemetry-grid opacity-[0.03] pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-primary/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50 mb-4">
          <Link href="/" className="hover:text-brand-primary transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-brand-primary font-bold">TERMS &amp; CONDITIONS</span>
        </div>

        {/* Hero Banner */}
        <div className="border-b border-white/10 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary font-mono text-[10px] tracking-widest uppercase mb-4">
            <HiOutlineDocumentText className="text-sm" />
            <span>PARTICIPATION GUIDELINES &amp; POLICIES</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
            TERMS &amp; <span className="text-brand-primary">CONDITIONS</span>
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-white/60">
            <span>SREE JAYAM SCHOOL MARATHON</span>
            <span>•</span>
            <span>FEEL THE BEAT RUN</span>
          </div>

          <p className="mt-5 text-sm sm:text-base text-white/85 leading-relaxed max-w-4xl">
            By registering for the <strong className="text-white">Sree Jayam School Marathon</strong>, participants and parents agree to the following terms and conditions. These simple guidelines are designed to keep the run safe, smooth, and enjoyable for every student, parent, and runner.
          </p>
        </div>

        {/* Main Grid: Sidebar + Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar Table of Contents (Desktop) */}
          <aside className="lg:col-span-4 sticky top-28 hidden lg:block">
            <div className="rounded-2xl border border-white/10 bg-[#141A21] p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/10">
                <HiOutlineInformationCircle className="text-brand-primary text-lg" />
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-white">
                  QUICK NAVIGATION
                </h2>
              </div>
              <nav className="space-y-1 font-mono text-[11px]">
                {SECTIONS.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block py-1.5 px-2.5 rounded-lg text-white/70 hover:text-brand-primary hover:bg-white/5 transition-all truncate"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">HAVE QUESTIONS?</span>
                <a
                  href="tel:9487021111"
                  className="flex items-center justify-center gap-2 rounded-lg bg-brand-primary text-white py-2.5 px-4 font-mono text-xs font-bold hover:bg-brand-primary-hover transition-colors"
                >
                  <HiOutlinePhone className="text-sm" />
                  <span>CALL 9487021111</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Document Content */}
          <main className="lg:col-span-8 flex flex-col gap-6">

            {/* 1. Event Categories */}
            <section id="categories" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21]">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">01.</span>
                    EVENT CATEGORIES
                  </h2>
                  <BiRun className="text-brand-primary text-xl" />
                </div>

                <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-4">
                  The Sree Jayam School Marathon includes the following running categories:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="p-4 rounded-xl border border-white/8 bg-[#0D1217]">
                    <div className="font-display text-sm font-black text-white uppercase">2 KM Kids Fun Run</div>
                    <div className="text-[11px] text-white/70 mt-1">For school children &amp; young runners (8–16 Years)</div>
                  </div>
                  <div className="p-4 rounded-xl border border-white/8 bg-[#0D1217]">
                    <div className="font-display text-sm font-black text-white uppercase">2 KM Adult Run</div>
                    <div className="text-[11px] text-white/70 mt-1">For parents, beginners &amp; fitness enthusiasts (18+ Years)</div>
                  </div>
                  <div className="p-4 rounded-xl border border-white/8 bg-[#0D1217]">
                    <div className="font-display text-sm font-black text-white uppercase">5 KM Run</div>
                    <div className="text-[11px] text-white/70 mt-1">Timed distance run for energetic runners (12+ Years)</div>
                  </div>
                  <div className="p-4 rounded-xl border border-white/8 bg-[#0D1217]">
                    <div className="font-display text-sm font-black text-white uppercase">10 KM Run</div>
                    <div className="text-[11px] text-white/70 mt-1">Timed endurance run for experienced runners (14+ Years)</div>
                  </div>
                </div>

                <p className="text-xs text-white/75 font-mono">
                  Participants must register for the correct category based on the age requirement and eligibility shown during registration.
                </p>
              </Card>
            </section>

            {/* 2. Registration */}
            <section id="registration" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21]">
                <div className="border-b border-white/10 pb-4 mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">02.</span>
                    REGISTRATION
                  </h2>
                </div>
                <ul className="space-y-3 font-mono text-xs text-white/80 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Please provide correct and complete details while filling out the registration form.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Your registration is confirmed only after successful payment and upon receiving your official confirmation message.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Registration fees are non-refundable and non-transferable, unless otherwise announced by the organisers.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>A participant&apos;s registration or bib number cannot be transferred or handed over to another person without prior approval from the organisers.</span>
                  </li>
                </ul>
              </Card>
            </section>

            {/* 3. Kids Fun Run */}
            <section id="kids-fun-run" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21]">
                <div className="border-b border-white/10 pb-4 mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">03.</span>
                    KIDS FUN RUN
                  </h2>
                </div>
                <ul className="space-y-3 font-mono text-xs text-white/80 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Children taking part in the <strong className="text-white">2 KM Kids Fun Run</strong> must meet the age criteria specified during registration.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Parent or guardian consent is mandatory for all children participating in the event.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Parents and guardians are responsible for ensuring that their child is healthy, well-rested, and ready to participate.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Parents and guardians must follow all instructions given by event officials and school marshals along the route.</span>
                  </li>
                </ul>
              </Card>
            </section>

            {/* 4. Adult Run & Other Categories */}
            <section id="adult-run" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21]">
                <div className="border-b border-white/10 pb-4 mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">04.</span>
                    ADULT RUN &amp; OTHER CATEGORIES
                  </h2>
                </div>
                <ul className="space-y-3 font-mono text-xs text-white/80 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Participants in the <strong className="text-white">2 KM Adult Run</strong>, <strong className="text-white">5 KM Run</strong>, and <strong className="text-white">10 KM Run</strong> must meet the age requirement shown for their category during registration.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Participants are responsible for ensuring that they are physically fit and adequately prepared to complete their chosen run.</span>
                  </li>
                </ul>
              </Card>
            </section>

            {/* 5. Health & Safety */}
            <section id="health-safety" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21]">
                <div className="border-b border-white/10 pb-4 mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">05.</span>
                    HEALTH &amp; SAFETY
                  </h2>
                </div>
                <ul className="space-y-3 font-mono text-xs text-white/80 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Participants should be physically fit and comfortable participating in their selected distance.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Participants are responsible for their own health, hydration, and safety throughout the event.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>If you or your child feels unwell or exhausted during the run, please inform the nearest event official, volunteer, or medical station immediately.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>The organisers may advise or ask a participant to stop running if there is a reasonable concern for their health or safety.</span>
                  </li>
                </ul>
              </Card>
            </section>

            {/* 6. Race Bib */}
            <section id="race-bib" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21]">
                <div className="border-b border-white/10 pb-4 mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">06.</span>
                    RACE BIB
                  </h2>
                </div>
                <ul className="space-y-3 font-mono text-xs text-white/80 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Every runner must pin and visibly display their assigned race bib on the front of their shirt during the run.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Race bibs are personal to each registered runner and must not be swapped, exchanged, or given to anyone else.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Please follow the schedule and instructions provided for collecting your bib and running kit prior to event day.</span>
                  </li>
                </ul>
              </Card>
            </section>

            {/* 7. Event Rules */}
            <section id="event-rules" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21]">
                <div className="border-b border-white/10 pb-4 mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">07.</span>
                    EVENT RULES
                  </h2>
                </div>
                <p className="text-xs text-white/80 font-mono mb-3">All runners and guardians are requested to:</p>
                <ul className="space-y-3 font-mono text-xs text-white/80 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Follow the clearly marked event route at all times.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Follow guidance given by school staff, event marshals, volunteers, and traffic coordinators.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Treat fellow runners, volunteers, and staff with courtesy and sportsmanship.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>Avoid any unsafe behaviour or actions that could endanger yourself or other participants.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <HiOutlineShieldCheck className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span className="text-white font-semibold">The organisers may disqualify or ask any participant to leave if they violate event rules or behave unsafely.</span>
                  </li>
                </ul>
              </Card>
            </section>

            {/* 8. Event Changes */}
            <section id="event-changes" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21]">
                <div className="border-b border-white/10 pb-4 mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">08.</span>
                    EVENT CHANGES
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-mono mb-3">
                  The organisers may change the event date, start time, route, venue, or other arrangements if required due to weather conditions, safety concerns, government directives, or other circumstances.
                </p>
                <p className="text-xs text-white/70 font-mono">
                  Any important updates will be communicated promptly through our official WhatsApp, SMS, email, and website channels.
                </p>
              </Card>
            </section>

            {/* 9. Photos & Videos */}
            <section id="photos-videos" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21]">
                <div className="border-b border-white/10 pb-4 mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">09.</span>
                    PHOTOS &amp; VIDEOS
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-mono mb-3">
                  Photos and video recordings will be taken throughout the marathon event.
                </p>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-mono">
                  By taking part in the event, you agree that photos or videos featuring you or your child may be used by the organisers for event celebration, website galleries, school social media, promotional updates, and future marathon announcements.
                </p>
              </Card>
            </section>

            {/* 10. Personal Information */}
            <section id="personal-information" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21]">
                <div className="border-b border-white/10 pb-4 mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">10.</span>
                    PERSONAL INFORMATION
                  </h2>
                </div>
                <p className="text-xs text-white/80 font-mono mb-3">The details you provide during registration will be used strictly for:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs text-white/80 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    <span>Event registration and participant management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    <span>Sending important runner updates &amp; reminders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    <span>Bib allocation and running kit distribution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    <span>Recording and publishing race results</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    <span>Emergency contacts and participant safety</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    <span>Official school marathon announcements</span>
                  </li>
                </ul>
                <p className="text-[11px] text-white/60 font-mono border-t border-white/5 pt-3">
                  All participant information is kept secure and handled in accordance with standard privacy practices.
                </p>
              </Card>
            </section>

            {/* 11. Communication */}
            <section id="communication" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21]">
                <div className="border-b border-white/10 pb-4 mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">11.</span>
                    COMMUNICATION
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-mono">
                  Registered runners may receive official event updates, bib collection details, starting time reminders, and emergency announcements via WhatsApp, SMS, email, or phone call.
                </p>
              </Card>
            </section>

            {/* 12. Cancellation & Refund */}
            <section id="cancellation-refund" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21]">
                <div className="border-b border-white/10 pb-4 mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">12.</span>
                    CANCELLATION &amp; REFUND
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-mono mb-3">
                  If the event is postponed, rescheduled, or cancelled due to circumstances beyond the organisers&apos; control, next steps and updated schedules will be shared with all registered participants.
                </p>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-mono">
                  Any decisions regarding refunds, registration rollovers, or alternate arrangements will be made and communicated by the organisers.
                </p>
              </Card>
            </section>

            {/* 13. Acceptance */}
            <section id="acceptance" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21] border-l-4 border-l-brand-primary">
                <div className="border-b border-white/10 pb-4 mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">13.</span>
                    ACCEPTANCE
                  </h2>
                </div>
                <p className="text-xs text-white/80 font-mono mb-3">By completing your registration, you confirm that:</p>
                <ul className="space-y-2.5 font-mono text-xs text-white/80 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>The details provided in your registration form are accurate.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>You have read, understood, and agreed to these Terms &amp; Conditions.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>You and your child agree to follow all event rules and safety instructions.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-brand-primary text-sm mt-0.5 shrink-0" />
                    <span>You understand that running in a sports event involves physical activity and natural associated risks.</span>
                  </li>
                </ul>
              </Card>
            </section>

            {/* 14. Contact Us */}
            <section id="contact-us" className="scroll-mt-32">
              <Card dark className="border-white/10 bg-[#141A21]">
                <div className="border-b border-white/10 pb-4 mb-5">
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-3">
                    <span className="text-brand-primary font-mono text-sm">14.</span>
                    CONTACT US
                  </h2>
                </div>

                <p className="text-xs text-white/80 font-mono mb-5">
                  If you have any questions about registration, bib collection, or the event rules, please feel free to contact us:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  {/* Organizer & Address */}
                  <div className="p-4 rounded-xl border border-white/8 bg-[#0D1217] flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-brand-primary font-bold text-[11px] uppercase">
                      <HiOutlineLocationMarker className="text-base" />
                      <span>EVENT ORGANISER &amp; ADDRESS</span>
                    </div>
                    <div className="text-white font-semibold text-xs leading-snug">
                      Sree Jayam School Marathon
                    </div>
                    <div className="text-white/70 text-[11px] leading-relaxed">
                      Ezhil Nagar Main Road, Allapuram,<br />
                      Vellore – 632002, Tamil Nadu, India
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="p-4 rounded-xl border border-white/8 bg-[#0D1217] flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-brand-primary font-bold text-[11px] uppercase">
                      <HiOutlinePhone className="text-base" />
                      <span>PHONE / HELPLINE</span>
                    </div>
                    <div className="text-white/70 text-[11px]">
                      Call or WhatsApp for assistance:
                    </div>
                    <a
                      href="tel:9487021111"
                      className="text-white font-bold text-base hover:text-brand-primary transition-colors flex items-center gap-2"
                    >
                      <span>9487021111</span>
                    </a>
                  </div>



                  {/* Website */}
                  <div className="p-4 rounded-xl border border-white/8 bg-[#0D1217] flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-brand-primary font-bold text-[11px] uppercase">
                      <HiOutlineGlobeAlt className="text-base" />
                      <span>OFFICIAL WEBSITE</span>
                    </div>
                    <div className="text-white/70 text-[11px]">
                      Registration and event details:
                    </div>
                    <Link
                      href="/"
                      className="text-white font-semibold hover:text-brand-primary transition-colors"
                    >
                      marathon.sreejayamschool.edu.in
                    </Link>
                  </div>
                </div>
              </Card>
            </section>

          </main>
        </div>

        {/* Footer Navigation CTA */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="font-mono text-xs text-white/60 hover:text-brand-primary transition-colors flex items-center gap-2"
          >
            <span>← BACK TO HOMEPAGE</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button href="/register" variant="primary" className="py-3 px-8 text-xs font-black">
              REGISTER FOR THE MARATHON
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
