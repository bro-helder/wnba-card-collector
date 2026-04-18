# WNBA Card Collector — Frontend Implementation Plan

**Version:** 1.0
**Author:** Senior Frontend Developer Agent
**Date:** April 18, 2026
**Inputs:** `02-ux-plan.md`, `01-product-model.md`, existing `src/`, `styling-guidelines.md`
**Scope:** Phase 2.5 — realistic Tailwind structure, no placeholder text, reusable component patterns, checklist admin complete

---

## What to Keep

### `src/app/scan/page.tsx`
The most production-ready screen in the codebase. Keep everything:
- The `ScanStage` union type and the stage machine pattern are the correct architectural model
- `handleScan`, `handleConfirm`, `handleManualEntry`, and `reset` callbacks are correct and complete
- `ImageZone` component is a good abstraction — extract to `src/components/scan/ImageZone.tsx` so it can be reused in a future "Add Photo" flow on Card Detail
- `Field` component is the right label+input wrapper — extract to `src/components/ui/Field.tsx` as a shared primitive
- `ManualEntryForm` logic is correct — keep as a co-located sub-component in scan or extract to `src/components/scan/ManualEntryForm.tsx`
- Color token usage (`#FF4713`, `#161618`, `#2A2A2F`, etc.) is fully aligned with styling-guidelines — do not change
- The `confidenceLabel` helper must be extracted to `src/lib/confidence.ts` so it can be shared with future Card Detail and Want List displays

### `src/app/checklist/page.tsx`
Almost production-ready. Keep:
- `SetsTab` component: the grouped-by-year pattern, set row anatomy, and "Needs Review" badge are all correct per UX plan
- `ImportTab` component: file drop zone, form fields, and `ImportResult` stats grid are correct and functional
- `AddSetModal`: the `fixed inset-0 z-50 flex items-end` pattern is exactly the bottom sheet pattern defined in the UX plan — keep and standardize against the new `BottomSheet` shared component
- Orange tab switcher (`bg-[#FF4713]` active, `text-[#8E8E9A]` inactive) is correct — this is the shared tab bar pattern
- Auth check using `getSession()` on mount is correct; the `authHeader()` helper is the right pattern

### `src/app/checklist/[setId]/page.tsx`
Keep:
- `CardsTab` with search, pagination, and the table layout is correct and handles large card lists appropriately
- `ParallelsTab` showing the color swatch + badge per parallel is exactly what the UX plan specifies
- `AddParallelModal` and `AddCardModal` use the correct bottom-sheet pattern
- `parallelColor()` function is the seed of a shared parallel color utility — must be extracted to `src/lib/parallelColor.ts` and expanded to match the full parallel color reference table in `styling-guidelines.md`
- The `getToken()` auth helper pattern is correct; consolidate with `authHeader()` from checklist/page.tsx into one shared `src/lib/auth.ts` utility

### `src/app/layout.tsx`
Keep exactly as-is:
- `Barlow_Condensed` + `Inter` font loading with correct weights (`600`, `700`, `800`) and CSS variables (`--font-display`, `--font-body`) is correct per styling-guidelines
- `min-h-screen bg-[#0A0A0B] text-[#F5F5F7]` body class is correct
- `pb-28` on the content wrapper correctly clears the fixed bottom nav

### `src/styles/globals.css`
Keep the existing `.input-field` definition. It is close but needs one correction (see Refactor section). The `prefers-reduced-motion` block is correct and must stay.

### `src/lib/database.types.ts`
Keep exactly as-is. All tables needed for Phase 2.5 are present (`sets`, `parallels`, `cards`). Do not regenerate unless a new migration lands.

### `src/lib/supabaseClient.ts`
Not read but presumed correct since scan and checklist are functioning. Keep.

---

## What to Refactor

### `src/components/BottomNav.tsx`
**Changes required:**

1. **Fix Collection route**: Change `href: '/'` to `href: '/collection'`. The root `/` route is a dev scaffolding page. The Collection tab must route to `/collection`. Update the active-state check: `pathname?.startsWith(tab.href)` with `tab.href !== '/'` guard is no longer needed once the root reference is removed.

2. **Fix colors**: Replace `border-slate-800` → `border-[#2A2A2F]`, `bg-slate-950/95` → `bg-[#0A0A0B]/95`, `text-cyan-300` (active) → `text-[#FF4713]`, `text-slate-500` (inactive) → `text-[#8E8E9A]`, `hover:text-slate-100` → `hover:text-[#F5F5F7]`.

3. **Fix active label visibility**: Per UX plan, inactive tabs show icon only with no label. Active tab shows icon + label. Add conditional `hidden` class to the label span when `!active`.

4. **Add Scan tab pill treatment**: The Scan tab needs an orange background circle behind the Camera icon regardless of active state. Wrap the Camera icon in a `rounded-full bg-[#FF4713] p-3` container. The Scan tab must use `Basketball` → `Camera` icon (already correct). Remove the label entirely from Scan — the pill is self-explaining per UX plan. Add pulsing orange ring animation class when scan is in progress (requires a `isScanActive` prop or a shared scan-state context).

5. **Fix `safe-area-inset-bottom`**: Add `pb-[env(safe-area-inset-bottom)]` to the nav container. Height target is 64px + safe area.

6. **Fix icon import**: Replace `Basketball` with the correct collection icon. Per UX plan context, use `Squares` or `SquaresFour` from Phosphor for Collection. `Basketball` is fine as a fallback but semantically wrong — `SquaresFour` matches the grid collection view.

**File**: `src/components/BottomNav.tsx`

---

### `src/styles/globals.css` — `.input-field` definition
**Changes required:**

The UX plan specifies the exact `input-field` style as: `rounded-xl border border-[#2A2A2F] bg-[#161618] px-4 py-3 text-sm text-[#F5F5F7] outline-none transition focus:border-[#FF4713]`.

Current implementation uses `bg-[#1F1F23]` (surface-raised) and `rounded-lg`. Correct to:
- `bg-[#161618]` (surface, not surface-raised)
- `rounded-xl` (not `rounded-lg`)
- `px-4 py-3` (not `px-3 py-2.5`)

Add an error state modifier class:
```css
.input-field-error {
  @apply input-field border-[#E8373A];
}
```

**File**: `src/styles/globals.css`

---

### `src/app/login/page.tsx`
**Changes required:**

Replace `SectionShell` wrapper with production login layout:
- Full-bleed dark background (`min-h-screen bg-[#0A0A0B]`), no shell card
- Centered column layout (`flex flex-col items-center justify-center`)
- App wordmark: `font-display text-4xl font-extrabold uppercase tracking-widest text-[#F5F5F7]`
- One-line subtext: `"Your collection stays private to your account."` in `text-[#8E8E9A] text-sm`
- Google button: `bg-[#FF4713] text-white` replacing the current `bg-cyan-400 text-slate-950`
- Loading state: button shows `CircleNotch` spinner + "Signing in…" text, `disabled`
- Error state: red inline message below button, not a toast

The auth logic (`getSession`, `onAuthStateChange`, `signInWithOAuth`) is correct — keep it entirely.

**File**: `src/app/login/page.tsx`

---

### `src/app/collection/page.tsx`
**Changes required:**

This page is a complete dev scaffolding tool. The Supabase fetch logic (`loadCollection`) and the type definitions (`CollectionCard`, `RelatedCard`, etc.) are worth extracting before deleting — the Supabase query structure is correct. Extract to `src/lib/queries/collection.ts` as a typed query helper.

The page itself must be rewritten (see "What to Build Net New" — Collection Page). The manual add form is replaced by the Scan flow. The raw data table is replaced by the search-first card grid.

Do not delete this file yet — mark it for replacement in Milestone 2.

**File**: `src/app/collection/page.tsx`

---

### `src/app/checklist/[setId]/page.tsx` — `parallelColor()` function
**Changes required:**

The existing `parallelColor()` function covers most cases but is missing several parallels from `styling-guidelines.md`:
- `snake_skin`, `checkerboard`, `cherry blossom`, `lotus flower`, `black finite` (gold border), `black velocity`, `pulsar` (gradient), `mojo` (gradient), `1-of-1` (rainbow gradient)

Extract to `src/lib/parallelColor.ts` and expand to cover the full table. The function signature should be:
```typescript
export function parallelHex(name: string): string
export function parallelIsAnimated(name: string): boolean
```

`parallelIsAnimated` returns `true` for Gold Vinyl, Gold Ice, Mojo, Black Finite, and 1-of-1. This drives the CSS animation class on `ParallelBadge`.

---

### `src/app/page.tsx` (root `/` route)
**Changes required:**

The root route currently serves the dev scaffolding home page. It must redirect to `/collection` for authenticated users and `/login` for unauthenticated. Replace the entire page content with a simple redirect:

```typescript
// src/app/page.tsx
import { redirect } from 'next/navigation';
export default function RootPage() {
  redirect('/collection');
}
```

Auth middleware (Next.js `middleware.ts`) handles the `/login` redirect for unauthenticated users across all protected routes. This is preferable to duplicating auth checks on every page — see Milestone 1.

**File**: `src/app/page.tsx`

---

## What to Delete

### `src/components/SectionShell.tsx`
**Delete entirely.** It uses `slate-` colors, `bg-slate-900/80`, `border-slate-800`, `text-cyan-300/80` — none of which are in the design token system. It creates a boxed desktop-style header card that competes with card content. It contains developer-facing placeholder copy in its description prop. No production screen should use this component.

**Replaces with:** Each page gets its own flat header section directly on `bg-[#0A0A0B]`. The shared page structure is handled by the new `PageLayout` wrapper component (see Component Architecture). There is no need for a general shell — the bottom nav and `pb-28` padding on the body div in `layout.tsx` already provide the structural frame.

**Dependency sweep before deletion:** `SectionShell` is imported in:
- `src/app/page.tsx` — replace page entirely
- `src/app/login/page.tsx` — refactor per above
- `src/app/collection/page.tsx` — replace page entirely
- `src/app/want-list/page.tsx` — replace page entirely
- `src/app/goals/page.tsx` — replace page entirely
- `src/app/ebay/page.tsx` — replace page entirely
- `src/app/profile/page.tsx` — replace page entirely

All must be resolved before `SectionShell.tsx` is deleted.

---

## What to Build Net New

### 1. `src/middleware.ts` — Auth Middleware
**Purpose:** Centralize the auth redirect logic that is currently duplicated via `useEffect` + `onAuthStateChange` in every page. Unauthenticated requests to any protected route redirect to `/login` at the edge. Authenticated requests to `/login` redirect to `/collection`.

**Structure:**
```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) { ... }
export const config = { matcher: ['/collection/:path*', '/scan', '/want-list/:path*', '/goals/:path*', '/ebay/:path*', '/checklist/:path*', '/profile'] }
```

Once middleware is in place, remove the `useEffect` auth guard from every page component that uses it.

---

### 2. `src/components/ui/BottomSheet.tsx` — Bottom Sheet Modal
**Purpose:** Standardize the `fixed inset-0 z-50 flex items-end` pattern used ad hoc in `AddSetModal`, `AddParallelModal`, and `AddCardModal` into a single reusable animated overlay.

**Props interface:**
```typescript
interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxHeight?: string // default '85vh'
}
```

**Renders:**
- Scrim: `fixed inset-0 bg-black/60 z-50`, click-to-dismiss
- Sheet: `fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-[#1F1F23] max-h-[85vh]`
- Drag handle: `w-9 h-1 rounded-full bg-[#2A2A2F] mx-auto mt-3 mb-4`
- Title row (if `title` prop provided): `font-display text-xl font-bold uppercase tracking-wider text-[#F5F5F7] px-6`
- Scrollable content area: `overflow-y-auto px-6 pb-6`
- Animation: CSS `translate-y` transition `250ms cubic-bezier(0.32, 0.72, 0, 1)`, open → `translate-y-0`, closed → `translate-y-full`
- On desktop (`sm:` breakpoint): centers as a modal with `max-w-md mx-auto rounded-3xl`

---

### 3. `src/components/ui/ParallelBadge.tsx` — Parallel Badge
**Purpose:** The single canonical implementation of parallel badge rendering. Used in Collection grid, Collection list, Scan Confirmation, Want List, Card Detail, Goal Detail.

**Props interface:**
```typescript
interface ParallelBadgeProps {
  name: string           // e.g. "Silver Prizm"
  size?: 'sm' | 'md'    // sm = 10px text, md = 11px (default)
  className?: string
}
```

**Renders:**
- Pill: `rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider`
- Background: `parallelHex(name)` at 15% opacity (`26` hex suffix)
- Border: `1px solid` at `parallelHex(name)` at 60% opacity (`99` hex suffix)
- Text: `parallelHex(name)` at 100%
- Animated wrapper: when `parallelIsAnimated(name)` is true, applies the relevant keyframe class (`animate-shimmer`, `animate-rainbow-border`, `animate-mojo-shift`) — suppressed by the global `prefers-reduced-motion` rule
- Unknown parallel fallback: when `name` is empty or "BASE?", renders with `text-[#8E8E9A] bg-[#8E8E9A]/15 border-[#8E8E9A]/60`

---

### 4. `src/components/ui/SkeletonCard.tsx` — Skeleton Card (Grid)
**Purpose:** Correct-aspect-ratio shimmer placeholder for Collection grid during loading. Must match the `aspect-[5/7]` card shape exactly.

**Props interface:**
```typescript
interface SkeletonCardProps {
  className?: string
}
```

**Renders:**
- `aspect-[5/7] rounded-xl bg-[#1F1F23] overflow-hidden relative`
- Shimmer overlay: `absolute inset-0 bg-gradient-to-r from-transparent via-[#2A2A2F]/60 to-transparent animate-shimmer bg-[length:200%_100%]`
- Add `animate-shimmer` keyframe to `globals.css` if not present: `0% { background-position: -200% center } 100% { background-position: 200% center }` at `1.5s ease-in-out infinite`

---

### 5. `src/components/ui/SkeletonRow.tsx` — Skeleton List Row
**Purpose:** 48px shimmer row for Want List, Goal Detail Still Need list, and eBay alert history during loading.

**Props interface:**
```typescript
interface SkeletonRowProps {
  lines?: 1 | 2        // default 2 (name + subtitle)
  className?: string
}
```

**Renders:**
- `h-12 flex items-center gap-3 px-4`
- Thumbnail placeholder: `w-10 h-10 rounded-xl bg-[#1F1F23] shimmer`
- Text lines: two shimmer rectangles of differing widths

---

### 6. `src/components/ui/EmptyState.tsx` — Empty State
**Purpose:** Consistent empty state block used across Collection (no cards), Want List (empty pipeline), Goals (no goals), eBay (no alerts).

**Props interface:**
```typescript
interface EmptyStateProps {
  icon: React.ReactNode          // Phosphor icon element
  headline: string
  body?: string
  action?: {
    label: string
    onClick: () => void
  }
}
```

**Renders:**
- `flex flex-col items-center gap-4 py-16 text-center`
- Icon: rendered at 48px in `text-[#2A2A2F]`
- Headline: `font-display text-xl font-bold uppercase text-[#F5F5F7]`
- Body: `text-sm text-[#8E8E9A] max-w-xs`
- Action button (if provided): `rounded-xl bg-[#FF4713] px-5 py-2.5 text-sm font-semibold text-white`

---

### 7. `src/components/ui/StatusBadge.tsx` — Want List Status Badge
**Purpose:** Renders the Wanted / Ordered / Received pill with the correct color per `styling-guidelines.md` section 8.

**Props interface:**
```typescript
type WantListStatus = 'wanted' | 'ordered' | 'received'

interface StatusBadgeProps {
  status: WantListStatus
  onClick?: () => void  // when provided, renders as a tappable button (for status advance)
  className?: string
}
```

**Renders:**
- Wanted: `bg-[#FF4713]/15 border border-[#FF4713]/60 text-[#FF4713]` + star icon
- Ordered: `bg-[#F5A623]/15 border border-[#F5A623]/60 text-[#F5A623]` + box icon
- Received: `bg-[#00C9A7]/15 border border-[#00C9A7]/60 text-[#00C9A7]` + check icon
- Minimum tap target when `onClick` is provided: `min-h-[44px] min-w-[44px]` — wrap in a `button` element

---

### 8. `src/components/ui/ConfidenceBadge.tsx` — Confidence Badge
**Purpose:** Extracts `confidenceLabel()` from `scan/page.tsx` into a rendered component. Used in Scan Confirmation and (future) Card Detail.

**Props interface:**
```typescript
interface ConfidenceBadgeProps {
  score: number   // 0.0 – 1.0
  className?: string
}
```

**Renders:** Pill badge matching existing scan page implementation: `text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border` with the teal/yellow/red color logic from `confidenceLabel()`.

---

### 9. `src/components/ui/TabBar.tsx` — Segmented Tab Bar
**Purpose:** The orange-active tab switcher used in Checklist (Sets/Import CSV), Set Detail (Parallels/Cards), Goal Detail (Have/Still Need). Currently duplicated inline. One shared component.

**Props interface:**
```typescript
interface TabBarProps<T extends string> {
  tabs: Array<{ key: T; label: string }>
  active: T
  onChange: (key: T) => void
  className?: string
}
```

**Renders:**
- `flex gap-1 rounded-2xl bg-[#161618] p-1`
- Each tab: `flex-1 rounded-xl py-2 text-sm font-semibold transition`
- Active: `bg-[#FF4713] text-white`
- Inactive: `text-[#8E8E9A] hover:text-[#F5F5F7]`

---

### 10. `src/components/collection/CardGrid.tsx` — Collection Card Grid
**Purpose:** The 2-column card grid view for Collection, with card image, bottom gradient overlay, player name, and parallel badge.

**Props interface:**
```typescript
interface CollectionCard {
  id: string
  player_name: string
  set_name: string
  card_number: string
  parallel_name: string | null
  scan_image_url: string | null
  condition: string | null
}

interface CardGridProps {
  cards: CollectionCard[]
  onCardTap: (id: string) => void
  loading?: boolean
}
```

**Renders:**
- `grid grid-cols-2 gap-3`
- Per card: `aspect-[5/7]` container with `next/image` or gradient placeholder
- Bottom gradient overlay: `absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 to-transparent`
- Player name: `font-display text-base font-semibold text-[#F5F5F7]` overlaid at bottom
- `ParallelBadge` bottom-left
- Loading state: renders 6 `SkeletonCard` instances

---

### 11. `src/components/collection/CardListItem.tsx` — Collection List Item
**Purpose:** Single-column list view row for Collection, showing more metadata.

**Props interface:**
```typescript
interface CardListItemProps {
  card: CollectionCard   // same type as CardGrid
  onTap: () => void
}
```

**Renders:**
- `flex items-center gap-3 min-h-[48px] px-4 py-3 border-b border-[#2A2A2F]`
- 48px thumbnail (card image or initials placeholder)
- Player name (Barlow 600 18px), set + card number (Inter 14px `text-[#8E8E9A]`)
- `ParallelBadge` inline
- Condition pill right-aligned

---

### 12. `src/app/collection/page.tsx` — Collection Page (Full Replacement)
**Purpose:** Search-first card browser with 2-col grid and list toggle. Replaces the dev scaffolding form+table.

**Structure:**
- Header: page title "COLLECTION" + avatar/gear link for Profile (top-right)
- `SearchBar` (full-width, auto-focus on tap)
- Filter chip row: "All" / "By Set" / "By Player" / "By Year" — horizontal scroll, `overflow-x-auto`
- Card count: `"{n} cards"` in `text-[#8E8E9A] text-sm`
- Grid/List toggle (icon buttons in header row)
- `CardGrid` or `CardListItem` list depending on toggle state (persisted to `localStorage`)
- Empty state via `EmptyState` component when 0 cards
- Loading state: 6 `SkeletonCard` instances
- Search-no-results state: `"No cards match '{query}'"` with "Scan this card" link

**Data:** Server Component or Route Handler fetch from `collection` table with `cards` and `sets` join. Remove all client-side manual-add form logic. Filter/search happens client-side against loaded results (acceptable for MVP collection size).

---

### 13. `src/app/want-list/page.tsx` — Want List Page (Full Replacement)
**Purpose:** Replaces the SectionShell placeholder with the three-section status pipeline.

**Structure (Phase 2.5 scope — data shell only, not wired to live Supabase):**
- Header: "WANT LIST" title + "+" button (opens AddWantSheet bottom sheet)
- Three stacked sections: WANTED, ORDERED, RECEIVED
- Each section: collapsible header with count, `StatusBadge`, and icon; empty sections collapse to a 40px placeholder row showing "Nothing here yet"
- Each want item row: 48px min-height, player name + set/parallel, `StatusBadge` (tappable), max price right-aligned, bell icon for alert toggle
- `EmptyState` shown when all three sections are empty
- Loading: `SkeletonRow` instances per section
- `AddWantSheet` bottom sheet: player name, set, card number, max price fields with `input-field` class

**Note:** In Phase 2.5 this page renders correctly with empty state and the correct structural shell. Supabase data wiring for want-list CRUD is a Phase 3 deliverable.

---

### 14. `src/app/goals/page.tsx` — Goals Page (Full Replacement)
**Purpose:** Replaces the SectionShell placeholder with the goal list structure.

**Structure (Phase 2.5 scope — structural shell only):**
- Header: "GOALS" title + "Create Goal" button (header right)
- List of goal cards: each has goal name (Barlow 600 18px), progress bar (`w-full h-1.5 rounded-full bg-[#1F1F23]` with orange fill), progress badge ("47 / 150")
- Progress bar color transitions based on percentage: `<30%` → `bg-[#E8373A]`, `30–60%` → `bg-[#F5A623]`, `>60%` → `bg-[#FF4713]`, `100%` → `bg-[#00C9A7]`
- `EmptyState` for zero goals state
- Loading: skeleton goal cards

**Note:** Data wiring is Phase 3. Shell must be structurally correct with representative empty/loading states.

---

### 15. `src/app/ebay/page.tsx` — eBay Page (Full Replacement)
**Purpose:** Replaces the SectionShell placeholder with the three-section eBay hub layout.

**Structure (Phase 2.5 scope — structural shell only):**
- Header: "EBAY" title
- Three vertically stacked sections with section headers:
  - Alert History: empty state "No alerts yet — add a card to your want list with a max price to get started"
  - Alert Status: empty state "0 cards being watched"
  - Listing Generator: "Generate listing for…" entry point, disabled state with muted text
- Each section header uses a consistent pattern: `text-xs font-semibold uppercase tracking-widest text-[#8E8E9A] mb-2`

**Note:** Data wiring is Phase 4. Shell must be structurally correct.

---

### 16. `src/app/profile/page.tsx` — Profile Page (Full Replacement)
**Purpose:** Replaces the SectionShell placeholder with the account preferences screen.

**Structure:**
- Back navigation to Collection
- Avatar circle (Google photo or initials, derived from Supabase session)
- Display name (inline editable — tap activates an `input-field`)
- eBay alert email field (defaults to auth email)
- Alert frequency segmented selector (Hourly / Daily / Weekly) using `TabBar` component
- "Checklists" link → `/checklist`
- "Sign Out" button at bottom: `border border-[#E8373A] text-[#E8373A]` ghost button with confirmation

**Data:** Uses Supabase session for avatar + email. Reads/writes `profiles` table for display name, `ebay_alert_email`, and `ebay_search_frequency`.

---

### 17. `src/lib/parallelColor.ts` — Parallel Color Utility (Extraction + Expansion)
**Purpose:** Single source of truth for mapping parallel names to hex colors and animation flags.

```typescript
export function parallelHex(name: string): string
export function parallelIsAnimated(name: string): boolean
```

Covers the complete parallel table from `styling-guidelines.md` section 5. Extracted from `checklist/[setId]/page.tsx` and expanded.

---

### 18. `src/lib/confidence.ts` — Confidence Label Utility (Extraction)
**Purpose:** Extracted from `scan/page.tsx`. Returns label + Tailwind color string.

```typescript
export function confidenceLabel(score: number): { label: string; color: string }
```

---

### 19. `src/lib/auth.ts` — Auth Token Helper (Consolidation)
**Purpose:** Consolidates `authHeader()` (checklist/page.tsx) and `getToken()` (checklist/[setId]/page.tsx) into one shared utility.

```typescript
export async function getAuthHeader(): Promise<string | null>
// Returns 'Bearer {token}' or null if no session
```

---

## Component Architecture

### `BottomNav` (refactored, not new)
**File:** `src/components/BottomNav.tsx`
```typescript
interface Tab {
  href: string
  label: string
  icon: React.ComponentType<{ size: number; weight?: string }>
  isScan?: boolean   // triggers pill treatment
}
// No external props — self-contained with usePathname
```
**Responsibility:** Fixed bottom navigation. 5 tabs. Active state in orange. Inactive icon-only. Scan tab always shows orange pill. Respects safe area insets. Background `bg-[#0A0A0B]/95 backdrop-blur-md`.

---

### `BottomSheet`
**File:** `src/components/ui/BottomSheet.tsx`
```typescript
interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxHeight?: string
}
```
**Responsibility:** Animated slide-up overlay. Scrim dismiss. Drag handle. Scrollable content area. Used for: AddSetModal, AddParallelModal, AddCardModal, AddWantSheet, eBay Comps (Phase 4). All ad hoc modal implementations in checklist pages migrate to use this.

---

### `ParallelBadge`
**File:** `src/components/ui/ParallelBadge.tsx`
```typescript
interface ParallelBadgeProps {
  name: string
  size?: 'sm' | 'md'
  className?: string
}
```
**Responsibility:** Canonical parallel badge. Derives color from `parallelHex()`. Applies shimmer/glow animation when `parallelIsAnimated()` is true. Renders unknown parallels with neutral styling. Used in every surface that shows a parallel.

---

### `TabBar`
**File:** `src/components/ui/TabBar.tsx`
```typescript
interface TabBarProps<T extends string> {
  tabs: Array<{ key: T; label: string }>
  active: T
  onChange: (key: T) => void
  className?: string
}
```
**Responsibility:** Orange-active segmented control. Used in Checklist, Set Detail, Goal Detail. Eliminates three copies of the inline tab-bar pattern.

---

### `Field`
**File:** `src/components/ui/Field.tsx`
```typescript
interface FieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}
```
**Responsibility:** Label + input wrapper with error state. Extracted from scan page. The `error` prop shows red inline message below the input (`text-sm text-[#E8373A] mt-1`). Validation fires on blur, not keystroke. Used everywhere there are form fields.

---

### `CardGrid`
**File:** `src/components/collection/CardGrid.tsx`
```typescript
interface CollectionCard {
  id: string
  player_name: string
  set_name: string
  card_number: string
  parallel_name: string | null
  scan_image_url: string | null
  condition: string | null
}
interface CardGridProps {
  cards: CollectionCard[]
  onCardTap: (id: string) => void
  loading?: boolean
}
```
**Responsibility:** 2-column card image grid with gradient overlay, player name, and `ParallelBadge`. Shows `SkeletonCard` instances when `loading` is true.

---

### `CardListItem`
**File:** `src/components/collection/CardListItem.tsx`
```typescript
interface CardListItemProps {
  card: CollectionCard
  onTap: () => void
  onLongPress?: () => void
}
```
**Responsibility:** Single-column list row with 48px thumbnail, metadata, and `ParallelBadge`. `onLongPress` will trigger the quick-action sheet (Phase 3 feature, wired in Phase 2.5 as a no-op).

---

### `SkeletonCard`
**File:** `src/components/ui/SkeletonCard.tsx`
```typescript
interface SkeletonCardProps {
  className?: string
}
```
**Responsibility:** `aspect-[5/7]` shimmer rectangle. Only component allowed to represent a loading card in grid view.

---

### `SkeletonRow`
**File:** `src/components/ui/SkeletonRow.tsx`
```typescript
interface SkeletonRowProps {
  lines?: 1 | 2
  showThumbnail?: boolean
  className?: string
}
```
**Responsibility:** 48px shimmer list row. Used in Want List, Goal Detail, eBay sections.

---

### `EmptyState`
**File:** `src/components/ui/EmptyState.tsx`
```typescript
interface EmptyStateProps {
  icon: React.ReactNode
  headline: string
  body?: string
  action?: { label: string; onClick: () => void }
}
```
**Responsibility:** Centered empty state for any list or section with zero items. Consistent icon size (48px, `text-[#2A2A2F]`), Barlow headline, optional orange CTA.

---

### `StatusBadge`
**File:** `src/components/ui/StatusBadge.tsx`
```typescript
type WantListStatus = 'wanted' | 'ordered' | 'received'
interface StatusBadgeProps {
  status: WantListStatus
  onClick?: () => void
  className?: string
}
```
**Responsibility:** Want List status pill. Tappable when `onClick` is provided (status advance). Color + icon per `styling-guidelines.md` section 8.

---

### `ConfidenceBadge`
**File:** `src/components/ui/ConfidenceBadge.tsx`
```typescript
interface ConfidenceBadgeProps {
  score: number
  className?: string
}
```
**Responsibility:** Teal/yellow/red confidence pill. Wraps `confidenceLabel()` utility. Used in Scan Confirmation.

---

## Implementation Sequence

### Milestone 1: Foundation (No visible regressions — app still works end-to-end)

**Goal:** Lay the shared infrastructure that everything else depends on. No page content changes yet.

**Step 1.** Create `src/middleware.ts` with auth redirect logic. Test that `/collection` redirects unauthenticated users to `/login` and that `/login` redirects authenticated users to `/collection`. Remove `useEffect` auth guards from `want-list/page.tsx`, `goals/page.tsx`, `ebay/page.tsx`, `profile/page.tsx` once middleware is confirmed working. Keep auth guards in `scan/page.tsx` and `collection/page.tsx` for now (those pages have more complex auth-dependent state).

**Step 2.** Add `animate-shimmer` keyframe to `src/styles/globals.css`. Correct the `.input-field` definition (bg, padding, border-radius per spec above). Add `.input-field-error` modifier class.

**Step 3.** Create `src/lib/parallelColor.ts` — extract and expand `parallelColor()` from `checklist/[setId]/page.tsx`.

**Step 4.** Create `src/lib/confidence.ts` — extract `confidenceLabel()` from `scan/page.tsx`. Update `scan/page.tsx` to import from the new location.

**Step 5.** Create `src/lib/auth.ts` — consolidate `authHeader()` and `getToken()`. Update `checklist/page.tsx` and `checklist/[setId]/page.tsx` to import from the new location.

**Step 6.** Refactor `src/components/BottomNav.tsx`: fix route (`/` → `/collection`), fix all colors (slate → token values), add Scan pill, fix active/inactive label visibility, add safe-area padding.

**Step 7.** Update `src/app/page.tsx` to redirect to `/collection`.

**End of Milestone 1:** App navigates correctly. Bottom nav shows correct WNBA styling. Shared utilities are in place. All existing pages still load. No `SectionShell` has been touched yet.

---

### Milestone 2: Shared UI Components

**Goal:** Build the full shared component library before touching any pages. All components are built and visually testable before replacing any page.

**Step 8.** Build `src/components/ui/BottomSheet.tsx`. Test by replacing `AddSetModal` in `checklist/page.tsx` to use the new component — this is the lowest-risk test case since the checklist page already works.

**Step 9.** Build `src/components/ui/TabBar.tsx`. Replace inline tab-bar code in `checklist/page.tsx` and `checklist/[setId]/page.tsx`. Visual regression check: tab behavior must be identical.

**Step 10.** Update `checklist/[setId]/page.tsx` to use `BottomSheet` for `AddParallelModal` and `AddCardModal`. Update `parallelColor()` call to `parallelHex()` from the new utility.

**Step 11.** Build `src/components/ui/ParallelBadge.tsx`. Replace the inline parallel badge spans in `checklist/[setId]/page.tsx`'s `ParallelsTab`. Confirm all parallel colors render correctly.

**Step 12.** Build `src/components/ui/Field.tsx`. Update `scan/page.tsx` to use the new `Field` component (it already uses the same pattern inline — this is a drop-in replacement).

**Step 13.** Build `src/components/ui/EmptyState.tsx`. Build `src/components/ui/SkeletonCard.tsx`. Build `src/components/ui/SkeletonRow.tsx`. Build `src/components/ui/StatusBadge.tsx`. Build `src/components/ui/ConfidenceBadge.tsx`. Update `scan/page.tsx` to use `ConfidenceBadge`.

**Step 14.** Build `src/components/collection/CardGrid.tsx` and `src/components/collection/CardListItem.tsx`.

**End of Milestone 2:** Full shared component library exists and is tested against the checklist and scan pages (the two most complete pages). All components render correctly. No placeholder SectionShell pages have been changed yet.

---

### Milestone 3: Collection Page

**Goal:** Replace the dev scaffolding collection page with the production search-and-browse UI.

**Step 15.** Extract the Supabase collection query from `collection/page.tsx` to `src/lib/queries/collection.ts` as a typed async function.

**Step 16.** Rewrite `src/app/collection/page.tsx` using `CardGrid`, `CardListItem`, `EmptyState`, `SkeletonCard`. Wire to the collection query. Implement search filtering client-side. Implement grid/list toggle with `localStorage` persistence. Add filter chip row (static chips, filter logic client-side on loaded data).

**Step 17.** Remove `SectionShell` import from `collection/page.tsx` (it will be gone after the rewrite). Confirm the checklist link is now accessible from the Profile page instead of the Collection header.

**End of Milestone 3:** Collection page is production-quality. Search works. Grid/list toggle works. Empty state works. Skeleton loader works. `SectionShell` is no longer imported in `collection/page.tsx`.

---

### Milestone 4: Login and Profile Pages

**Goal:** Replace the two remaining auth-adjacent pages.

**Step 18.** Rewrite `src/app/login/page.tsx`: remove `SectionShell`, implement production WNBA-branded layout (full-bleed dark, centered wordmark, orange Google button).

**Step 19.** Rewrite `src/app/profile/page.tsx`: remove `SectionShell`, implement account preferences layout. Wire to `profiles` table for display name and alert preferences. Add "Checklists" link. Add Sign Out with confirmation.

**End of Milestone 4:** Login feels like a production app, not a dev tool. Profile is functional. `SectionShell` is no longer imported in either file.

---

### Milestone 5: Placeholder Page Shells (Want List, Goals, eBay)

**Goal:** Replace the three SectionShell placeholder pages with correctly structured shells that match the UX plan layout — even though data wiring is not done yet.

**Step 20.** Rewrite `src/app/want-list/page.tsx`: implement three-section structure (WANTED / ORDERED / RECEIVED) with correct section headers, `StatusBadge`, `EmptyState`, `SkeletonRow`, and the "+" button that opens a `BottomSheet` with the add-want form fields. Sections show empty state copy per UX plan (not placeholder developer text).

**Step 21.** Rewrite `src/app/goals/page.tsx`: implement goal list shell with progress bar pattern, goal type chip, `EmptyState`, `SkeletonRow`, "Create Goal" header button (opens a `BottomSheet` — form fields stubbed with `input-field` class).

**Step 22.** Rewrite `src/app/ebay/page.tsx`: implement three-section hub layout (Alert History, Alert Status, Listing Generator) with correct section headers, correct empty states per UX plan copy, no placeholder developer text.

**Step 23.** After Steps 20–22, `SectionShell` is no longer imported anywhere. Delete `src/components/SectionShell.tsx`.

**End of Milestone 5:** All five tab destinations look like production screens. The app has no placeholder text, no slate-color scaffolding, no developer-facing copy. `SectionShell` is gone. All screens use the correct token-based color system.

---

### Milestone 6: Checklist Completion (Phase 2.5 Primary Deliverable)

**Goal:** Complete the checklist admin surface — the primary new feature of Phase 2.5. All existing checklist functionality is retained; gaps are filled.

**Step 24.** Add parallel editing to `checklist/[setId]/page.tsx` `ParallelsTab`: tapping a parallel row opens a `BottomSheet` with editable fields for name, color hex, finish description, print run, is_numbered, is_base, notes. Wire to `PATCH /api/checklist/sets/[setId]/parallels` (new route needed).

**Step 25.** Add parallel deletion: swipe-left on a parallel row reveals a red "DELETE" zone. Confirm via a small inline prompt (not a modal). Wire to `DELETE /api/checklist/sets/[setId]/parallels/[parallelId]`.

**Step 26.** Add card deletion to `CardsTab`: swipe-left on a card row reveals "DELETE" zone with confirm. Wire to `DELETE /api/checklist/sets/[setId]/cards/[cardId]`.

**Step 27.** Add card editing: tapping a card row in the table opens a `BottomSheet` with card number, player name, team, rookie_card fields. Wire to `PATCH /api/checklist/sets/[setId]/cards/[cardId]`.

**Step 28.** Add set deletion on `checklist/page.tsx`: a long-press or swipe-left on a set row in `SetsTab` reveals "DELETE" with confirmation text "This will delete the set, all its cards, and all its parallels." Wire to `DELETE /api/checklist/sets/[setId]`.

**Step 29.** Add set editing: from Set Detail header, add a gear icon that opens a `BottomSheet` with set name, year, manufacturer fields. Wire to `PATCH /api/checklist/sets/[setId]`.

**Step 30.** Audit the `ImportTab` result display: confirm `Stat` component uses correct token colors (it does — `bg-[#1F1F23]` is correct). No changes needed.

**Step 31.** Final audit: confirm all pages use `font-display` (Barlow Condensed) for all headings and page titles. Confirm no `slate-`, `cyan-`, or `rose-` color classes remain anywhere in `src/`. Confirm all forms use `input-field` class consistently.

**End of Milestone 6 (Phase 2.5 Complete):** The app has a fully functional checklist admin surface with set, card, and parallel CRUD. The entire frontend uses the correct Tailwind token system with no scaffolding artifacts. All shared UI components are in place and reusable for Phase 3. The scan pipeline is unchanged and fully functional. The Collection page is production-quality. The Want List, Goals, and eBay pages are correctly structured shells ready for Phase 3 data wiring.

---

## Files Created or Modified Summary

| Action | Path |
|--------|------|
| DELETE | `src/components/SectionShell.tsx` |
| REWRITE | `src/app/page.tsx` |
| REWRITE | `src/app/login/page.tsx` |
| REWRITE | `src/app/collection/page.tsx` |
| REWRITE | `src/app/want-list/page.tsx` |
| REWRITE | `src/app/goals/page.tsx` |
| REWRITE | `src/app/ebay/page.tsx` |
| REWRITE | `src/app/profile/page.tsx` |
| REFACTOR | `src/components/BottomNav.tsx` |
| REFACTOR | `src/styles/globals.css` |
| REFACTOR | `src/app/checklist/page.tsx` |
| REFACTOR | `src/app/checklist/[setId]/page.tsx` |
| REFACTOR | `src/app/scan/page.tsx` (extract utilities only) |
| CREATE | `src/middleware.ts` |
| CREATE | `src/lib/parallelColor.ts` |
| CREATE | `src/lib/confidence.ts` |
| CREATE | `src/lib/auth.ts` |
| CREATE | `src/lib/queries/collection.ts` |
| CREATE | `src/components/ui/BottomSheet.tsx` |
| CREATE | `src/components/ui/TabBar.tsx` |
| CREATE | `src/components/ui/ParallelBadge.tsx` |
| CREATE | `src/components/ui/Field.tsx` |
| CREATE | `src/components/ui/EmptyState.tsx` |
| CREATE | `src/components/ui/SkeletonCard.tsx` |
| CREATE | `src/components/ui/SkeletonRow.tsx` |
| CREATE | `src/components/ui/StatusBadge.tsx` |
| CREATE | `src/components/ui/ConfidenceBadge.tsx` |
| CREATE | `src/components/collection/CardGrid.tsx` |
| CREATE | `src/components/collection/CardListItem.tsx` |
| ADD API ROUTE | `src/app/api/checklist/sets/[setId]/parallels/[parallelId]/route.ts` (PATCH, DELETE) |
| ADD API ROUTE | `src/app/api/checklist/sets/[setId]/cards/[cardId]/route.ts` (PATCH, DELETE) |
