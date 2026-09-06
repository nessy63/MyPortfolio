import { NextResponse } from "next/server";
import { getResend, CONTACT_TO } from "@/lib/resend";

export const runtime = "nodejs";

/* ── Minimal in-memory rate limit: 5 submissions / 10 min per IP ── */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

/* ── Validation ─────────────────────────────────────────────────── */
type Payload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  website?: unknown; // honeypot — must be empty
};

const NAME_RE = /^[\p{L}\p{M}'. -]{2,80}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MESSAGE_LEN = 5000;

function parse(body: Payload) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!NAME_RE.test(name)) return { error: "Please provide your name." } as const;
  if (!EMAIL_RE.test(email) || email.length > 254)
    return { error: "Please provide a valid email address." } as const;
  if (message.length < 2 || message.length > MAX_MESSAGE_LEN)
    return { error: "Message must be between 2 and 5000 characters." } as const;

  return { name, email, message } as const;
}

/* Strip control chars / newlines so user input can't forge headers. */
function sanitize(input: string) {
  return input.replace(/[\u0000-\u001F\u007F]/g, " ").trim();
}

export async function POST(request: Request) {
  // 1. Rate limit
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages — try again a bit later." },
      { status: 429 }
    );
  }

  // 2. Parse + validate
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parse(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Honeypot: the hidden "website" field must stay empty. Bots that
  // auto-fill every input trip this. Pretend success so they don't adapt.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // 3. Server-side API key check
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set.");
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 }
    );
  }

  // 4. Send
  try {
    const { error } = await getResend().emails.send({
      // Onboarding sender works before domain verification; swap in
      // something like "Contact <notify@yourdomain.com>" once verified.
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: [CONTACT_TO],
      replyTo: parsed.email,
      subject: `New message from ${sanitize(parsed.name)} — portfolio`,
      text: [
        `Name: ${parsed.name}`,
        `Email: ${parsed.email}`,
        "",
        parsed.message,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json(
        { error: "Failed to send your message. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
