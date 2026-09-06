"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  children: ReactNode;
  messages: string[];
  /** Hover dwell time before the bubble spawns (ms). */
  delay?: number;
  className?: string;
};

/**
 * Easter egg: hold the cursor over the trigger and a small dark bubble
 * appears, follows the cursor, and cycles through friendly one-liners.
 */
export default function CursorTooltip({ children, messages, delay = 600, className }: Props) {
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [msgIndex, setMsgIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cycle messages while visible
  useEffect(() => {
    if (!active || messages.length < 2) return;
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % messages.length), 1600);
    return () => clearInterval(id);
  }, [active, messages.length]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <>
      <span
        className={className}
        onMouseEnter={(e) => {
          setPos({ x: e.clientX, y: e.clientY });
          timer.current = setTimeout(() => setActive(true), delay);
        }}
        onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => {
          if (timer.current) clearTimeout(timer.current);
          setActive(false);
        }}
      >
        {children}
      </span>

      <AnimatePresence>
        {active && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.35 }}
            className="pointer-events-none fixed z-[70] rounded-lg border border-accent/40 bg-surface px-3 py-1.5 text-xs text-accent shadow-lg shadow-black/50"
            style={{
              left: pos.x + 16,
              top: pos.y - 8,
              transform: "translateY(-100%)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={msgIndex}
                initial={{ opacity: 0, filter: "blur(4px)", y: 3 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                exit={{ opacity: 0, filter: "blur(4px)", y: -3 }}
                transition={{ duration: 0.22 }}
                className="block whitespace-nowrap"
              >
                {messages[msgIndex % messages.length]}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
