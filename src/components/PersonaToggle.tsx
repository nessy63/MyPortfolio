"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTransition } from "./TransitionProvider";

/**
 * Floating Professional/Personal pill toggle.
 * Fixed near the bottom-center of the viewport while scrolling;
 * on /personal it also sits centered inside the footer bar.
 */
export default function PersonaToggle({ variant = "floating" }: { variant?: "floating" | "inline" }) {
  const pathname = usePathname();
  const { navigateWithWipe } = useTransition();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const items = [
    { label: "Professional", href: "/" },
    { label: "Personal", href: "/personal" },
  ];

  const control = (
    <div
      role="tablist"
      aria-label="Persona mode"
      className="flex items-center rounded-full border border-hairline bg-surface/90 p-1 shadow-lg shadow-black/40 backdrop-blur-md ring-1 ring-white/5"
    >
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            role="tab"
            aria-selected={active}
            onClick={(e) => {
              if (pathname !== item.href) {
                e.preventDefault();
                navigateWithWipe(item.href);
              }
            }}
            className="relative rounded-full px-5 py-2 text-xs font-semibold sm:text-sm"
          >
            {active && (
              <motion.span
                layoutId="persona-pill"
                className="absolute inset-0 rounded-full bg-accent shadow-lg shadow-accent/30"
                transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
              />
            )}
            <span className={`relative z-10 transition-colors duration-200 ${active ? "text-base" : "text-muted hover:text-ink"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );

  if (variant === "inline") return control;

  return (
    <motion.div
      initial={{ y: 80, x: "-50%", opacity: 0 }}
      animate={{ y: isMobile ? 24 : 24, x: "-50%", opacity: 1 }}
      transition={{ delay: 0.6, type: "spring", bounce: 0.25, duration: 0.7 }}
      className="fixed bottom-6 left-1/2 z-40"
    >
      {control}
    </motion.div>
  );
}
