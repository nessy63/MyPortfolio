"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Gamepad2, Music2, Palette, Play } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import WordCycle from "@/components/WordCycle";
import PuzzleCanvas from "@/components/PuzzleCanvas";
import SocialIcons from "@/components/SocialIcons";
import Reveal from "@/components/Reveal";
import { site, hobbies, lifeCards } from "@/lib/data";
import type { Hobby } from "@/lib/data";
import ThankYouAnimation from "@/components/ThankYouAnimation";

const traits = ["curious", "a builder", "a night owl", "caffeinated", "playful", "persistent"];

function HobbyMedia({ hobby }: { hobby: Hobby }) {
  if (hobby.media === "puzzle") {
    return (
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-b-2xl bg-[#0d1017] pt-2">
        <PuzzleCanvas height={168} />
      </div>
    );
  }

  if (hobby.media === "video") {
    return (
      <button
        type="button"
        aria-label={`Play ${hobby.title} video`}
        className="group/media relative block w-full flex-1 overflow-hidden rounded-b-2xl"
      >
        <Image
          src="/hobby-music.jpg"
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover/media:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        {/* Centered play button overlay */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/50 text-ink backdrop-blur-sm transition-transform duration-300 group-hover/media:scale-110">
            <Play size={18} className="ml-0.5" />
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="w-full flex-1 overflow-hidden rounded-b-2xl">
      <Image
        src={hobby.title.includes("photography") ? "/hobby-photo.jpg" : "/hobby-food.jpg"}
        alt={hobby.title}
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 hover:scale-105"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

export default function PersonalPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-6xl px-4 pt-28 sm:px-6 sm:pt-32"
    >
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="flex flex-col items-center py-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-base text-muted sm:text-lg"
        >
          Hey, welcome back!
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mt-3 text-3xl font-extrabold sm:text-5xl"
        >
          My nickname is{" "}
          <span className="inline-block rounded-xl border border-accent/50 bg-surface px-3 py-1 text-accent shadow-[0_0_24px_-8px_rgba(255,180,84,0.5)]">
            {site.nickname}
          </span>
        </motion.h1>

        {/* Word-cycling typewriter */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-5 text-lg sm:text-2xl"
        >
          {site.nickname} is <WordCycle words={traits} />
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-sm text-muted"
        >
          Built this website with love <span aria-hidden>💗</span>{" "}
          <span aria-hidden>☕</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-8"
        >
          <a href={`mailto:${site.email}`} className="btn-inverted">
            Write a Letter
          </a>
        </motion.div>
      </section>

      {/* ── Hobbies bento grid ───────────────────────────────── */}
      <section className="mt-20">
        <Reveal>
          <SectionHeading
            icon={Palette}
            title={`${site.shortName}'s Hobbies`}
            kicker="off the clock"
          />
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2">
          {hobbies.map((hobby, i) => (
            <Reveal key={hobby.title} delay={i * 0.08}>
              <article className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-hairline bg-surface transition-colors duration-300 hover:border-accent/50">
                {/* Gamified ribbon badge on the first card */}
                {hobby.badge && (
                  <span className="absolute right-4 top-3 z-10 -skew-x-6 rounded-md bg-accent px-3 py-1 text-xs font-bold text-base shadow-lg">
                    {hobby.badge}
                  </span>
                )}
                <div className="p-6 pb-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    {hobby.media === "puzzle" && <Gamepad2 size={18} className="text-accent" />}
                    {hobby.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{hobby.copy}</p>
                </div>
                <HobbyMedia hobby={hobby} />
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Components of [Name]'s life ──────────────────────── */}
      <section className="mt-24">
        <Reveal>
          <SectionHeading
            icon={Music2}
            title={`Components of ${site.shortName}'s Life`}
            kicker="the mixtape"
          />
        </Reveal>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {lifeCards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.08}>
              <motion.article
                whileHover="hover"
                className="group relative h-72 overflow-hidden rounded-2xl border border-hairline sm:h-80"
              >
                <motion.img
                  src={card.image}
                  alt=""
                  variants={{ hover: { scale: 1.08 } }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                {/* Fallback gradient if no image */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet/25 to-pink/25" />
                {/* Bottom-up dark gradient for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-base via-base/40 to-transparent" />
                <div className="relative flex h-full flex-col justify-between p-5">
                  <span className="w-fit rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-ink backdrop-blur-sm">
                    {card.kicker}
                  </span>
                  <h3 className="text-lg font-bold leading-snug">{card.title}</h3>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Thank You Animation ────────────────────────────────── */}
      <section className="mt-24">
        <Reveal>
          <ThankYouAnimation />
        </Reveal>

        {/* Footer bar: name / toggle / socials */}
        <footer className="mt-12 flex flex-col items-center justify-between gap-6 pb-4 sm:flex-row">
          <p className="flex items-center gap-1.5 text-sm font-bold">
            {site.name}
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          </p>
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} — built with Next.js, Tailwind & Framer Motion
          </p>
          <SocialIcons size={34} />
        </footer>
      </section>
    </motion.div>
  );
}
