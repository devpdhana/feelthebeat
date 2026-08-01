"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiPlus, HiMinus } from "react-icons/hi";

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={`border transition-all duration-300 rounded-lg overflow-hidden ${
              isOpen ? "border-brand-primary bg-[#F8FAFD] shadow-sm" : "border-brand-primary/12 bg-white shadow-sm"
            }`}
          >
            <button
              suppressHydrationWarning
              onClick={() => toggleItem(item.id)}
              className="flex w-full items-center justify-between p-5 text-left font-display text-sm font-semibold uppercase tracking-wider text-default hover:text-brand-primary transition-colors cursor-pointer"
            >
              <span>{item.question}</span>
              <span className={`flex h-6 w-6 items-center justify-center rounded border transition-colors ${
                isOpen ? "border-brand-primary text-brand-primary" : "border-brand-primary/20 text-muted-default"
              }`}>
                {isOpen ? <HiMinus size={12} /> : <HiPlus size={12} />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-brand-primary/8 p-5 text-xs font-mono leading-relaxed text-muted-default bg-white">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
