"use client";

import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  el?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  delay?: number;
}

export default function AnimatedText({
  text,
  className = "",
  el: Tag = "p",
  delay = 0,
}: AnimatedTextProps) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ease: [0.215, 0.61, 0.355, 1] as any, // Power3 out
        duration: 0.6,
      },
    },
  };

  return (
    <Tag className={`overflow-hidden ${className}`}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        className="inline-flex flex-wrap gap-x-[0.25em]"
      >
        {words.map((word, idx) => (
          <span key={idx} className="inline-block overflow-hidden py-0.5">
            <motion.span variants={wordVariants} className="inline-block">
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
