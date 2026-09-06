"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Page-level staggered entrance: header first, then body sections.
 * Used on both / and /personal for a consistent, cinematic feel.
 */
export default function PageEnter({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto max-w-6xl px-4 sm:px-6"
    >
      {children}
    </motion.div>
  );
}
