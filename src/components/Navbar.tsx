"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ChevronDown, Globe, X } from "lucide-react";
import { site } from "@/lib/data";
import { languages } from "@/lib/data";
import { useTransition } from "./TransitionProvider";

const links = [
  { label: "Professional", href: "/" },
  { label: "Personal", href: "/personal" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { navigateWithWipe } = useTransition();
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState(languages[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-hairline bg-base/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Wordmark: name + amber terminal dot */}
        <Link
          href="/"
          onClick={(e) => {
            if (pathname !== "/") {
              e.preventDefault();
              navigateWithWipe("/");
            }
          }}
          className="group flex items-baseline gap-0.5 text-base font-bold tracking-tight text-white"
        >
          {site.firstName}
          {/* Amber terminal dot — pings while the wordmark is hovered */}
          <span className="relative inline-flex h-2 w-2">
            <span
              aria-hidden
              className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 group-hover:animate-ping"
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125" />
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 sm:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={(e) => {
                    if (pathname !== link.href) {
                      e.preventDefault();
                      navigateWithWipe(link.href);
                    }
                  }}
                  className={`group relative text-sm transition-colors duration-200 ${
                    active ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-0.5 transition-all duration-300 ${
                      active
                        ? "w-full bg-accent"
                        : "w-0 bg-ink/60 group-hover:w-full"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          className="flex sm:hidden items-center justify-center rounded-lg p-2 text-muted transition-colors hover:text-ink"
        >
          {mobileOpen ? (
            <X size={22} strokeWidth={1.8} />
          ) : (
            <Menu size={22} strokeWidth={1.8} />
          )}
        </button>

        {/* Language dropdown */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
            className="flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Globe size={15} strokeWidth={1.8} />
            <span className="font-medium">{lang.code}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
            />
          </button>
          {langOpen && (
            <ul
              role="listbox"
              className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-hairline bg-surface py-1 shadow-xl shadow-black/40"
            >
              {languages.map((l) => (
                <li key={l.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={l.code === lang.code}
                    onClick={() => {
                      setLang(l);
                      setLangOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-surface-2 ${
                      l.code === lang.code ? "text-accent" : "text-muted"
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-xs opacity-70">{l.code}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="sm:hidden overflow-hidden"
          >
            <ul className="mx-auto mt-2 flex flex-col gap-1 px-4 pb-4">
              {links.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateWithWipe(link.href);
                        setMobileOpen(false);
                      }}
                      className={`flex w-full items-center rounded-lg px-4 py-3 text-sm transition-colors ${
                        active ? "text-ink" : "text-muted hover:text-ink hover:bg-surface/50"
                      }`}
                    >
                      {link.label}
                      {active && (
                        <span className="ml-auto inline-block h-0.5 w-5 bg-accent" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
