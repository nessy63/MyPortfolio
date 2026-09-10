"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { site } from "@/lib/data";
import { useTransition } from "./TransitionProvider";

const links = [
  { label: "Professional", href: "/" },
  { label: "Personal", href: "/personal" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { navigateWithWipe } = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);


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
          aria-expanded={mobileOpen}
          className="flex sm:hidden items-center justify-center rounded-lg p-2 text-muted transition-colors hover:text-ink"
        >
          {mobileOpen ? (
            <X size={22} strokeWidth={1.8} />
          ) : (
            <Menu size={22} strokeWidth={1.8} />
          )}
        </button>
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
