"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * One-time "highlighter pen" sweep: a solid amber block wipes
 * left-to-right behind the text, then fades away as the text settles.
 */
export default function HighlighterName({ text }: { text: string }) {
  const [swept, setSwept] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSwept(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <span className="relative inline-block">
      {/* Highlighter block */}
      <motion.span
        aria-hidden
        className="absolute -inset-x-2 -inset-y-1 origin-left rounded-sm bg-accent"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={swept ? { scaleX: 1, opacity: [1, 1, 0.35, 0] } : { scaleX: 0 }}
        transition={{
          duration: 1.5,
          times: [0, 0.45, 0.75, 1],
          ease: "easeInOut",
        }}
      />

      {/* The name, revealed as the pen passes over it */}
      <motion.span
        className="relative z-10 text-accent"
        initial={{ opacity: 1 }}
      >
        {text}
      </motion.span>
    </span>
  );
}
