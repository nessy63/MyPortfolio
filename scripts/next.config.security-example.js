/**
 * next.config.security-example.js
 *
 * Reference security-headers config for a Next.js portfolio site.
 * Merge the `headers()` function (and the two flags below it) into your
 * real next.config.js — don't just drop this file in as-is.
 *
 * After deploying, verify these actually reach the browser with:
 *   ./security-audit.sh . https://yourdomain.com
 * or manually: curl -I https://yourdomain.com
 */

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: https:;
  media-src 'self';
  connect-src 'self';
  frame-src www.youtube.com youtube.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Stop advertising the framework in responses
  poweredByHeader: false,

  // Fail the build if there's a type error — don't ship broken types
  typescript: { ignoreBuildErrors: false },

  async headers() {
    return [
      {
        // apply to every route
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
          {
            // Force HTTPS for a year, including subdomains.
            // Only add 'preload' once you've submitted the domain to
            // https://hstspreload.org — it's very hard to reverse.
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Clickjacking protection. Redundant with the CSP
            // frame-ancestors above, but some older browsers only
            // respect this header, not the CSP directive.
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Deny access to browser features you don't use.
            // Add back whatever you actually need (e.g. `fullscreen=(self)`).
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

/**
 * Notes:
 *
 * 1. 'unsafe-inline' on script-src/style-src is a common Next.js/Tailwind
 *    reality (inline styles, hydration scripts) but it does weaken the CSP's
 *    XSS protection. For a stricter setup, migrate to nonce- or hash-based
 *    CSP: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
 *
 * 2. Add any real third-party domains you use (analytics, fonts, video,
 *    image CDN) to the relevant *-src directive above — an overly strict
 *    CSP will just silently break those embeds rather than "fail safe".
 *
 * 3. If you deploy static-export (`next export`) instead of on a Node
 *    server, `headers()` is NOT applied at build time — you'll need to set
 *    these at the host level instead (e.g. a `vercel.json` "headers" block,
 *    Netlify's `_headers` file, or your CDN's config).
 */
