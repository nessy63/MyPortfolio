import { Resend } from "resend";

/**
 * Server-only Resend client. Importing this anywhere that isn't a
 * server component / route handler will leak the API key to the client.
 *
 * The client is created lazily on first request so builds and static
 * generation work fine before RESEND_API_KEY is configured.
 */
let client: Resend | null = null;

export function getResend(): Resend {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

/** Where contact submissions are delivered. */
export const CONTACT_TO = process.env.CONTACT_TO_EMAIL ?? "hello@nessy.dev";
