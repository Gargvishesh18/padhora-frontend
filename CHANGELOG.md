# Padhora Frontend — Changelog

Running log of notable frontend changes and why they were made. Static HTML/CSS/JS site, no build step. Pages: `index.html` (homepage), `login.html`, `signup.html`, `dashboard.html` (tutor-facing), `admin.html` (internal-only, not linked from public flow).

## 2026-09-04

**Phase 0 — launch-readiness cleanup: stop advertising things we don't have**
- **Tutor count tile** (`index.html` trust bar): rendered a literal `–` on load, and `render()` overwrote it with the *filtered search result* count (including `0` on an empty search) — so the first number a parent saw was either a dash or a zero. Tile is now `hidden` by default and only `refreshTutorCountStat()` may unhide it, at `TUTOR_COUNT_STAT_MIN = 40`. Removed both stray writers in `render()`; a filtered result count was never the right value for "Tutors onboarded" anyway.
- **"What parents say" section** deleted. It was an honest empty state, but a whole section whose message is "we have no reviews" is not something to lead a parent through.
- **Star ratings removed from tutor cards and the profile modal.** `starString(t.rating || 0)` rendered `☆☆☆☆☆` on *every* listing — the backend has no `rating`, `reviews` or `testimonials` field at all (verified by grep across `padhora-backend/src`), so this was five empty stars, always. Dropped the rating row, the dead `testimonials` block in the modal, `starString()`, and the now-unused `.rating-row` / `.modal-reviews` / `.mini-review` CSS.
- **Ratings FAQ** rewritten from future tense ("After a tuition period ends, parents can leave a rating…") to the present truth: we have no reviews yet and won't invent them — judge on the profile, the verification, and your own intro call.
- **"Zero fees for parents"** card no longer mentions tutors boosting listings. Monetisation talk does not belong on the parent-facing page, and the leaning model is lead unlock, not paid placement.
- **Tutor CTA** reframed from "List your tuition — it's free" (reads as free forever) to Founding-100 framing: free *during our launch phase*, and listing will never be the thing we charge for. Same note added to `signup.html`.
- **Kept: the "My requests" nav link.** Read the flow before touching it — `openMyRequests()` is a real, working parent enquiry tracker (`/api/enquiries/track/{token}`, `/mine`, `/request-otp`, `/verify-otp`) with device-local tracking plus optional phone verification. Nothing placeholder about it.
- **Trust bar mobile**: dropping to 3 items left a lone left-aligned item on the wrapped row. Centered the bar at ≤640px so both the 3-item and (future) 4-item states read as deliberate.

## 2026-09-03

**Animate clear button and mobile nav dropdown; fix stuck-open nav on back nav** (`add9313`)
- Locality clear (✕) button and mobile hamburger dropdown were both toggled with raw `style.display = 'none'/'flex'` in JS — can't be transitioned, so they popped in/out instantly.
- Clear button now driven by a `.show` class with opacity+scale transition. Mobile nav dropdown now uses opacity+transform+visibility.
- Fixed report of "go back and the dropdown is still there": bfcache restores the page in whatever transient DOM state it was frozen in, and scripts don't re-run on that kind of restore, so an open nav menu stayed open. Added a `pageshow` listener that calls `closeMobileNav()` on every show, bfcache included — same class of bug as the earlier page-fade bfcache fix.

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
