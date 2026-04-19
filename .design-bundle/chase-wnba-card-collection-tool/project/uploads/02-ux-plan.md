# WNBA Card Collector — UX Plan

**Version:** 1.0
**Author:** UX Designer Agent
**Date:** April 18, 2026
**Input:** `01-product-model.md`, existing scaffolding, `styling-guidelines.md`
**Consumer:** Frontend implementation agents

---

## Design Principles

### 1. One thumb, one second, at a card show
Every primary action must be reachable with the right thumb from natural phone-holding position. The most critical flow — "do I own this card?" — must resolve in under three taps from any screen. Tap targets are never smaller than 48px. No horizontal scrolling on any list.

### 2. Cards are the content, the UI is the frame
Card images dominate their containers. The UI surface (`#161618`) is dark so the card art reads as the brightest element on screen. Never crop or distort a card image. The parallel badge is the second most important visual element on any card — it must be impossible to miss.

### 3. Status is never ambiguous
Every piece of data the app surfaces has a visible freshness or confidence signal. AI confidence gets a color-coded badge (teal/yellow/red). eBay comps show their cache age. Want list items never look alike — Wanted is orange, Ordered is yellow, Received is teal. If something could be wrong, the UI says so, plainly.

### 4. The happy path has zero friction; edge cases are graceful not punishing
Scanning a card, confirming it, and landing on the Collection success state should feel instant and satisfying. The scan flow has one primary button visible at each step — no decision paralysis. When things go wrong (bad scan, API failure, no results), the error message is specific and the escape path is immediate. Manual entry is always one tap away.

### 5. WNBA energy, not generic sports-app beige
The app looks like it belongs in the WNBA ecosystem: near-black backgrounds, WNBA orange (`#FF4713`) as the dominant accent, Barlow Condensed for all headings. The parallel badge color system is the visual language collectors already know. The UI should feel like something the league would ship, not a hobby spreadsheet in a dark mode wrapper.

---

## Navigation Model

### Top-level structure: 5-tab bottom navigation

The bottom nav is the only global navigation element. There are no side drawers, no hamburger menus, no nested nav bars. Every primary surface is one tap from anywhere in the app.

```
[ Collection ]  [ Want List ]  [ ◉ SCAN ]  [ Goals ]  [ eBay ]
```

**Tab order rationale:**  
Scan is center because it is the primary action — visually elevated, always visible, always reachable. Collection and Want List flank it on the left because they are the two highest-frequency lookup destinations (checking ownership, tracking orders). Goals and eBay are right-side because they are secondary — used in deliberate sessions, not impulsively.

**Scan tab treatment:**  
The Scan tab does not look like the other tabs. It has an orange filled pill or circle background behind the camera icon, making it the undeniable visual anchor of the nav bar. The icon is bold weight, size 24px. No label needed — the pill is self-explaining. On active state: no change to the tab itself (it is always visually primary). When scan is in progress (uploading / identifying / classifying stages), the tab icon pulses with an orange ring.

**Active tab treatment:**  
Active tabs show the icon and label in `--color-orange`. Inactive tabs show icon only in `--color-text-secondary` with no label. Exception: Scan tab always shows the camera icon prominently regardless of active state.

**Bottom nav positioning:**  
Fixed to the bottom of the viewport. Respects `env(safe-area-inset-bottom)` for iPhone home bar. Background: `--color-bg` at 95% opacity with `backdrop-blur-md`. Top border: 1px `--color-border`. Height: 64px + safe area. Page content has `pb-28` minimum to clear the nav.

### Nested navigation patterns

**Within Collection:**  
List/Grid toggle in the page header. Card detail opens as a full-screen push (not a bottom sheet), because it contains editable fields and secondary actions that need full vertical space.

**Within Want List:**  
Items are grouped by status (Wanted / Ordered / Received) on the main list. The status sections are collapsible — collapsed by default if the section is empty. Item detail opens as a full-screen push.

**Within Goals:**  
Goal list → Goal Detail (full-screen push). Goal Detail has a Have / Still Need tab switcher at the top of the content area (not the bottom nav). No deeper nesting.

**Within eBay:**  
Three segmented sections on one screen: Alert History, Listing Generator entry point, and Comps entry point. eBay Listing Generator opens as a full-screen push. eBay Comps always opens as a bottom sheet (never full-screen — it is contextual to a specific card).

**Checklist (admin surface):**  
Not in the bottom nav. Accessible from a gear icon or "Admin" link in Profile/Settings. Checklist → Set Detail is a full-screen push. This is a low-frequency surface and does not compete with the core collection flows.

**Profile/Settings:**  
Accessible via a user avatar or settings icon in the top-right of the Collection header, or via a persistent icon in the bottom nav if desired in Phase 6. For MVP: accessible via a small avatar in the Collection page header only.

---

## Screen Flow

---

### 1. Login

**Purpose:** Authenticate before accessing the app.

**Primary content:**  
- App name / wordmark (centered, full-bleed dark background)  
- "Sign in with Google" primary button  
- One line of context: "Your collection stays private to your account."

**Primary action:** Sign in with Google

**Secondary actions:** None — this screen has one job.

**Entry points:**  
- App cold open when no session exists  
- Any protected route redirect when session expires

**Exit points:**  
- Successful auth → Collection (the default landing screen)

**Empty/edge states:**  
- OAuth error: red inline error below the button with the specific message  
- Signing in state: button shows spinner + "Signing in…" text, disabled  
- Already authenticated: redirect fires before screen renders (no flash)

---

### 2. Collection (tab 1)

**Purpose:** Browse everything owned. Instantly answer "do I own this card?" at a card show.

**Primary content:**  
- Search bar: full-width, at the very top of the content area (not behind a scroll), auto-focuses on tap with keyboard immediately visible. Placeholder: "Search player, set, or #…"  
- Filter/sort row: horizontal scrollable chips below search — "All", "By Set", "By Player", "By Year", then sort toggle. Chips use `--color-surface-raised` background, orange border when active.  
- Card list: default view is a 2-column grid (card-forward). A list/detail toggle in the top-right header switches to single-column list with more metadata visible. Toggle persists to localStorage.  
- Card count: "142 cards" shown in muted text below the filter row, updates with filter state.

**Grid item anatomy:**  
Card image (aspect-[5/7], object-fit: contain, `--color-surface` fill) with bottom gradient overlay. Player name (Barlow Condensed 600 16px) and parallel badge overlaid on gradient. Team logo 16px top-right.

**List item anatomy:**  
48px thumbnail left-aligned. Player name (Barlow 600 18px), set name + card number (body 14px secondary), team logo + parallel badge, condition pill right-aligned.

**Primary action:** Tap search bar and type player name

**Secondary actions:**  
- Tap a card → Card Detail (full-screen push)  
- Long-press a card → quick action sheet: "Add to Want List", "Check eBay Comps", "View Detail"  
- Filter chip tap → applies filter inline, no navigation  
- FAB (Scan) in bottom nav — always visible

**Entry points:**  
- Bottom nav tab (always accessible)  
- Login success redirect  
- Post-scan success "View Collection" button  
- Post-want-list promote-to-collection confirmation

**Exit points:**  
- Tap card → Card Detail  
- Search result long-press → Want List item creation  
- Bottom nav to any other tab

**Empty/edge states:**  
- Zero cards (new user): large empty state with camera icon, "Scan your first card" headline, orange CTA button that navigates to Scan tab  
- Search with no results: "No cards match '{{query}}'" with a "Scan this card" link  
- Filter with no results: "No {{filter}} cards" with "Clear filter" link  
- Loading: 2-column grid of skeleton cards (aspect-[5/7] shimmer rectangles), search bar present but not interactive until load completes

---

### 3. Scan (tab 2 — center)

**Purpose:** Photograph a card, get AI identification, confirm and commit to collection. Target: under 30 seconds from camera open to "Added."

This screen manages multiple sequential stages using internal state. It does not navigate away — stages render in place.

#### Stage: Idle

**Primary content:**  
- "FRONT OF CARD" zone: large dashed-border rectangle (aspect-[5/7] ratio preserved), centered. Inside: Camera icon + "Tap to photograph" text. Below: two ghost buttons — "Camera" and "Library".  
- "BACK OF CARD" zone: smaller version (half-height visual weight), same tap-to-add pattern. Label includes "Helps identify card number & serial." Marked optional.  
- Once front image is selected: preview shows the card in the zone, with a clear/retake button (X icon) in the top-right corner of the preview.  
- Scan / Identify button: full-width, 56px, orange — disabled (muted) until front image is present.

**Primary action:** Photograph front of card (Camera button)

**Secondary actions:**  
- Select from Library  
- Add back photo  
- Clear a selected photo

**Entry points:**  
- Bottom nav Scan tab  
- Deep link or programmatic push (post-want-list receive flow)

**Exit points:**  
- Scan triggers → Processing stage (no navigation)  
- Bottom nav to any other tab (abandons scan — no confirmation needed unless image is selected; if image is selected, a "Leave scan?" confirm dialog fires)

**Empty/edge states:**  
- Image too large: inline error below the zone with "Image is too large. Use a photo under 750 KB." and a "Try Library" link  
- Camera permission denied: error banner with "Camera access denied. Use Library to select a photo."

---

#### Stage: Processing (uploading / identifying / classifying)

**Primary content:**  
- Selected card image(s) centered, full-width, with a pulsing orange border ring animation  
- Status text below: "Uploading…" → "Identifying card…" → "Classifying parallel…"  
- Sub-text explains what is happening: "Analyzing player, set, and card number" during Stage 1; "Matching border color, finish, and print run" during Stage 2  
- Orange spinner icon

**Primary action:** None — user waits. No cancel button (process is fast; cancellation adds complexity for minimal gain).

**Exit points:**  
- Success → Confirming stage  
- Error → Idle stage with error banner

---

#### Stage: Confirming

**Purpose:** Review AI results and commit to collection. All fields are editable. AI result is a suggestion, not a write.

**Primary content:**  
- Candidate navigation: if multiple candidates, dot indicator (1/3 style) with prev/next arrow buttons. Swiping left/right on the candidate card also navigates candidates.  
- Low-confidence banner: yellow warning bar above card if `low_confidence` is true: "Review carefully — AI is not confident in this match."  
- Card preview: full-width card image (front, or front+back side by side if back was captured). Below the image:  
  - Confidence badge (teal HIGH / yellow MEDIUM / red LOW), 11px uppercase  
  - Player name (Barlow 700 20px)  
  - Set name · card number · serial (if detected)  
  - Parallel badge (color-coded per styling-guidelines)  
  - Collapsed "AI Reasoning" section (expandable with caret)  
- Editable fields panel below card: player name, set, card number, serial number, parallel (dropdown from checklist parallels), condition (dropdown), cost paid ($), date acquired. Two-column layout for short fields.

**Primary action:** "CONFIRM — ADD TO COLLECTION" — full-width orange button, 56px

**Secondary actions:**  
- Navigate candidates (prev/next or swipe)  
- Expand AI Reasoning  
- Edit any field  
- "None of these — Enter Manually" — ghost button below confirm, leads to Manual Entry stage

**Entry points:**  
- Processing stage completes with results  
- Pre-filled from want-list item "Promote to Collection" action

**Exit points:**  
- Confirm → Success stage  
- Manual Entry → Manual stage  
- Error → error banner stays on Confirming stage with retry option

---

#### Stage: Manual Entry

**Purpose:** Enter card details by hand when AI result is wrong or absent.

**Primary content:**  
- Back arrow in header (returns to Idle, clears images)  
- Same editable fields panel as Confirming stage, but all fields start empty (or pre-populated from a want-list item if that was the entry path)  
- Player name, set, card number are marked Required with inline asterisk  
- "ADD TO COLLECTION" primary button

**Primary action:** Type player name, set, card number → tap "Add to Collection"

**Secondary actions:**  
- Back → return to Idle  
- Any field edit

**Exit points:**  
- Success → Success stage

---

#### Stage: Success

**Primary content:**  
- Card image (front, if captured) centered, slightly enlarged, with a teal checkmark badge in the bottom-right corner  
- "ADDED TO COLLECTION!" headline (Barlow 700 28px uppercase)  
- Player name + parallel name in muted body text  
- Two buttons stacked: "SCAN ANOTHER CARD" (orange, primary) and "VIEW COLLECTION" (ghost)

**Primary action:** Scan Another Card (resets the scan flow to Idle)

**Secondary actions:**  
- View Collection → navigates to Collection tab

**Empty/edge states:**  
- If no card image was captured (manual entry with no photo): success state shows a card-shaped placeholder with team color gradient instead

---

### 4. Want List (tab 3)

**Purpose:** Track the acquisition pipeline. Wanted → Ordered → Received.

**Primary content:**  
- Three status sections, stacked vertically:  
  - **WANTED** (orange header, star icon)  
  - **ORDERED** (yellow header, box icon)  
  - **RECEIVED** (teal header, check icon)  
- Each section shows item count in the header. Empty sections are collapsed to a single-line placeholder row (not fully hidden — the user needs to know the section exists even when empty).  
- Each want-list item: 48px height minimum, player name (Barlow 600), set/parallel in secondary, status badge (left-aligned pill), max price (right-aligned), eBay alert toggle (bell icon, right edge).  
- The status badge is a tappable target — tapping it advances status one step (Wanted → Ordered → Ordered → Received). A brief confirmation tooltip appears: "Moved to Ordered." No modal required for status advance.

**Primary action:** Tap status badge to advance item status

**Secondary actions:**  
- Tap item row (not badge) → Want List Item Detail  
- Tap bell icon → toggle eBay alert on/off (immediate, no modal)  
- FAB or "+" button in header → Add new want item (opens bottom sheet with player/set/card/max-price form)  
- Swipe right on item (Received only) → "Promote to Collection" action appears as a swipe action

**Entry points:**  
- Bottom nav tab  
- "Add to Want List" from Goal Detail "Still Need" view  
- "Add to Want List" long-press from Collection  
- Alert email deep link (stretches here but want list is home base for acquisitions)

**Exit points:**  
- Item row tap → Want List Item Detail  
- Promote to Collection → Scan tab (pre-filled confirmation stage)  
- Bottom nav

**Empty/edge states:**  
- All three sections empty: single centered empty state with star illustration, "Nothing in your pipeline" headline, "Add a Want" orange CTA  
- Loaded but all Received: teal success message: "Everything received — nice work." with "Promote all to Collection" link (if >0 received items)  
- Loading: skeleton rows with shimmer in each section

---

### 5. Want List Item Detail

**Purpose:** Full management of a single want-list entry — status, pricing, eBay data, notes.

**Primary content:**  
- Header: player name (Barlow 700 24px), set + card number, parallel badge  
- Status row: three-step status indicator (Wanted / Ordered / Received) with current step highlighted. Tapping a step directly moves to that status (skipping forward is allowed; going backward is allowed with a brief "Confirm?" inline prompt).  
- Max price field: tappable inline edit — shows "$—" if unset, renders as an editable number input on tap  
- eBay alert toggle: prominent on/off switch with label "Alert me when a BIN listing is under my max price"  
- "View eBay Listings" button: opens eBay Comps bottom sheet for this card  
- Notes section: collapsible, freetext  
- Ordered sub-section (visible when status is Ordered): source input, tracking number input  
- Received sub-section (visible when Received): "PROMOTE TO COLLECTION" orange CTA button

**Primary action (status-dependent):**  
- Wanted: "Mark as Ordered" button  
- Ordered: "Mark as Received" button  
- Received: "Promote to Collection"

**Secondary actions:**  
- Toggle eBay alert  
- View eBay Comps (bottom sheet)  
- Edit max price  
- Edit notes  
- Edit source / tracking  
- Delete want (destructive, behind a "Delete" ghost button at bottom with a confirm prompt)

**Entry points:**  
- Want List item row tap

**Exit points:**  
- Back → Want List  
- Promote to Collection → Scan (pre-filled Confirming stage)  
- eBay Comps bottom sheet (overlay, not navigation)

**Empty/edge states:**  
- eBay alert toggled on but no max price set: orange inline nudge: "Set a max price to enable alerts" — alert toggle disabled until price is set

---

### 6. Card Detail (Collection)

**Purpose:** Full view of an owned card — see everything, take any action on it.

**Primary content:**  
- Full-width card image hero (aspect-[5/7], object-fit: contain, dark fill). If no image was captured, a card-shaped placeholder with team color gradient.  
- Below image: player name (Barlow 700 28px), parallel badge (prominent, not inline with text — its own row), set name + card number, year  
- Metadata rows: Condition | Cost paid | Date acquired | Serial number (if present)  
- Action row: "eBay Comps" and "Generate Listing" buttons side-by-side (each a ghost pill button)  
- Notes: collapsible, freetext, inline editable

**Primary action:** "View eBay Comps" — opens bottom sheet

**Secondary actions:**  
- Edit any metadata field (all fields are inline-editable — tap to activate)  
- Generate eBay Listing → navigates to eBay Listing Generator (full-screen)  
- Delete card → destructive confirm dialog  
- Add to Want List (for duplicate tracking) → creates a want item pre-filled with this card's data

**Entry points:**  
- Collection grid or list item tap  
- Long-press quick action "View Detail"

**Exit points:**  
- Back → Collection  
- eBay Comps → bottom sheet overlay  
- Generate Listing → eBay Listing Generator screen

**Empty/edge states:**  
- No image: gradient placeholder, offer "Add photo" button  
- Metadata missing (e.g., no cost paid): show "—" in the slot with a muted edit icon

---

### 7. Goals (tab 4)

**Purpose:** See progress toward set-completion targets. Discover what's missing.

**Primary content:**  
- List of active goals, each rendered as a card:  
  - Goal name (Barlow 600 18px)  
  - Progress bar: full-width, color transitions from red → yellow → orange → teal as percentage increases  
  - Progress badge (standings-style): "47 / 150" with color per the goal progress badge system in styling-guidelines  
  - Goal type chip (Full Set / Insert Set / Player / Custom)  
- "Create Goal" button in the top-right header  
- Completed goals (100%) appear with a solid teal "COMPLETE" badge and can be archived

**Primary action:** Tap a goal → Goal Detail

**Secondary actions:**  
- Create Goal (header button)  
- Archive a completed goal (swipe left action or via Goal Detail)

**Entry points:**  
- Bottom nav tab

**Exit points:**  
- Tap goal → Goal Detail  
- Bottom nav

**Empty/edge states:**  
- No goals: centered empty state with a target icon, "Track your first set" headline, orange "Create Goal" CTA  
- All goals complete: celebratory teal empty state "All complete — add a new goal"  
- Loading: skeleton goal cards with shimmer progress bar

---

### 8. Goal Detail

**Purpose:** Drill into a single goal — see what you have, see what's missing, act on the gaps.

**Primary content:**  
- Goal name as page title (Barlow 700 28px uppercase)  
- Summary: progress bar + "47 of 150 · 31% complete" in secondary text  
- Have / Still Need tab switcher (segmented control, orange active state, full-width, positioned directly below the summary — not the bottom nav)  
- **Have tab:** Grid or list of owned cards that count toward this goal. Same card display pattern as Collection.  
- **Still Need tab:** List of missing cards, sorted by card number by default. Sort controls: Card # | Player | Est. Value. Each row has an "Add to Want List" action button (right-aligned, orange pill, "+ Want").

**Primary action (Still Need tab):** Tap "+ Want" on any row to add to want list

**Secondary actions:**  
- Edit goal settings (gear icon in header) → inline bottom sheet: rename, change scope, deactivate  
- Sort controls on Still Need  
- Tap a Have card → Card Detail  
- Set max price before saving a want (optional field in the add-to-want bottom sheet)

**Entry points:**  
- Goals list tap

**Exit points:**  
- Back → Goals  
- Have card tap → Card Detail  
- "+ Want" → creates want item (no navigation — inline toast confirmation: "Added to Want List")

**Empty/edge states:**  
- Still Need tab, goal is 100%: "You have every card in this set." with teal check icon  
- Have tab, no owned cards yet: "None yet — start scanning or add cards manually"  
- Loading: skeleton rows

---

### 9. eBay (tab 5)

**Purpose:** Central hub for all eBay activity — alert history, comp lookups, listing generation entry point.

**Primary content:**  
Three vertically stacked sections:  

**Alert History section:**  
- Chronological list of sent alerts, most recent first  
- Each row: card name + parallel, "Listed at $X" (under your max of $Y), timestamp, "View on eBay" link → opens browser  
- Section header shows count of alerts in last 7 days  

**Alert Status section:**  
- Compact list of want-list items that have eBay alerts active, with current status (Watching / No Alert)  
- Tap → goes to Want List Item Detail  

**Listing Generator section:**  
- A search-or-select entry: "Generate listing for…" text prompt with a collection search picker  
- Tap → eBay Listing Generator full-screen  

**Primary action:** Tap an alert history item to view the eBay listing

**Secondary actions:**  
- Navigate to Want List Item Detail from alert status list  
- Initiate listing generation from the generator section  
- "Check comps for a card" — a search-style input that opens the eBay Comps bottom sheet for any card in the collection

**Entry points:**  
- Bottom nav tab

**Exit points:**  
- Alert links → external browser (eBay)  
- Item tap → Want List Item Detail  
- Listing Generator → full-screen push  
- Comps search → bottom sheet overlay

**Empty/edge states:**  
- No alerts ever sent: "No alerts yet — add a card to your want list with a max price to get started"  
- No alerts active: section shows "0 cards being watched" with an "Add a Want" link  
- Loading alert history: skeleton rows with shimmer

---

### 10. eBay Listing Generator

**Purpose:** Produce ready-to-paste eBay listing copy from a collection card.

**Primary content:**  
- Card identity summary at top (player, set, parallel, condition) — read-only, confirms which card  
- Generated title field: full-width text box, read-only with copy button. Character counter showing X/80 — turns orange at 75, red at 81+.  
- Generated description: large text area, read-only with copy button  
- Suggested price: large display ("$47.00") with secondary text "Based on X active BIN listings (cached N hours ago)". Refresh icon next to age timestamp.  
- Market context: compact list of the top 3 comps driving the price suggestion  
- "Copy Title" / "Copy Description" / "Copy Price" — three full-width ghost buttons  

**Primary action:** Copy Title to clipboard

**Secondary actions:**  
- Copy Description  
- Copy Price  
- Refresh comps (re-fetches if cache is stale; disabled with spinner while fetching)  
- View full eBay Comps bottom sheet

**Entry points:**  
- eBay tab "Listing Generator" section  
- Card Detail "Generate Listing" action

**Exit points:**  
- Back → previous screen (eBay tab or Card Detail)  
- View Comps → bottom sheet overlay

**Empty/edge states:**  
- Comps unavailable (API error): "Could not fetch market data" with retry button. Title and description still generate from card metadata. Price shows "—" with "No market data" label.  
- Generating: skeleton for title/description/price fields with orange pulsing border  
- Zero comps found: "No active listings found for this card" — suggested price shows "—"

---

### 11. eBay Comps Bottom Sheet

**Purpose:** Show current active BIN listings for a specific card without leaving the current screen.

**Primary content:**  
- Drag handle (36×4px pill, `--color-border`) at top center  
- Card identity as sheet title: player + parallel (Barlow 600 18px)  
- Cache age: "Updated 3 hours ago" in muted text, with a refresh icon  
- List of up to 10 listings, sorted by price ascending:  
  - Price (bold, large)  
  - Listing title (truncated to 1 line)  
  - Condition  
  - "View on eBay" → opens external browser  
- "Low: $X · Median: $X · High: $X" summary row pinned above the list

**Primary action:** Tap a listing → opens eBay in browser

**Secondary actions:**  
- Refresh comps  
- Dismiss (swipe down or tap scrim)

**Entry points:**  
- Card Detail "View eBay Comps"  
- Want List Item Detail "View eBay Listings"  
- eBay tab comps search  
- Listing Generator "View full comps"

**Exit points:**  
- Dismiss → returns to wherever it was opened from  
- Listing link → external browser (sheet stays open)

**Empty/edge states:**  
- Loading: 5 skeleton listing rows with shimmer  
- No listings: "No active BIN listings found" with muted illustration  
- API error: red error message + retry button  
- Cache stale (>24h): yellow "Data may be outdated" banner above list

---

### 12. Checklist — Set List

**Purpose:** Manage the reference database of sets and parallels that power AI identification.

**Primary content:**  
- "CHECKLISTS" page title with "Admin" orange supertitle  
- Sets / Import CSV tab switcher (segmented control)  
- Sets tab: sets grouped by year, descending. Each row: set icon, set name, card count + parallel count, "Needs Review" yellow badge if flagged, caret right.  
- Import tab: file drop zone, set name/year/manufacturer fields, Import button, result summary

**Primary action (Sets tab):** Tap a set → Set Detail

**Secondary actions:**  
- Create Set (header button, opens bottom sheet modal)  
- Import CSV (tab switch)

**Entry points:**  
- Profile/Settings → Checklists  
- Collection header action (shortcut link)

**Exit points:**  
- Set row tap → Set Detail (full-screen push)  
- Back → Profile or wherever linked from

**Empty/edge states:**  
- No sets: centered empty state with database icon, "No sets yet — import a CSV or add one manually"  
- Loading: skeleton rows

---

### 13. Checklist — Set Detail

**Purpose:** Manage all cards and parallels within a single set.

**Primary content:**  
- Set name as page title, year + manufacturer as sub-header  
- Cards / Parallels tab switcher  
- Cards tab: list of all cards in the set, card number + player name, sortable. "Needs Review" flag per card.  
- Parallels tab: list of all defined parallels with visual descriptors (color name, finish, print run, notes). Each parallel shows its badge color preview.  
- "Add Card" / "Add Parallel" FAB or header button depending on active tab  
- Import result warnings inline if any cards are flagged for review

**Primary action:** Tap a parallel → edit parallel descriptor inline (bottom sheet with fields: name, color hex, finish, print run limit, notes)

**Secondary actions:**  
- Add card  
- Add parallel  
- Delete card / parallel (swipe-to-delete with confirm)  
- Edit card/parallel details

**Entry points:**  
- Checklist Set List row tap

**Exit points:**  
- Back → Set List

**Empty/edge states:**  
- No cards: "No cards added yet — import a CSV to populate"  
- No parallels: "No parallels defined — add parallels to improve AI identification"

---

### 14. Profile / Settings

**Purpose:** Account management and alert configuration.

**Primary content:**  
- User avatar (Google photo or initials circle) + display name + email  
- Edit display name: inline editable  
- eBay alert email: editable text field (defaults to auth email)  
- Alert frequency: segmented selector (Hourly / Daily / Weekly)  
- "Sign Out" button at bottom, destructive styling  
- "Checklists" link → navigates to Checklist Set List

**Primary action:** Edit alert preferences

**Secondary actions:**  
- Sign out  
- Navigate to Checklists

**Entry points:**  
- Small avatar/gear icon in Collection header (MVP); bottom nav icon (Phase 6)

**Exit points:**  
- Back → Collection  
- Checklists → Checklist Set List

---

## Interaction Patterns

### Bottom Sheet Modals

Used for: eBay Comps, Add Want item, Create Goal, Edit Goal, Add Set (Checklist), Edit Parallel, long-press quick actions.

Anatomy: drag handle centered at top; title row; scrollable content; sticky action row at bottom pinned above keyboard if open. Max height 85vh. Background `--color-surface-raised` (`#1F1F23`). Scrim: black at 60% opacity. Swipe-down or scrim-tap dismisses.

Animation: `250ms cubic-bezier(0.32, 0.72, 0, 1)` slide up from bottom. Dismiss reverses the same curve.

Rule: bottom sheets are for contextual overlays where the user returns to the triggering screen. Never use a bottom sheet as a destination that requires its own navigation or has destructive consequences without explicit confirmation.

### Form Validation Approach

Validation fires on blur (when the user leaves a field), not on keystroke. Required fields that are empty on submit show an inline red message directly below the field with a red border on the input — no toast, no scroll-to-error. The submit button stays enabled — tapping it triggers validation on all fields at once if the user has not touched them yet.

Exception: the character counter on the eBay listing title is live (on keystroke) because it is informational, not a blocking error.

`input-field` class (already used throughout the codebase) should be standardized to: `rounded-xl border border-[#2A2A2F] bg-[#161618] px-4 py-3 text-sm text-[#F5F5F7] outline-none transition focus:border-[#FF4713]`. Error state adds `border-[#E8373A]`.

### Swipe Gestures

**Want List — status advance on swipe:**  
Swipe right on any want-list item → reveals a colored action zone: orange "ORDERED" (from Wanted), yellow "RECEIVED" (from Ordered), or teal "TO COLLECTION" (from Received). Swipe must pass 40% of the item width to trigger; releasing short of that snaps back. The action zone text and icon confirm what will happen before the user releases. This gesture replaces needing to open item detail just to advance status.

**Swipe left on want-list item:** reveals a red "DELETE" action zone. Requires the swipe to go 40%+ to confirm.

**Scan Confirmation — swipe candidates:**  
Swipe left or right on the candidate card area to navigate between the 3 AI candidates. Dot indicator at top updates. Arrow buttons are the non-swipe fallback.

**No other swipe gestures** are defined. Gesture surface should be predictable — users should not have to discover swipe behaviors in unexpected places.

### Skeleton Loaders

Every list or grid that fetches data shows skeleton content matching the shape of real content. Skeletons use a shimmer animation (left-to-right gradient sweep, 1.5s loop). They are never plain gray boxes — they match the aspect ratio and layout of the actual content (card thumbnails use aspect-[5/7], list items use the full 48px height, progress bars are their actual width at a neutral gray fill).

Skeletons appear for a maximum of 3 seconds. If data has not loaded in 3 seconds, replace skeleton with an error state and a retry button. No infinite loading states.

### Confirmation Flows After Scan

The scan confirmation stage is a deliberate gate — it is never skipped. The "CONFIRM — ADD TO COLLECTION" button must be visually the most prominent element below the fold. After confirm:

1. Button enters loading state (spinner replaces text, orange remains, no size change)  
2. On success: the screen transitions to the Success stage (no navigation) with a teal flash animation on the card preview (scale 1.0 → 1.03 → 1.0, 300ms, teal border ring pulses once)  
3. On error: button returns to active state, an error banner appears above the button with the specific error message. The user can retry immediately.

There is no "are you sure?" confirmation on the confirm action itself — the confirmation screen IS the confirmation. However, deleting a card from the collection and promoting a received want-list item both require a brief confirm prompt ("Remove this card from your collection?" with Cancel / Remove buttons).

### Parallel Color Coding System

Parallel badges appear in: Collection grid overlay, Collection list item, Scan Confirmation candidate card, Want List item, Want List Item Detail, Goal Detail (Have and Still Need), Card Detail.

Badge anatomy (per styling-guidelines): pill shape, `border-radius: 9999px`, background = parallel color at 15% opacity, border = parallel color at 60% opacity 1px, text = parallel color 100%, Inter 600 11px UPPERCASE.

Animated badges (Gold Vinyl, Mojo, 1-of-1) run their animations at all times — they are not triggered by hover or interaction. On `prefers-reduced-motion: reduce`, all animations are suppressed per the global animation rule in styling-guidelines.

Parallel badge placement rule: always bottom-left on card thumbnails (grid), always inline after the set/card-number line in list items, always its own prominent row in Card Detail and Scan Confirmation.

When a parallel is unknown (scan result has no parallel identified), show a neutral "BASE?" badge in `--color-text-secondary` styling with a question mark — do not show nothing.

---

## What to Keep from Current Scaffolding

**Bottom navigation structure (`BottomNav.tsx`):**  
The 5-tab model (Collection, Scan, Want List, Goals, eBay) is correct and matches the product model exactly. Tab routing via `usePathname` is the right pattern. The icon library choice (Phosphor) is correct per styling-guidelines.

**Scan page (`scan/page.tsx`):**  
This is the most complete and well-structured screen in the scaffolding. The stage machine (`idle` / `uploading` / `identifying` / `classifying` / `confirming` / `success` / `manual`) is the correct architectural pattern and should be kept. The ImageZone component pattern is good. The Field component for form fields is the right abstraction. The two-stage AI pipeline (Stage 1 identity + Stage 2 parallel) is implemented correctly and must not be restructured. The confidence badge color logic (`confidenceLabel` function) matches styling-guidelines and should be extracted into a shared utility. The success state card preview with teal checkmark badge is the right visual approach.

**Color token usage in scan page:**  
The scan page is already using the correct hex values directly (`#FF4713`, `#0A0A0B`, `#161618`, `#2A2A2F`, `#1F1F23`, `#F5F5F7`, `#8E8E9A`, `#45454E`). This is correct — all color values align with styling-guidelines tokens.

**Checklist page (`checklist/page.tsx`):**  
The tab switcher pattern (Sets / Import CSV) with the orange active segment is correct. The AddSetModal as a bottom-sheet-style overlay (`fixed inset-0 z-50 flex items-end`) is the right pattern and should be standardized into the shared BottomSheet component. The sets-grouped-by-year pattern is the right information architecture. The import result stats grid is a good pattern to reuse for any bulk-operation result display.

**Font loading (`layout.tsx`):**  
Barlow Condensed and Inter are loaded correctly via `next/font/google` with the correct weights and variable names. This must not change.

**Page-level layout:**  
`pb-28` bottom padding to clear the fixed nav bar is correct. 16px horizontal padding on mobile is correct per styling-guidelines.

---

## What to Replace

**`SectionShell` component:** Replace entirely. It uses `slate-` colors (`border-slate-800`, `bg-slate-900/80`, `text-cyan-300/80`) which conflict with the design token system defined in styling-guidelines. It applies a rounded card wrapper around the page header that competes with card content visually. The description text inside it is placeholder-level copy, not production UI. Its layout (`max-w-5xl` with a header card) is a desktop pattern; the mobile-first header should be a flat section with the page title directly on the app background, not boxed. The `SectionShell` pattern is appropriate for a developer scaffolding tool, not production screens.

**Bottom nav styling (`BottomNav.tsx`):** The colors are wrong. Currently uses `slate-950/95` background, `border-slate-800`, `text-cyan-300` active state, `text-slate-500` inactive. Replace with `--color-bg` background (`#0A0A0B`), `--color-border` top border (`#2A2A2F`), `--color-orange` active (`#FF4713`), `--color-text-secondary` inactive (`#8E8E9A`). The Scan tab needs the pill treatment (orange background circle behind the camera icon) that is described in styling-guidelines but not yet implemented. The tab bar also currently routes Collection to `/` (root) while the product model routes it to `/collection` — this should be `href: '/collection'`.

**Collection page (`collection/page.tsx`):** The entire current implementation is a developer scaffolding tool (manual card-add form + raw data table), not the production UI. The page should be replaced with the search-first, grid/list card browser described in this plan. The Supabase integration logic (loadCollection, handleSubmit) should be extracted to server components or route handlers — the client-side form logic is not production-appropriate. The `slate-` colors throughout should be replaced with token-based values.

**Want List, Goals, eBay pages:** All three are placeholder shells using `SectionShell` with placeholder text. These should be built from scratch following this UX plan. The auth guard logic (`useEffect` checking session, redirecting to login) is correct in principle but should be moved to a shared middleware or layout-level auth check rather than duplicated across every page.

**Login page:** Functionally correct but uses `SectionShell` and `bg-cyan-400` for the Google button (wrong color — should be `--color-orange`). The description text is developer-facing. The login screen should be redesigned to match the WNBA branding: full-bleed dark background, centered wordmark, minimal copy, single orange button.

**`input-field` CSS class:** Currently used across scan and checklist pages but its definition is not standardized (applied via `className="input-field"` without a visible global definition in the read files). This class must be formally defined in `globals.css` with the exact styles described in the Interaction Patterns section above, and used consistently across all form inputs in the product.
