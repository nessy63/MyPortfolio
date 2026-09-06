"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { education } from "@/lib/data";

/**
 * Accordion-style education row: hovering a card expands it (flex-grow)
 * while siblings shrink; the active card fills solid with a glowing border.
 * On touch devices it falls back to tap-to-expand.
 */
export default function EducationAccordion() {
  const [active, setActive] = useState<number | null>(null);
  const isTouch =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none)").matches;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {education.map((item, i) => {
        const isActive = active === i;
        return (
          <motion.article
            key={item.title}
            layout
            transition={{ type: "spring", bounce: 0.12, duration: 0.55 }}
            onMouseEnter={() => !isTouch && setActive(i)}
            onMouseLeave={() => !isTouch && setActive(null)}
            onClick={() => setActive(isActive ? null : i)}
            className={`cursor-pointer rounded-2xl border p-6 transition-[border-color,box-shadow,background-color] duration-300 lg:flex-1 ${
              isActive
                ? "border-accent/70 bg-surface-2 shadow-[0_0_30px_-6px_rgba(255,180,84,0.45)]"
                : "border-hairline bg-surface"
            }`}
            style={{ flexGrow: isActive ? 1.6 : 1 }}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-base font-bold sm:text-lg">{item.title}</h3>
              <span className="shrink-0 rounded-full border border-accent/60 bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                {item.score}
              </span>
            </div>

            <p className="mt-1 text-sm text-muted">{item.period}</p>

            {/* Note sits at the bottom, revealed on expand */}
            <motion.p
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0.55,
                height: "auto",
              }}
              className="mt-4 text-sm leading-relaxed text-muted"
            >
              {item.note}
            </motion.p>
          </motion.article>
        );
      })}
    </div>
  );
}
