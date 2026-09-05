# Padhora Frontend — Changelog

Running log of notable frontend changes and why they were made. Static HTML/CSS/JS site, no build step. Pages: `index.html` (homepage), `login.html`, `signup.html`, `dashboard.html` (tutor-facing), `admin.html` (internal-only, not linked from public flow).

## 2026-09-05 (3)

**Phase 4 (partial): phone + OTP as the default tutor signup/login**
- `signup.html` and `login.html` gain a Phone / Email tab, Phone first per the
  roadmap's phone-as-default leaning. Phone flow: enter number → "Send code" →
  4-digit code → verified straight into `dashboard.html`, same as the existing
  email path (same `padhora_token`/`padhora_tutor_id` localStorage, same
  redirect). Email tab is untouched — existing accounts keep working exactly
  as before, no migration prompt, since there's no real tutor supply yet to
  migrate.
- Dev-mode OTP is shown inline (`Dev mode... your code is 1234`) exactly like
  the existing parent "My Requests" OTP flow in `index.html`, until a real SMS
  provider is wired up server-side (stays in `PADHORA_OTP_STUB_MODE`).
- Both pages reuse `POST /api/auth/phone/request-otp` / `/verify-otp`, which
  find-or-create a tutor by phone — verifying the same number twice logs back
  into the same account rather than creating a duplicate.

Verified against a live backend: full phone signup → dashboard round trip;
re-verifying the same phone number returns to the same tutor id, not a new
one; email tab signup still works unaffected on the same page; screenshotted
at 420px (phone form factor this page is mostly used at).

## 2026-09-05 (2)

**Phase 3 (partial): requirement form — "catch the parent when we have no tutor"**
- Ships the entry parked in `BACKLOG.md` (now removed — see there for the original
  reasoning). At current tutor supply, a parent who searches and finds nothing was
  simply leaving; we learned nothing about who they were or what they needed.
- New modal (`openRequirementForm()` / `#requirement-backdrop`) with five fields:
  phone (required), locality (required, prefilled from the search box), class,
  subject, mode (all optional — a parent who doesn't know the exact class yet
  shouldn't be blocked from submitting). Posts to `POST /api/parent-requests`,
  which has no tutor attached by design — that's unmet demand for an admin to
  match by hand, not another enquiry.
- Two entry points: a prominent CTA inside the empty-results state (replacing
  "try different filters" as a dead end), and a smaller "Didn't find the right
  fit?" banner below actual results — shown only once real results exist, hidden
  on the pre-search prompt and on the empty state (which has its own CTA).
- Copy makes a concrete promise ("we'll find you a tutor and message you on
  WhatsApp — usually within 48 hours"), not "thanks for your interest."
- No OTP or login required to submit — matches the existing Request Tutor flow's
  stance that submitting is low-risk; friction is reserved for looking your own
  requests back up later (not built here, to keep this addition small).

Verified against a live backend: empty-state CTA opens the modal with the grade
filter and locality carried over from the search that just ran; the below-results
banner is correctly hidden pre-search and on the empty state, visible only once
there are real results; a full round trip (submit → 201 → success screen) persists
the right fields, including geolocation lat/lng silently carried through from the
search box when the parent had used it. Checked at 375px — no overflow, matches
the existing modal system's mobile behaviour.

## 2026-09-05

**Phase 2 (frontend): search by class and subject, backend-driven ranking**
- Search order is now Locality -> radius -> Class -> Subject -> optional type/mode,
  matching the roadmap. Class and Subject are `<select>` dropdowns populated from
  `GET /api/grades` / `GET /api/subjects` - adding a subject going forward is a
  database row, not a frontend deploy.
- Replaced the 1-25 km drag slider with 2/5/10 km buttons, default 3 km (roadmap:
  "not a 10 km slider"). None of the three buttons is pre-selected, since 3 km
  itself isn't one of them - tapping an active button again returns to the 3 km
  default instead of needing a separate reset control.
- `applyFilters()` now sends `gradeSlug`, `subjectSlug`, and (once a locality is
  picked) `lat`/`lng`/`radiusKm` to the backend, and renders whatever order comes
  back rather than re-deriving it. The client-side haversine distance sort is
  retired for the live-API path - it only remains as a fallback for the bundled
  mock data when the backend is unreachable, since ranking now lives in exactly
  one place (`TutorSearchService` in the backend), per the roadmap's "ranking is
  fixed and published, never for sale."
- `dashboard.html`: tutors now pick classes and subjects from real checkboxes
  (backed by `/api/grades` and `/api/subjects`), not just free-text rows. The old
  free-text fields stay for extra display detail (exact syllabus, board), but are
  now clearly labelled as supplementary - the checkboxes are what search actually
  filters on. A tutor onboarded through this form is immediately findable by
  class/subject search; before this, only tutors from the Phase 1 backfill were.

Verified against a live backend + Postgres, not just visually: dropdowns populate
from the real API; a grade-filtered search returns only the matching tutor;
default 3 km radius correctly excludes a 6.8 km-away tutor that a 10 km tap then
includes; a tutor un-locatable on the map is excluded once a radius is applied;
the dashboard save -> reload -> prefill round-trip preserves selected
classes/subjects; a tutor onboarded via the dashboard form is searchable by
class+subject immediately after admin approval.

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
