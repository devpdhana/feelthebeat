"use client";

import { faqData } from "@/data/faq";
import Accordion from "@/components/ui/Accordion";

export default function FAQ() {
  return (
    <section id="faq" className="relative py-[90px] bg-[#F5FAFF] overflow-hidden border-b border-brand-primary/12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="mb-16 flex flex-col items-center text-center gap-2">
          <span className="font-mono text-xs tracking-[0.35em] text-brand-primary font-semibold">
            [09] DECLASSIFIED_FAQ
          </span>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-default md:text-5xl">
            QUESTIONS & TIMING DIRECTIVES
          </h2>
          <div className="h-[1px] w-24 bg-brand-primary mt-2" />
        </div>

        {/* Reusable accordion */}
        <Accordion items={faqData} />
      </div>
    </section>
  );
}
