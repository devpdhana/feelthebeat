"use client";

import Card from "@/components/ui/Card";
import { IoHeartOutline, IoFitnessOutline, IoPeopleOutline, IoBodyOutline, IoHappyOutline, IoMedalOutline } from "react-icons/io5";
import { motion } from "framer-motion";

const reasons = [
  {
    icon: <IoHeartOutline className="text-3xl text-brand-primary" />,
    title: "CELEBRATE WORLD HEART DAY",
    desc: "Run on September 27 alongside thousands of fitness supporters globally to mark World Heart Day and spread vital heart health awareness.",
  },
  {
    icon: <IoFitnessOutline className="text-3xl text-brand-primary" />,
    title: "IMPROVE HEART HEALTH",
    desc: "Cardio training is key to cardiovascular strength. Every kilometer run is an investment into lowering resting heart rate and strengthening arterial fitness.",
  },
  {
    icon: <IoPeopleOutline className="text-3xl text-brand-primary" />,
    title: "RUN WITH THE COMMUNITY",
    desc: "Experience the joint energy of Vellore's running clubs, schools, corporate groups, and local families running together.",
  },
  {
    icon: <IoBodyOutline className="text-3xl text-brand-primary" />,
    title: "PROMOTE HEALTHY LIVING",
    desc: "Incorporate active lifestyle choices into your routine. Start with training loops, recover with premium guidelines, and build lifelong habits.",
  },
  {
    icon: <IoHappyOutline className="text-3xl text-brand-primary" />,
    title: "FAMILY-FRIENDLY EVENT",
    desc: "From the inclusive 2K Fun Loop to the competitive 10K test, there is a dedicated track length built for every family member.",
  },
  {
    icon: <IoMedalOutline className="text-3xl text-brand-primary" />,
    title: "OFFICIAL FINISHER MEDAL",
    desc: "Cross the fort gate finishing line and claim your custom World Heart Day finisher medal, certificate of timing, and gear.",
  },
];

export default function WhyParticipate() {
  return (
    <section id="why-participate" className="relative py-[90px] bg-[#F5FAFF] overflow-hidden border-b border-brand-primary/12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section title */}
        <div className="mb-16 flex flex-col items-center text-center gap-2">
          <span className="font-mono text-xs tracking-[0.35em] text-brand-primary font-semibold">
            [03] MISSION_VALUES
          </span>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-brand-text md:text-5xl">
            WHY FEEL THE BEAT
          </h2>
          <div className="h-[1px] w-24 bg-brand-primary mt-2" />
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
            >
              <Card className="flex flex-col gap-4 items-start h-full p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-brand-primary/20 bg-brand-primary/5 rounded">
                  {reason.icon}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-sm font-bold text-brand-text tracking-wider">
                    {reason.title}
                  </h3>
                  <p className="text-xs font-mono text-brand-muted leading-relaxed">
                    {reason.desc}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
