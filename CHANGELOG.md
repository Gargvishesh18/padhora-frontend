# Padhora Frontend — Changelog

Running log of notable frontend changes and why they were made. Static HTML/CSS/JS site, no build step. Pages: `index.html` (homepage), `login.html`, `signup.html`, `dashboard.html` (tutor-facing), `admin.html` (internal-only, not linked from public flow).

## 2026-09-03

**Page-transition fade** (`0b59b86`, bfcache fix `a3141aa`)
- Added shared `transitions.js`: fades the outgoing page out (~160ms) before navigating to another internal `.html` page, and fades each page in on load. Fixes hard instant page-swaps between `index.html` → `login.html`/`signup.html`/`dashboard.html` (the in-page modal/chip/hover interactions already animated smoothly; page-to-page navigation didn't).
- Skips anchors (`#...`), external links, `target="_blank"`, downloads. Fully inert under `prefers-reduced-motion`.
- Wired into index/login/signup/dashboard via a head-inline class toggle (avoids flash-of-unstyled-content). `admin.html` intentionally left out.
- **Follow-up fix**: browser back/forward (trackpad swipe, back button) can restore a page from bfcache in the exact DOM state it was frozen in — if that was mid-fade-out, the page stayed invisible until a manual reload. Fixed by also clearing the fade class on the `pageshow` event, which fires on bfcache restores (unlike `DOMContentLoaded`, which doesn't re-run).

**Unify search card, mobile nav menu, search UX, and result animations** (`85b7553`)
- Merged locality search + type-of-help chips + mode chips into one visually unified search card; clearer non-jargon copy ("select more than one" instead of "tap all that apply").
- Search bar UX: Enter-to-search, "use my current location" (geolocation + reverse geocode), clear (✕) button.
- Loading state: pencil-writing animation with a quick flourish when results land, then staggered card + verified-stamp reveal ("teacher checking papers" feel). All respects `prefers-reduced-motion`.
- Mobile hamburger nav — previously "My requests"/"Tutor login" were completely unreachable on mobile (nav fully hidden, no toggle existed).
- Compact mobile layout for "Why parents choose Padhora" / "How Padhora works" (CSS Grid, icon spans both text rows) — ~41–49% height reduction. Tutor result cards deliberately left as-is; their height reflects genuine content density, not wasted whitespace.

**Trust-bar mobile layout + stale placeholder** (earlier same day)
- Fixed trust-bar wrapping unevenly (3+1) on narrow widths by switching to CSS Grid.
- Fixed mode-select placeholder still reading "Where?" — updated to "Select mode of tuition".

## Backend notes (for reference, not this repo)
- `padhora-backend` README says admin auth / CORS are "not done yet" — that's stale. Both are actually implemented: `/admin/*` routes check an `X-Admin-Key` header in `TutorController`, and CORS is locked to the Vercel origin in `WebConfig`. Spring Security's filter chain itself permits all requests; the admin check is enforced manually in the controller, not via `authorizeHttpRequests`.
