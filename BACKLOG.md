# Padhora — Deferred work

Things we decided to build, but deliberately not yet. Each entry says what it is,
why it's parked, and what would un-park it. Delete an entry when it ships.

---

## Parent requirement form ("catch the parent when we have no tutor")

**Status:** deferred 2026-09-04. Chose the Phase 1 data model first.

### The problem

Today a parent searches, we return zero tutors (we have almost no supply), they
see an empty state, and they leave. We learn nothing. We don't know they came,
what locality they wanted, what class, or what subject.

That is the single most wasteful thing on the site right now: at current supply,
**every parent who searches is a lost lead**, and it costs us the exact data we
need to go recruit the right tutors.

### What to build

1. **A short form on the empty search state**, and again below results.
   Fields: phone, locality, class, subject, mode. Nothing else — this is the one
   place we're asking a parent for anything, so keep it to five fields.
   Copy should promise something concrete: "We'll find you a tutor and message
   you on WhatsApp", not "thanks for your interest".

2. **Backend: a `parent_request` table.** Distinct from the existing `Enquiry`,
   which is always tied to a specific tutor. A parent request has *no tutor* —
   that's the whole point. It's unmet demand.

3. **An admin inbox** to read those requests and match them to tutors **by hand**.
   Do not build automated matching. At this volume a person does it better and we
   learn more from doing it manually.

### Why it's parked

It only pays off once parents are arriving, and we aren't driving traffic yet
(see "Definition of launch" — 40+ verified tutors first). Phase 1's data model
unblocks Phase 2 search, which is the bigger constraint.

### What un-parks it

Any of these:
- We start pointing parent traffic at the site (ads, WhatsApp groups, SEO).
- Tutor supply is close enough to launch that empty searches become the exception.
- We want locality/subject demand data to decide *which* tutors to go recruit.

### Notes for whoever picks this up

- Much of the surrounding machinery already exists — read it before rebuilding.
  `index.html` already has a working parent enquiry flow (`openRequestForm`,
  `submitRequestForm`) and a request tracker (`openMyRequests`, phone + OTP via
  `/api/enquiries/request-otp` and `/verify-otp`). The requirement form should
  reuse that OTP/session plumbing, not invent a second identity mechanism.
- The empty state to hook into is `render()`'s zero-results branch and
  `renderSearchPrompt()` in `index.html`.
- Backend enquiry code to model against: `EnquiryController`, `Enquiry`,
  `EnquiryRepository` in `padhora-backend`.
- Parents never pay and never get charged friction they don't need. Do not put
  this form in front of a tutor's WhatsApp link — it belongs on the *empty*
  path, where the alternative is the parent leaving with nothing.
