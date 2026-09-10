"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Animated thank you section with:
 * - Floating particle hearts/stars
 * - Text that builds character by character
 * - Gentle pulse/breathing effect on the main message
 * - Fade-out particles that drift upward
 */
export default function ThankYouAnimation() {
  const [visible, setVisible] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number; color: string }[]>([]);
  const message = "Thank you for visiting ✨";

  const makeParticles = () =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 3,
      duration: Math.random() * 4 + 3,
      color: Math.random() > 0.5 ? "#ffb454" : "#f472b6",
    }));

  // Generate the particles in the timeout callback (not synchronously in the
  // effect body) so the first paint stays deterministic for hydration.
  useEffect(() => {
    const timer = setTimeout(() => {
      setParticles(makeParticles());
      setVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCharIndex((prev) => {
        if (prev >= message.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={visible ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl px-6 py-20 text-center"
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: 0.4,
            }}
            initial={{ opacity: 0, y: 100, scale: 0 }}
            animate={visible ? {
              opacity: [0, 0.4, 0],
              y: [-100, -200],
              scale: [0, 1, 0],
            } : {}}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Main thank you text with character reveal */}
      <AnimatePresence mode="wait">
        <motion.div
          key="thank-you"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <p className="text-sm text-muted sm:text-base">For visiting my profile</p>
          <h2 className="mt-3 text-center text-4xl font-extrabold leading-tight sm:text-6xl">
            <span className="inline-block animate-pulse bg-gradient-to-r from-purple-300 via-amber-300 to-pink-500 bg-clip-text text-transparent">
              {message.slice(0, charIndex)}
            </span>

            {/* Sparkle icons to the right */}
            <span className="inline-block ml-3 align-middle" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-pink-500">
                <path d="M8 0L9.5 6.5H16L9.5 13.5L8 20L6.5 13.5L0 16L6.5 6.5L8 0Z" fill="currentColor"/>
              </svg>
            </span>
            <span className="inline-block ml-1 align-middle" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-pink-400">
                <path d="M12 0L14.5 11H24L14.5 19.5L12 32L9.5 19.5L0 24L9.5 11H12Z" fill="currentColor"/>
              </svg>
            </span>
          </h2>
        </motion.div>
      </AnimatePresence>

      {/* Subtle decorative elements */}
      <div className="absolute -top-4 left-8 h-8 w-8 rounded-full border border-accent/20" />
      <div className="absolute -bottom-4 right-8 h-12 w-12 rounded-full border border-accent/10" />
      <div className="absolute top-1/2 -right-6 h-6 w-6 rounded-full bg-accent/10" />
      <div className="absolute bottom-1/3 -left-8 h-4 w-4 rounded-full bg-pink-500/10" />
    </motion.div>
  );
}
