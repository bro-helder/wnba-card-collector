# WNBA Card Collector — Product Model

**Version:** 1.0
**Author:** PM Agent
**Date:** April 18, 2026
**Input:** `wnba-card-collector-prd.md` v0.2
**Consumer:** UX Designer (next step in pipeline)

---

## User Types

### Primary User: Brook (Serious Collector)

The sole user in MVP. A WNBA card collector who buys and sells on eBay, attends card shows, chases set completion, and needs tooling to run her collection like a serious operation — not a hobby spreadsheet.

**Goals:**
- Know exactly what she owns, including parallel variants and serial numbers
- Never buy a duplicate at a card show
- Know what she still needs to complete a set or goal
- Get alerted when a want-list card hits her price on eBay
- Price and list cards she's selling without guesswork
- Maintain reference checklists (sets, parallels) that power AI identification

### Future Users (Architecture supports, not built in MVP)

Standard collectors who would share the platform. Same collection/want/goal flows. No admin access. No UI for this in MVP — multi-user is architectural only.

---

## Core Jobs-to-be-Done

1. **Scan a card and add it to the collection** — photograph a card, get AI identification, confirm or correct, commit. Target: under 30 seconds from camera open to "Added."

2. **Look up whether I own a card** — instant search at a card show to prevent duplicate purchases. Must work with one hand, minimal taps.

3. **Track cards I want to buy** — maintain a pipeline of Wanted → Ordered → Received items with max prices; advance status with a tap.

4. **Promote a received card to the collection** — when a want-list card arrives, move it to the collection in one action without re-entering data.

5. **Monitor progress toward a set-completion goal** — see what I have and what I still need for any defined goal (full set, insert set, player collection, or custom list).

6. **Add a card I still need to my want list** — from the "Still Need" view on a goal, add a card to want list in one tap.

7. **Check current eBay market prices for a card** — on-demand pull of active BIN listings for any card in collection or want list.

8. **Receive an alert when a want-list card is a deal** — automated email when a matching eBay listing appears under my max price or drops in price.

9. **Generate eBay listing copy for a card I'm selling** — produce a ready-to-paste title, description, and suggested price from any collection card.

10. **Maintain checklist reference data** — add sets, define parallels with visual descriptors, import Beckett sheets so the AI has accurate reference data to classify against.

---

## Screen Inventory

### Bottom Nav Screens (5 primary tabs)

**1. Collection**
Purpose: Browse and search all owned cards.
Primary actions: Search by player name; filter by set/parallel/year/team; sort by player/date/value; tap a card to view detail; open scan from FAB.

**2. Scan**
Purpose: Photograph a card and pipeline it through AI identification into the collection.
Primary actions: Open camera; select from photo library; capture front image; optionally capture back image; trigger AI identification; swipe through 3 candidate results; select a candidate; edit any field on confirmation screen; confirm → add to collection; tap "None of these" → manual entry.

**3. Want List**
Purpose: Track cards being pursued, from desired through ordered to received.
Primary actions: View cards grouped by status (Wanted / Ordered / Received); tap status badge to advance; tap card to view detail and eBay comps; toggle eBay alert on/off per item; add new want manually; promote Received item to collection.

**4. Goals**
Purpose: Track set-completion targets and see what's missing.
Primary actions: View all active goals with progress bars; tap a goal to see Have / Still Need; add a Still Need card to want list in one tap; create a new goal; set goal scope (full set, insert+parallel, player filter, or custom list).

**5. eBay**
Purpose: Central hub for eBay activity — alert history, comps, and listing generation.
Primary actions: View alert history (sent alerts with listing links); view alert status per want-list item; generate listing copy for a collection card; view current market comps for any card.

---

### Detail / Sub-Screens

**6. Card Detail (Collection)**
Purpose: Full view of a single owned card with all metadata and actions.
Primary actions: Edit card fields (condition, cost paid, notes); view scan image; view parallel badge; check eBay comps (opens bottom sheet); generate eBay listing; delete card; add to want list (for dupe tracking).

**7. Scan Confirmation**
Purpose: Review AI results and commit a scanned card to the collection.
Primary actions: Swipe between top 3 candidates; expand AI reasoning; edit any pre-filled field (player, set, card number, parallel, serial, condition, cost, date); confirm → write to collection; tap "None of these" to clear and manually enter.

**8. Want List Item Detail**
Purpose: Full view of a single want-list entry with status, price, and live eBay data.
Primary actions: Advance status (Wanted → Ordered → Received); set or edit max price; toggle eBay alert; view current eBay listings (bottom sheet); edit source / tracking number / notes; delete want.

**9. Goal Detail**
Purpose: Show completion progress and the card-level breakdown for one goal.
Primary actions: Toggle between Have / Still Need tabs; sort Still Need by card number / player / estimated value; add any Still Need card to want list; edit goal settings; deactivate goal.

**10. Checklist — Set List**
Purpose: View and manage all sets in the reference database.
Primary actions: Create new set (name, year, manufacturer); tap a set to manage its cards and parallels; import Beckett .xlsx; trigger CSV import.

**11. Checklist — Set Detail**
Purpose: Manage all cards and parallels within a single set.
Primary actions: Add/edit/delete individual cards; add/edit/delete parallels with visual descriptors (color, finish, print run, notes); view import results and flagged needs-review items.

**12. eBay Listing Generator**
Purpose: Produce ready-to-paste eBay listing copy for a collection card.
Primary actions: View generated title (with 80-char indicator); view generated description; view suggested price with market context; copy title to clipboard; copy description to clipboard; copy price to clipboard; refresh comps.

**13. eBay Comps Bottom Sheet**
Purpose: Show current active BIN listings for a specific card without leaving the current screen.
Primary actions: View up to 10 listings sorted by price; tap a listing to open eBay in browser; dismiss sheet.

**14. Login**
Purpose: Authenticate before accessing the app.
Primary actions: Sign in with Google.

**15. Profile / Settings**
Purpose: Manage account preferences and alert configuration.
Primary actions: Edit display name; set eBay alert email (defaults to auth email); configure alert frequency (hourly / daily / weekly).

---

## Critical User Flows

### Flow 1: Scan a Card at a Card Show

**Entry:** Tap the Scan tab

1. **Scan** → Camera opens with front/back capture options
2. User captures front image (optionally captures back image)
3. **Scan (processing)** → "Identifying card..." animation while Edge Functions run Stage 1 and Stage 2
4. **Scan Confirmation** → 3 candidates displayed as swipeable cards, each with player/set/parallel/confidence
   - Decision: Is one of these correct?
   - If Yes → user selects candidate, reviews editable fields, taps Confirm
   - If No → taps "None of these" → same editable form, pre-cleared → manual entry
5. **Collection** → success animation → card appears in collection grid

**Critical constraint:** All fields are editable before confirming. AI result is a suggestion, never an auto-write.

---

### Flow 2: Check If I Own a Card (Duplicate Prevention)

**Entry:** Tap the Collection tab, or Search from any screen

1. **Collection** → Search bar prominently at top
2. User types player name
3. Instant results filter — cards matching that player show immediately
4. User scans result list, looks for the specific set/parallel combination
   - Decision: Do I own it?
   - If Yes → do not buy
   - If No → optionally long-press to add to want list on the spot

**Critical constraint:** Must work with one thumb, no horizontal scroll, large tap targets. Designed for use at a card show while holding a card in the other hand.

---

### Flow 3: Get Alerted and Acquire a Want-List Card

**Entry:** Alert email received → tap listing link

1. **Email** → user sees deal alert: player, parallel, price vs. max price, eBay listing link
2. User taps eBay link → views listing on eBay, purchases card
3. User returns to app → **Want List**
4. User locates the card, taps status badge → advances from Wanted to Ordered
5. User adds tracking number (optional)
6. Card arrives → user advances status Ordered → Received
7. App prompts: "Add to collection now?" → user taps Yes
8. **Scan Confirmation** (pre-filled from want list data) or direct add → card appears in **Collection**

**Decision points:** Status can be advanced without going through the scan pipeline if the card is already fully identified from want list data.

---

### Flow 4: Chase a Set-Completion Goal

**Entry:** Tap Goals tab

1. **Goals** → user views active goals with progress bars (e.g., "2024 Prizm Silver Base — 47 of 150")
2. User taps a goal → **Goal Detail**
3. User taps "Still Need" tab → sees remaining cards sorted by card number
4. User taps a card row → taps "Add to Want List" → want created instantly with card identity pre-filled
   - Optional: user sets max price before saving
5. **Want List** now contains the new item with Wanted status and eBay alert active
6. When the card is acquired (via Flow 3) and promoted to collection → Goal Detail updates automatically, progress bar increments

---

## Out of Scope

The following are explicitly excluded from this product based on PRD Section 2 and the decisions log:

- **Batch scanning** — scanning multiple cards from one image is deferred post-MVP. One card at a time only.
- **Automated eBay listing submission** — the app generates listing copy only. The user posts to eBay manually.
- **Sold comps / price history** — eBay's sold comps API is unavailable. All pricing is based on current active BIN listings only. No historical price charting.
- **Grading integration** — no PSA/BGS lookup by cert number.
- **Non-WNBA cards** — the app is WNBA-specific. No other sports or TCG cards.
- **Public collection sharing** — no public profile pages or shared collection URLs.
- **Trade matching** — no multi-user trade features.
- **Admin UI** — checklist data is writable by any authenticated user for now; no formal role management UI.
- **Push notifications** — alerts are email-only (via Resend). No browser or mobile push notifications.
- **Low-value base cards** — the collector explicitly skips cataloguing non-name base cards; the app does not enforce this but does not have a bulk-exclusion flow for it.
- **Multi-user invite flow** — architecture supports multiple users; the invite and role management UI is deferred.
