# Pre-deploy security checklist

Run `security-audit.sh` first — it catches most of the mechanical stuff.
These are the things that need a human decision instead.

## Accounts & access
- [ ] 2FA enabled on GitHub (or wherever the repo lives)
- [ ] 2FA enabled on your hosting account (Vercel/Netlify/etc.)
- [ ] 2FA + a registrar lock enabled on your domain registrar
- [ ] If anyone else has push access to the repo or deploy access to the host, you trust them with production

## Domain & TLS
- [ ] HTTPS is enforced and HTTP requests redirect to HTTPS (most hosts do this by default — confirm, don't assume)
- [ ] DNSSEC enabled on your domain if your registrar/DNS provider supports it
- [ ] A CAA DNS record limiting which Certificate Authorities can issue certs for your domain

## Secrets
- [ ] Rotate any API key/token that was ever committed to the repo, even if it's since been removed — `git log` still has it. `security-audit.sh` flags this via `gitleaks` if installed.
- [ ] Any secret used by the site (form-handler API key, analytics token, etc.) is set as an environment variable on the host, not in the repo

## Forms / anything user-submitted
- [ ] Contact / "Write a Letter" form validates and sanitizes input server-side, not just in the browser
- [ ] Form has rate-limiting or a CAPTCHA/honeypot (spam bots will find a public form fast)
- [ ] Form doesn't email you raw, unescaped HTML from user input

## Content
- [ ] Personal photos in `/public` have EXIF/GPS metadata stripped (a photo with location data quietly leaks where you live/work)
- [ ] No personal info in the repo you wouldn't want public — resume PDFs, old drafts, `.DS_Store`/screenshot files with sensitive context, etc.
- [ ] robots.txt reflects what you actually want indexed (e.g. don't accidentally block your whole site, or expose a `/drafts` folder you assumed was hidden)

## Post-deploy
- [ ] Re-run `security-audit.sh . https://yourdomain.com` against the live URL to confirm headers actually shipped (a header set locally in dev doesn't guarantee the CDN/host passes it through unmodified)
- [ ] Spot-check the deployed CSP doesn't break anything (fonts, embedded video, images) — an over-strict CSP fails silently in the browser console, not loudly
- [ ] Add `/.well-known/security.txt` with a contact, so a researcher who finds something has a way to reach you instead of going public first
- [ ] Optional: set up a free uptime/security monitor (e.g. UptimeRobot, Cloudflare) so you hear about outages or weirdness before a visitor tells you
