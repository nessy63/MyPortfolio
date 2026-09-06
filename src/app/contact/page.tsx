"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Mail, MapPin, Send } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import SocialIcons from "@/components/SocialIcons";
import { site } from "@/lib/data";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          website: data.get("website"), // honeypot
        }),
      });

      const json = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setErrorMsg(json.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("sent");
      form.reset();
      window.setTimeout(() => setStatus("idle"), 6000);
    } catch {
      setErrorMsg("Network error — check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 sm:px-6 sm:pt-32">
      <SectionHeading icon={Mail} title="Contact" kicker="open inbox" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-muted">
          Got a project, a role, or just want to trade playlists? My inbox is
          always open — I usually reply within a day.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <span className="chip !text-ink">
            <Mail size={14} className="mr-2 text-accent" /> {site.email}
          </span>
          <span className="chip !text-ink">
            <MapPin size={14} className="mr-2 text-accent" /> {site.location}
          </span>
        </div>

        {/* Terminal-style form */}
        <form onSubmit={onSubmit} className="glass-card relative mt-10 rounded-2xl p-6 sm:p-8">
          <p className="mb-6 text-sm text-muted">
            <span className="text-accent">$</span> ./send-message --to {site.shortName.toLowerCase()}
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-muted">--name</span>
              <input
                required
                name="name"
                autoComplete="name"
                placeholder="Ada Lovelace"
                className="w-full rounded-xl border border-hairline bg-base px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-muted">--email</span>
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-hairline bg-base px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent"
              />
            </label>
          </div>

          {/* Honeypot — hidden from humans, irresistible to bots */}
          <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0">
            <label>
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </label>
          </div>

          <label className="mt-5 block text-sm">
            <span className="mb-2 block text-muted">--message</span>
            <textarea
              required
              name="message"
              rows={5}
              placeholder="Hey Nessy, I have this idea..."
              className="w-full resize-none rounded-xl border border-hairline bg-base px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent"
            />
          </label>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="submit" disabled={status === "sending"} className="btn-outline disabled:cursor-not-allowed disabled:opacity-60">
              {status === "sending" ? (
                <>
                  Sending <Loader2 size={14} className="animate-spin" />
                </>
              ) : (
                <>
                  Send message <Send size={14} />
                </>
              )}
            </button>

            {status === "sent" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-accent"
                role="status"
              >
                <CheckCircle2 size={16} /> Message sent — talk soon!
              </motion.p>
            )}
            {status === "error" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-pink"
                role="alert"
              >
                <AlertCircle size={16} /> {errorMsg}
              </motion.p>
            )}
          </div>
        </form>

        <div className="mt-10 flex items-center justify-between">
          <p className="text-sm text-muted">Elsewhere on the internet:</p>
          <SocialIcons size={38} />
        </div>
      </motion.div>
    </div>
  );
}
