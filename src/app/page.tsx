"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Sparkles,
  User,
} from "lucide-react";
import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import EducationAccordion from "@/components/EducationAccordion";
import HighlighterName from "@/components/HighlighterName";
import CursorTooltip from "@/components/CursorTooltip";
import SocialIcons from "@/components/SocialIcons";
import Reveal from "@/components/Reveal";
import { bio, projects, site, skills, stats } from "@/lib/data";

export default function ProfessionalPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-6xl px-4 pt-28 sm:px-6 sm:pt-32"
    >
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-muted"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
            {site.role}
          </motion.p>

          <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="block"
            >
              Hello I&apos;m
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="mt-1 block"
            >
              <CursorTooltip
                messages={["hey there 👋", "you found me ;)", "have a great day ✨"]}
              >
                <HighlighterName text={site.name} />
                <span className="inline-block ml-1.5 h-2 w-2 rounded-full bg-accent translate-y-[-0.1em]" />
              </CursorTooltip>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-5 text-sm text-muted sm:text-base"
          >
            {site.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-5"
          >
            <a href={site.cvUrl} className="btn-outline">
              View CV <ArrowDown size={15} />
            </a>
            <SocialIcons />
          </motion.div>
        </div>

        {/* Profile photo with slowly rotating dashed ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="relative mx-auto lg:mx-0"
        >
          <CursorTooltip messages={["📸 that's me!", "✌️ hello from Nepal"]}>
            <div className="relative h-64 w-64 sm:h-80 sm:w-80">
              {/* Rotating dashed ring */}
              <span
                aria-hidden
                className="animate-spin-slow absolute -inset-3 rounded-full border-2 border-dashed border-accent"
              />
              <span
                aria-hidden
                className="absolute -inset-3 rounded-full border border-accent/20"
              />
              <Image
                src="/profile.png"
                alt="Profile photo of Nessy"
                width={640}
                height={640}
                preload
                sizes="(max-width: 640px) 256px, 320px"
                className="h-full w-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://api.dicebear.com/9.x/notionists/svg?seed=Nessy&backgroundColor=14171d";
                }}
              />
            </div>
          </CursorTooltip>
        </motion.div>
      </section>

      {/* ── Stat strip ───────────────────────────────────────── */}
      <Reveal className="mt-20">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 border-y border-hairline py-12 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <dd
                className={`text-5xl font-extrabold sm:text-6xl ${
                  s.emphasized ? "text-accent" : "text-ink"
                }`}
              >
                {s.value}
              </dd>
              <dt className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </Reveal>

      {/* ── Education ────────────────────────────────────────── */}
      <section className="mt-24">
        <Reveal>
          <SectionHeading icon={GraduationCap} title="Education" kicker="where I studied" />
          <EducationAccordion />
        </Reveal>
      </section>

      {/* ── Bio ──────────────────────────────────────────────── */}
      <section className="mt-24">
        <Reveal>
          <SectionHeading icon={User} title="About me" kicker="short profile" />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="glass-card rounded-2xl p-8 lg:col-span-3">
              <p className="leading-relaxed text-ink/90">{bio.professional}</p>
              <p className="mt-4 leading-relaxed text-muted">
                Currently: building realtime tools, writing about DX, and mentoring juniors
                at local meetups.
              </p>
            </div>
            <div className="glass-card flex items-center justify-center rounded-2xl p-8 lg:col-span-2">
              <Image
                src="/desk.jpg"
                alt="My workspace"
                width={800}
                height={530}
                className="max-h-56 w-full rounded-xl object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Skills ───────────────────────────────────────────── */}
      <section className="mt-24">
        <Reveal>
          <SectionHeading icon={Sparkles} title="Skills" kicker="tools of the trade" />
          <ul className="flex flex-wrap gap-3">
            {skills.map((s) => (
              <li key={s}>
                <span className="chip">{s}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ── Projects ─────────────────────────────────────────── */}
      <section className="mt-24">
        <Reveal>
          <SectionHeading icon={FolderGit2} title="Projects" kicker="selected work" />
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {projects.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <motion.a
                href={p.href}
                target={p.href.startsWith("http") ? "_blank" : undefined}
                rel={p.href.startsWith("http") ? "noopener noreferrer" : undefined}
                whileHover={{ y: -5 }}
                className="group flex h-full flex-col rounded-2xl border border-hairline bg-surface p-6 transition-colors duration-300 hover:border-accent/60"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/50 bg-accent/10 text-accent">
                    <Briefcase size={18} />
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted transition-colors group-hover:text-accent">
                    {p.year} <ArrowUpRight size={14} />
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {p.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {p.stack.map((t) => (
                    <li key={t} className="chip !text-[11px]">
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
