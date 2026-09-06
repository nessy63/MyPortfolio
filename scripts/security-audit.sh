#!/usr/bin/env bash
#
# security-audit.sh — pre-deploy security audit for a Next.js / static portfolio site
#
# Usage:
#   ./security-audit.sh [project_dir] [deployed_url]
#
#   project_dir    Path to your project (default: current directory)
#   deployed_url   Optional. If given, also checks live HTTP security headers
#                  once the site is deployed, e.g.:
#                  ./security-audit.sh . https://yourname.dev
#
# Exit code: 1 if any FAIL, otherwise 0 (warnings don't block).
# Note: -e/pipefail are deliberately NOT set — this script is a reporter,
# it should always run to completion and print a full summary.
set -u

PROJECT_DIR="${1:-.}"
DEPLOYED_URL="${2:-}"

PASS=0
WARN=0
FAIL=0

pass() { printf "  \033[32m✔\033[0m %s\n" "$1"; PASS=$((PASS+1)); }
warn() { printf "  \033[33m⚠\033[0m %s\n" "$1"; WARN=$((WARN+1)); }
fail() { printf "  \033[31m✘\033[0m %s\n" "$1"; FAIL=$((FAIL+1)); }
section() { printf "\n\033[1m%s\033[0m\n" "$1"; }

cd "$PROJECT_DIR" || { echo "Cannot cd into $PROJECT_DIR"; exit 1; }

EXCLUDES=(--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=build --exclude-dir=out)

# ---------------------------------------------------------------------------
section "1. Secrets & environment files"
# ---------------------------------------------------------------------------

shopt -s nullglob
ENV_FILES=(.env .env.local .env.development .env.production .env.*.local)
shopt -u nullglob

if [ ${#ENV_FILES[@]} -eq 0 ]; then
  pass "No .env files present in working tree"
else
  if [ -d .git ]; then
    for f in "${ENV_FILES[@]}"; do
      if git check-ignore -q "$f" 2>/dev/null; then
        pass "$f is gitignored"
      else
        fail "$f exists and is NOT gitignored — it can be committed"
      fi
    done
  else
    warn "Not a git repo (or git not available) — could not verify .env is ignored"
  fi
fi

# scan tracked git history entry point too (working tree only — see note below)
MATCHES=$(grep -RInE "(api[_-]?key|secret|token|password|private[_-]?key)\s*[:=]\s*['\"][A-Za-z0-9_\-]{10,}['\"]" \
  "${EXCLUDES[@]}" . 2>/dev/null)
if [ -n "$MATCHES" ]; then
  fail "Possible hardcoded secret(s) found in source:"
  echo "$MATCHES" | sed 's/^/      /'
else
  pass "No obvious hardcoded secrets in current source"
fi

if command -v gitleaks >/dev/null 2>&1; then
  echo "  Running gitleaks against full git history..."
  if gitleaks detect --source . --no-banner -v >/tmp/gitleaks_out.txt 2>&1; then
    pass "gitleaks found no secrets in git history"
  else
    fail "gitleaks found potential secrets in git history — see /tmp/gitleaks_out.txt"
  fi
else
  warn "gitleaks not installed — working-tree scan above does NOT cover git history." \
       " Install gitleaks (https://github.com/gitleaks/gitleaks) and re-run for a full history scan."
fi

if [ -d .git ]; then
  TRACKED_ENV=$(git ls-files 2>/dev/null | grep -E "(^|/)\.env" )
  if [ -n "$TRACKED_ENV" ]; then
    fail "Env file(s) currently tracked by git: $TRACKED_ENV"
  else
    pass "No .env files currently tracked by git"
  fi
fi

# ---------------------------------------------------------------------------
section "2. Dependencies"
# ---------------------------------------------------------------------------

if [ -f package.json ]; then
  if command -v npm >/dev/null 2>&1; then
    AUDIT_JSON=$(npm audit --omit=dev --json 2>/dev/null)
    HIGH=$(echo "$AUDIT_JSON" | grep -o '"high":[0-9]*' | head -1 | grep -o '[0-9]*$')
    CRIT=$(echo "$AUDIT_JSON" | grep -o '"critical":[0-9]*' | head -1 | grep -o '[0-9]*$')
    HIGH=${HIGH:-0}; CRIT=${CRIT:-0}
    if [ "$HIGH" -gt 0 ] || [ "$CRIT" -gt 0 ]; then
      fail "npm audit: $CRIT critical, $HIGH high severity vulnerabilities — run 'npm audit fix'"
    else
      pass "No high/critical npm vulnerabilities in production deps"
    fi
  else
    warn "npm not found — skipped dependency audit"
  fi
else
  warn "No package.json — skipped dependency audit"
fi

# ---------------------------------------------------------------------------
section "3. Source hygiene"
# ---------------------------------------------------------------------------

INCLUDES=(--include=*.js --include=*.jsx --include=*.ts --include=*.tsx)

CONSOLE=$(grep -RIn "${INCLUDES[@]}" "${EXCLUDES[@]}" -E "console\.(log|debug)\(" . 2>/dev/null | wc -l | tr -d ' ')
if [ "${CONSOLE:-0}" -gt 0 ]; then
  warn "$CONSOLE console.log/debug statement(s) found — strip before shipping (may leak internals)"
else
  pass "No stray console.log/debug statements"
fi

DANGEROUS=$(grep -RIn "${INCLUDES[@]}" "${EXCLUDES[@]}" -E "dangerouslySetInnerHTML|eval\(|document\.write\(" . 2>/dev/null | wc -l | tr -d ' ')
if [ "${DANGEROUS:-0}" -gt 0 ]; then
  warn "$DANGEROUS use(s) of dangerouslySetInnerHTML / eval / document.write — confirm inputs are sanitized (XSS risk)"
else
  pass "No dangerouslySetInnerHTML / eval / document.write found"
fi

TARGETBLANK=$(grep -RIn "${INCLUDES[@]}" "${EXCLUDES[@]}" "target=\"_blank\"" . 2>/dev/null | grep -Lv "noopener" 2>/dev/null | wc -l | tr -d ' ')
# fallback simpler check: any target=_blank without rel=noopener on the same line
TB_ALL=$(grep -RIn "${INCLUDES[@]}" "${EXCLUDES[@]}" "target=\"_blank\"" . 2>/dev/null | wc -l | tr -d ' ')
TB_UNSAFE=$(grep -RIn "${INCLUDES[@]}" "${EXCLUDES[@]}" "target=\"_blank\"" . 2>/dev/null | grep -v "noopener" | wc -l | tr -d ' ')
if [ "${TB_UNSAFE:-0}" -gt 0 ]; then
  warn "$TB_UNSAFE link(s) with target=\"_blank\" missing rel=\"noopener noreferrer\" (tabnabbing risk)"
elif [ "${TB_ALL:-0}" -gt 0 ]; then
  pass "External links using target=_blank have noopener/noreferrer"
fi

# ---------------------------------------------------------------------------
section "4. Framework / hosting config"
# ---------------------------------------------------------------------------

if [ -f next.config.js ] || [ -f next.config.mjs ] || [ -f next.config.ts ]; then
  CFG_FILE=$(ls next.config.* 2>/dev/null | head -1)
  if grep -q "headers" "$CFG_FILE" 2>/dev/null; then
    pass "$CFG_FILE defines a headers() function"
  else
    fail "$CFG_FILE has no headers() function — no CSP/HSTS/etc. configured. See next.config.security-example.js"
  fi
  if grep -q "poweredByHeader" "$CFG_FILE" 2>/dev/null; then
    pass "poweredByHeader is explicitly configured"
  else
    warn "Set poweredByHeader: false in $CFG_FILE to stop advertising 'X-Powered-By: Next.js'"
  fi
else
  warn "No next.config.(js|mjs|ts) found — if you're on Next.js, security headers must live in vercel.json instead"
fi

if [ -f public/robots.txt ]; then
  pass "robots.txt present"
else
  warn "No public/robots.txt — add one (even a permissive one) to control crawler behavior deliberately"
fi

if [ -f public/.well-known/security.txt ] || [ -f public/security.txt ]; then
  pass "security.txt present for responsible disclosure"
else
  warn "No security.txt (RFC 9116) — consider adding public/.well-known/security.txt with a contact for vuln reports"
fi

# ---------------------------------------------------------------------------
section "5. API routes / forms"
# ---------------------------------------------------------------------------

API_DIRS=$(find . \( -path "*/node_modules" -o -path "*/.next" -o -path "*/.git" \) -prune -o \
  -type d \( -path "*/pages/api" -o -path "*/app/api" \) -print 2>/dev/null)

if [ -n "$API_DIRS" ]; then
  echo "$API_DIRS" | sed 's/^/  found: /'
  RL=$(grep -RIl -E "rate.?limit" $API_DIRS 2>/dev/null | wc -l | tr -d ' ')
  if [ "${RL:-0}" -eq 0 ]; then
    warn "API route(s) found with no obvious rate-limiting — a contact form without it is an easy spam/abuse target"
  else
    pass "Rate-limiting reference found in API routes"
  fi

  HONEYPOT=$(grep -RIl -E "honeypot|turnstile|recaptcha|hcaptcha" $API_DIRS . --include=*.tsx --include=*.jsx 2>/dev/null | wc -l | tr -d ' ')
  if [ "${HONEYPOT:-0}" -eq 0 ]; then
    warn "No CAPTCHA/honeypot reference found — consider one on any public contact/letter form"
  else
    pass "Anti-spam mechanism (honeypot/CAPTCHA) reference found"
  fi
else
  pass "No API routes found (fully static site, or forms handled by a third party) — smaller attack surface"
fi

# ---------------------------------------------------------------------------
section "6. Media metadata"
# ---------------------------------------------------------------------------

if command -v exiftool >/dev/null 2>&1; then
  IMG_WITH_GPS=$(find public -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) 2>/dev/null -exec exiftool -GPSLatitude -s3 {} \; 2>/dev/null | grep -v '^$' | wc -l | tr -d ' ')
  if [ "${IMG_WITH_GPS:-0}" -gt 0 ]; then
    fail "$IMG_WITH_GPS image(s) in /public still contain GPS EXIF data — strip with 'exiftool -gps:all= -overwrite_original <file>'"
  else
    pass "No GPS EXIF data found in /public images"
  fi
else
  warn "exiftool not installed — could not check images for leaked EXIF/GPS metadata. Install it (brew/apt install exiftool) and re-run."
fi

# ---------------------------------------------------------------------------
if [ -n "$DEPLOYED_URL" ]; then
  section "7. Live security headers ($DEPLOYED_URL)"
  if command -v curl >/dev/null 2>&1; then
    HEADERS=$(curl -sIL "$DEPLOYED_URL" 2>/dev/null)
    check_header() {
      if echo "$HEADERS" | grep -qi "^$1:"; then
        pass "$1 present"
      else
        fail "$1 missing"
      fi
    }
    check_header "Strict-Transport-Security"
    check_header "X-Content-Type-Options"
    check_header "Content-Security-Policy"
    check_header "Referrer-Policy"
    check_header "Permissions-Policy"

    if echo "$HEADERS" | grep -qi "^X-Frame-Options:"; then
      pass "X-Frame-Options present"
    elif echo "$HEADERS" | grep -qi "frame-ancestors"; then
      pass "frame-ancestors set via CSP (covers clickjacking instead of X-Frame-Options)"
    else
      fail "Neither X-Frame-Options nor CSP frame-ancestors present — site is embeddable in a clickjacking iframe"
    fi

    if echo "$HEADERS" | grep -qi "^x-powered-by:"; then
      warn "X-Powered-By header is exposed — reveals your framework to attackers"
    else
      pass "X-Powered-By not exposed"
    fi
  else
    warn "curl not found — skipped live header check"
  fi
else
  section "7. Live security headers"
  warn "No deployed URL given — skipped. Re-run as: ./security-audit.sh . https://yourdomain.com"
fi

# ---------------------------------------------------------------------------
section "Summary"
# ---------------------------------------------------------------------------
echo "  PASS: $PASS   WARN: $WARN   FAIL: $FAIL"
echo
if [ "$FAIL" -gt 0 ]; then
  echo "❌ Fix the failed checks above before deploying."
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo "⚠️  No blockers, but review the warnings above."
  exit 0
else
  echo "✅ All automated checks passed. Still work through SECURITY-CHECKLIST.md for the manual items."
  exit 0
fi
