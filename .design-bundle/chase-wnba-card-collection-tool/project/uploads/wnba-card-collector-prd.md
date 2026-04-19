# WNBA Card Collector — Product Requirements Document

**Version:** 0.2 (Living Document)
**Owner:** Brook
**Last Updated:** April 17, 2026 (Phase 2 complete)
**Stack:** Next.js · Supabase · Vercel · Claude Vision API · eBay API · Resend
**Companion Docs:** `styling-guidelines.md` (UI/UX, design tokens, component patterns)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [User Stories](#3-user-stories)
4. [Technical Architecture](#4-technical-architecture)
5. [Data Model](#5-data-model)
6. [Feature Specifications](#6-feature-specifications)
7. [AI Card Identification Pipeline](#7-ai-card-identification-pipeline)
8. [eBay Integration](#8-ebay-integration)
9. [UI/UX Requirements](#9-uiux-requirements)
10. [Authentication & Multi-User](#10-authentication--multi-user)
11. [Build Phases](#11-build-phases)
12. [Open Questions & Decisions Log](#12-open-questions--decisions-log)

---

## 1. Product Overview

A personal WNBA trading card collection management application. The primary user is a serious WNBA card collector who needs tooling to catalogue her collection, pursue set-completion goals, track wants, avoid duplicate purchases, and support buying and selling on eBay — all from a mobile-friendly interface.

Built for one user initially, with multi-user architecture in place from the start to support future expansion.

### Core Value Props

- **Scan-to-catalogue:** Photograph a card, have AI identify it (player, set, parallel), confirm, and add to collection in seconds
- **No duplicate buys:** Real-time inventory lookup at card shows or from the couch
- **Goal tracking:** Know exactly which cards you still need for set-completion targets
- **eBay intelligence:** Automated want-list alerts for deals; on-demand comps for cards you're selling

---

## 2. Goals & Non-Goals

### Goals

- Catalogue collection accurately, including parallel identification
- Support major WNBA sets (Donruss, Prizm, Select) with extensible checklist management
- Track want list status: **Wanted → Ordered → Received**
- Set-completion goal tracking
- eBay want-list alert emails (scheduled search, price threshold)
- On-demand eBay sold comp pricing for target sell cards
- eBay listing copy generation
- Mobile-first, beautiful UI

### Non-Goals (MVP)

- Batch binder-page scanning (deferred to post-MVP)
- Automated eBay listing submission (generate copy only, user posts)
- Grading integration (PSA/BGS lookup)
- Price history charting (possible future feature)
- Public collection sharing
- Support for non-WNBA cards
- Cataloguing low-value base/non-name cards (user's choice per card)

---

## 3. User Stories

### Collection Management

| ID | As a collector, I want to... | So that... |
|----|------------------------------|------------|
| U1 | Photograph a card and have it identified | I can add it to my collection without manual data entry |
| U2 | See the top 3 AI identification candidates with confidence | I can correct misidentifications before committing |
| U3 | Manually add a card if AI fails | No card gets left out |
| U4 | View my full collection, filterable by player / set / parallel | I can browse and find specific cards |
| U5 | Look up whether I own a specific card at a card show | I don't buy duplicates |
| U6 | Mark cards as owned in multiples, with condition notes | I know which dupes I have to trade/sell |

### Want List & Goals

| ID | As a collector, I want to... | So that... |
|----|------------------------------|------------|
| W1 | Add cards to my want list with a status (Wanted / Ordered / Received) | I track the full pipeline from desire to delivery |
| W2 | Set a max price per want | eBay alerts only fire when it's actually a deal |
| W3 | Define a set-completion goal (e.g. 2024 Prizm Base) | The app shows me what I still need vs. have |
| W4 | See a goal's completion percentage and remaining card list | I can prioritize my hunt |
| W5 | Promote a card from Want List to Collection in one tap when it arrives | Status management is frictionless |

### eBay

| ID | As a collector, I want to... | So that... |
|----|------------------------------|------------|
| E1 | Get an email alert when a want-list card lists under my max price | I catch deals without constant searching |
| E2 | Pull current sold comp prices for any card I'm thinking of selling | I price accurately and quickly |
| E3 | Generate eBay listing title and description from a card in my collection | Listing creation is fast and consistent |
| E4 | See recent sold comps inline when viewing a card | I always know approximate market value |

### Checklist Management

| ID | As a collector, I want to... | So that... |
|----|------------------------------|------------|
| C1 | Add a new set with its checklist (player, card number) | The AI has reference data for identification |
| C2 | Add parallels to a set with visual descriptor notes | Stage 2 AI identification is more accurate |
| C3 | Import a checklist from a CSV | I don't have to enter 100+ cards manually |
| C4 | Add new sets as they release | The app stays current |

---

## 4. Technical Architecture

```
┌─────────────────────────────────────────────┐
│              Vercel (Next.js)               │
│   Mobile-first React UI · App Router        │
│   Server Components + Client Components     │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│              Supabase                        │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Postgres │ │   Auth   │ │   Storage   │  │
│  │  (RLS)   │ │  Google  │ │ Card images │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
│  ┌──────────────────────────────────────┐   │
│  │         Edge Functions               │   │
│  │  · Claude Vision pipeline            │   │
│  │  · eBay search + alert logic         │   │
│  │  · Resend email dispatch             │   │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐   │
│  │   pg_cron (Scheduled Jobs)           │   │
│  │  · eBay want-list search (interval)  │   │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                 │                │
    ┌────────────▼──┐    ┌───────▼──────────┐
    │  Claude API   │    │    eBay APIs      │
    │  Vision       │    │  Browse API       │
    │  claude-      │    │  Finding API      │
    │  sonnet-4-6   │    │  (sold comps)     │
    └───────────────┘    └──────────────────┘
                                  │
                         ┌────────▼─────────┐
                         │     Resend        │
                         │  Alert emails    │
                         └──────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend framework | Next.js App Router | Vercel-native, RSC for performance, mobile-responsive |
| Scan flow (MVP) | One card at a time | Faster to ship; batch deferred |
| AI model | claude-sonnet-4-6 | Best vision + instruction following at time of build |
| Email | Resend | Free tier, Edge Function friendly, React Email support |
| Auth | Supabase + Google OAuth | Existing familiarity, frictionless on mobile |
| Storage | Supabase Storage | Scan image retention, same auth context |

---

## 5. Data Model

### Schema

```sql
-- USERS (managed by Supabase Auth, extended)
-- auth.users is Supabase-managed; extend via:
create table public.profiles (
  id uuid references auth.users(id) primary key,
  display_name text,
  ebay_alert_email text,        -- defaults to auth email; can override
  ebay_search_frequency text default 'daily',  -- 'hourly' | 'daily' | 'weekly'
  created_at timestamptz default now()
);

-- SETS
create table public.sets (
  id uuid primary key default gen_random_uuid(),
  name text not null,            -- e.g. "2024 Panini Prizm WNBA"
  year int not null,
  manufacturer text,             -- Panini, Donruss, etc.
  notes text,
  created_at timestamptz default now()
);

-- PARALLELS (per set)
create table public.parallels (
  id uuid primary key default gen_random_uuid(),
  set_id uuid references public.sets(id) on delete cascade,
  name text not null,            -- e.g. "Silver Prizm"
  short_code text,               -- e.g. "SIL"
  color_description text,        -- e.g. "Silver holographic refractor border"
  finish_description text,       -- e.g. "Refractor finish, rainbow shimmer"
  print_run int,                 -- null = unlimited
  is_numbered boolean default false,
  is_base boolean default false, -- true for the base (non-parallel)
  sort_order int default 0,      -- display ordering
  notes text                     -- any additional AI prompt hints
);

-- CARDS (checklist entries)
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  set_id uuid references public.sets(id) on delete cascade,
  card_number text not null,     -- e.g. "42" or "42A"
  player_name text not null,
  team text,
  rookie_card boolean default false,
  notes text,
  created_at timestamptz default now(),
  unique(set_id, card_number)
);

-- COLLECTION (user owns card + parallel)
create table public.collection (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  card_id uuid references public.cards(id),
  parallel_id uuid references public.parallels(id),
  serial_number text,            -- e.g. "47/99" — null if not numbered
  quantity int default 1,
  condition text,                -- Raw, NM, EX, etc.
  cost_paid numeric(8,2),
  acquisition_date date,
  notes text,
  scan_image_url text,           -- Supabase Storage URL
  created_at timestamptz default now()
);

-- WANT LIST
create table public.want_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  card_id uuid references public.cards(id),
  parallel_id uuid references public.parallels(id),
  status text default 'wanted',  -- 'wanted' | 'ordered' | 'received'
  max_price numeric(8,2),
  priority int default 3,        -- 1 (high) to 5 (low)
  source text,                   -- e.g. "eBay seller", "COMC"
  tracking_number text,
  notes text,
  ebay_alert_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- COLLECTION GOALS
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,            -- e.g. "All Fearless Blue Pulsar", "Clark 2024 Prizm"
  goal_type text not null,       -- 'insert_set' | 'insert_parallel' | 'player' | 'custom'
  set_id uuid references public.sets(id),
  insert_name text,              -- e.g. "Fearless" — null if base set
  parallel_id uuid references public.parallels(id),  -- null = any parallel
  player_filter text,            -- player name filter for 'player' type goals
  active boolean default true,
  created_at timestamptz default now()
);

-- GOAL CARDS (explicit card list for 'custom' goals; auto-derived for others)
create table public.goal_cards (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals(id) on delete cascade,
  card_id uuid references public.cards(id),
  parallel_id uuid references public.parallels(id)
);

-- SCAN SESSIONS
create table public.scan_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  image_url text not null,       -- Supabase Storage URL
  status text default 'pending', -- 'pending' | 'identified' | 'confirmed' | 'failed'
  created_at timestamptz default now()
);

-- SCAN RESULTS (AI candidates per session)
create table public.scan_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.scan_sessions(id) on delete cascade,
  rank int not null,             -- 1 = top candidate
  card_id uuid references public.cards(id),
  parallel_id uuid references public.parallels(id),
  confidence numeric(4,3),       -- 0.000 to 1.000
  serial_detected text,          -- serial number if Claude read it
  stage1_response jsonb,         -- raw Stage 1 Claude output
  stage2_response jsonb,         -- raw Stage 2 Claude output
  confirmed boolean default false,
  created_at timestamptz default now()
);

-- EBAY SEARCHES (scheduled, per user want list item)
create table public.ebay_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  want_list_id uuid references public.want_list(id) on delete cascade,
  alert_type text default 'both',  -- 'new_listing' | 'price_drop' | 'both'
  last_run_at timestamptz,
  last_result_count int,
  active boolean default true
);

-- EBAY ALERTS (sent log + price tracking for drop detection)
create table public.ebay_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  want_list_id uuid references public.want_list(id),
  ebay_listing_id text,
  listing_title text,
  listing_price numeric(8,2),
  last_seen_price numeric(8,2),   -- for price drop detection
  listing_url text,
  alert_type text,                 -- 'new_listing' | 'price_drop'
  sent_at timestamptz default now(),
  last_checked_at timestamptz default now()
);

-- EBAY CURRENT LISTINGS CACHE (active BIN listings, 4hr TTL)
-- Note: Sold Comps API unavailable; pricing based on current active listings only
create table public.ebay_comps (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.cards(id),
  parallel_id uuid references public.parallels(id),
  ebay_item_id text unique,
  current_price numeric(8,2),
  listing_type text,              -- 'FixedPrice' | 'BestOffer'
  listing_title text,
  listing_url text,
  fetched_at timestamptz default now()
);
```

### Row Level Security (RLS) Policy Pattern

All user-owned tables use:
```sql
-- Users can only see and modify their own rows
create policy "user_isolation" on public.collection
  using (user_id = auth.uid());
```

Sets, cards, and parallels are shared reference data — readable by all authenticated users, writable only by admin role (or the user who created them for now).

---

## 6. Feature Specifications

### 6.1 Collection Management

**Card Detail View**
- Card image (scan or placeholder)
- Player name, set, year, card number
- Parallel badge (color-coded)
- Serial number (if applicable)
- Condition, cost paid, acquisition date
- Current eBay comp price (on-demand pull)
- Actions: Edit · Add to Want List · Generate eBay Listing · Delete

**Collection List View**
- Search by player name
- Filter by: set, parallel, year, team
- Sort by: player, acquisition date, value
- Quick stats header: total cards, estimated value

**Quick Lookup (Mobile)**
- Prominent search bar at top
- Instant "Do I own this?" lookup by player + set
- Designed for card show use: large text, minimal taps

### 6.2 Want List

**Status Pipeline**

```
[Wanted] → [Ordered] → [Received → auto-promote to Collection]
```

- Status changed by tap/swipe on mobile
- "Received" triggers a prompt: "Add to collection now?"
- Max price field drives eBay alert threshold
- Priority field (1–5) drives alert email ordering

**Want List View**
- Grouped by status (three columns or tabs on mobile)
- eBay alert badge: active / paused per item
- Tap item → detail with recent eBay comps

### 6.3 Collection Goals

Goals are flexible — not just "complete a full set" but any defined subset of cards you're chasing. Examples:

- All 150 Base Silver Prizms
- All 15 Fearless Blue Pulsar inserts
- All Caitlin Clark cards across any set
- All /99 or lower parallels of A'ja Wilson

**Goal Types**

| Type | Definition | Example |
|------|-----------|---------|
| Full insert set | Every card in an insert name | All 15 "Fearless" base |
| Insert + parallel | Every card in an insert + specific parallel | All 15 "Fearless Blue Pulsar" |
| Player across set | All cards of one player in one product | All Clark cards in 2024 Prizm |
| Custom | User-defined card list | Hand-picked want targets |

**Goal Configuration**
- Name (free text)
- Scope: pick from set → optionally filter by insert name → optionally filter by parallel
- Or: player filter across a full product
- Or: manual card list (custom goal)

**Goal Detail View**
- Progress bar: X of Y cards owned
- Two tabs: **Have** / **Still Need**
- "Still Need" items are one-tap addable to Want List
- Sort Still Need by card number, player name, or estimated value

### 6.4 Checklist Management

**Set Management UI**
- Create set (name, year, manufacturer)
- Add parallels with visual descriptors
- Add cards individually or import via CSV

**Beckett Master Sheet Import (Primary Format)**

The Beckett checklist Excel files (e.g., `2024-Panini-Prizm-WNBA-Basketball-Checklist.xlsx`) use a flat structure in the **Master** tab. Import should target this tab.

| Beckett Column | Maps To | Notes |
|---------------|---------|-------|
| `Card Set` | `insert_name` + `parallel_name` | Requires parsing — see below |
| `Card Number` | `cards.card_number` | Integer, stored as text |
| `Athlete` | `cards.player_name` | |
| `Team` | `cards.team` | |
| `Sequence` | `parallels.print_run` | String `/99` or Excel date serial (= 1/1) |

**Card Set Parsing Logic**

The `Card Set` field encodes both the insert/base set name and the parallel in one string:

```
"Base"                    → insert="Base",      parallel="Base (non-refractor)"
"Base Prizms Silver"      → insert="Base",      parallel="Silver"
"Base Prizms Gold Vinyl"  → insert="Base",      parallel="Gold Vinyl"
"Fearless"                → insert="Fearless",  parallel="Base"
"Fearless Prizms Blue"    → insert="Fearless",  parallel="Blue"
"Signatures"              → insert="Signatures", parallel="Base"
"Signatures Prizms Gold"  → insert="Signatures", parallel="Gold"
```

Parsing rule: split on ` Prizms ` if present — left side = insert name, right side = parallel name. If no ` Prizms `, full string = insert name, parallel = "Base".

**Sequence Parsing Logic**
- String like `/99` → parse integer: `print_run = 99`
- `datetime(2025, 1, 1)` → Excel date artifact for `/1` (one-of-one) → `print_run = 1`
- `None` → unlimited, `is_numbered = false`

**CSV Fallback Format** (manual imports)
```csv
card_number,player_name,team,rookie_card
1,Jackie Young,Las Vegas Aces,false
2,Haley Jones,Atlanta Dream,false
```

The import UI should accept both the Beckett `.xlsx` format (primary) and this simple CSV (fallback).

**Parallel Descriptor Fields** (feeds AI Stage 2 prompt)
- Name
- Color description (e.g., "Silver holographic border")
- Finish description (e.g., "Full refractor, rainbow light scatter")
- Print run
- Notes (any AI-helpful hints, e.g., "Distinguished from Blue by purple tint on back")

---

## 7. AI Card Identification Pipeline

### Overview

Two-stage Claude Vision pipeline called from a Supabase Edge Function.

```
User uploads image
      ↓
[Stage 1] Claude Vision — broad identification
  System: "You are a trading card expert..."
  Input: card image
  Output: { player, set, year, card_number, confidence, notes }
      ↓
[Stage 2] Claude Vision — parallel classification
  System: "You are classifying the parallel of a known card..."
  Input: card image + card identity + parallel list with descriptions
  Output: [{ parallel, confidence, reasoning }, ...] top 3
      ↓
App presents top 3 candidates to user for confirmation
      ↓
User confirms → card added to collection
```

### Stage 1 System Prompt Template

```
You are an expert WNBA trading card identifier. Analyze the provided card image and return ONLY valid JSON.

Identify:
- player_name: full name as printed
- set_name: full set name (e.g. "2024 Panini Prizm WNBA")
- year: card year as integer
- card_number: card number as string (e.g. "42" or "RC-7")
- serial_number: if visible on card, e.g. "47/99" — null if not present
- confidence: your confidence 0.0 to 1.0
- notes: any observations useful for parallel identification

Return ONLY JSON, no other text.
```

### Stage 2 System Prompt Template

```
You are classifying the parallel variant of a specific WNBA trading card.

Card identity: {player_name} #{card_number} from {set_name} ({year})

Known parallels for this set:
{parallel_list_with_descriptors}

Examine the card image carefully. Look at:
- Border color and treatment
- Foil or refractor finish
- Any visible serial number (format: XX/YYY)
- Background pattern or color shifts

Return ONLY valid JSON: an array of your top 3 parallel candidates, ordered by confidence:
[
  { "parallel_id": "...", "parallel_name": "...", "confidence": 0.0-1.0, "reasoning": "..." },
  ...
]
```

### Serial Number Logic

If Stage 1 detects a serial number (e.g., `/25`), filter the parallel candidate list in Stage 2 to only parallels with matching print run. This dramatically narrows the classification problem.

### Confirmation UI

- Display top 3 candidates as swipeable cards
- Show confidence as a visual indicator (labels: High / Medium / Low — not raw percentages)
- Show Stage 2 reasoning text for each candidate (collapsed by default, expandable)
- **Editable fields on the confirmation screen** — user can correct any field before confirming:
  - Player name
  - Set name
  - Card number
  - Parallel (dropdown from set's parallel list)
  - Serial number
  - Condition
  - Cost paid
  - Acquisition date
- "None of these" option → opens manual entry (same editable form, pre-cleared)
- Confirmed result → write to `collection` table, mark scan session confirmed

### Failure Handling

- Stage 1 confidence < 0.5 → show warning, allow manual override
- Stage 2 returns no candidates above 0.3 → surface "Unknown Parallel" option with ability to label manually
- Network/API failure → save image to storage, mark session as pending, retry queue

---

## 8. eBay Integration

### Credentials Required

- App ID (Client ID)
- Cert ID (Client Secret)
- Dev ID
- OAuth User Token (for Browse API)

Store in Supabase Vault / environment variables. Never expose in client.

### 8.1 On-Demand Current Listings

> **Note:** eBay Sold Comps API (findCompletedItems) is restricted/unavailable. All eBay pricing is based on **current active listings** only.

**Trigger:** User taps "Check eBay" on any card in collection or want list

**Flow:**
1. Call eBay Browse API `search` with constructed query
2. Filter to Buy It Now listings (exclude pure auctions to avoid noise from artificially low starting bids)
3. Return up to 10 current listings sorted by price ascending
4. Cache results in `ebay_comps` table with 24hr TTL
5. Display: current price, listing title, seller, link — in a bottom sheet modal

**What this is good for:** Quickly seeing what comparable cards are listed at right now, useful for pricing decisions before selling or checking if a want list card is available.

**Search Query Construction:**
```
"{player_name}" "{set_short_name}" WNBA card "{parallel_name}"
```
Strip low-signal words. If serial detected, append serial fragment.

### 8.2 Scheduled Want-List Alerts

**Trigger:** pg_cron job at user-configured frequency (default: daily)

**Alert Type Configuration (per want list item):**

| Alert Type | Behavior |
|-----------|---------|
| **New Listing** | Fire when a card matching criteria appears for the first time |
| **BIN Price Drop** | Fire when a previously seen listing's Buy It Now price decreases |
| **Both** | Fire on either condition |

> **Auction handling:** Alerts intentionally exclude pure auction listings. Auctions that start extra low are noise — alerts only fire on Buy It Now or Best Offer listings where the price is real and actionable. Users can still browse auctions manually from the eBay tab.

**Flow:**
1. pg_cron fires → triggers Edge Function
2. Fetch active want list items with `ebay_alert_active = true`
3. For each item, call eBay Browse API `search` for active BIN listings
4. Filter: `price <= max_price`
5. **New Listing check:** Cross-reference `ebay_alerts` table by listing ID — alert if not seen before
6. **Price Drop check:** Compare current price to `last_seen_price` in `ebay_alerts` — alert if lower
7. For qualifying matches: insert/update `ebay_alerts`, trigger Resend email
8. Update `last_seen_price` and `last_run_at` in `ebay_searches`

**Alert Email Contents (via Resend):**
- Subject: `🏀 New Listing: [Player] [Parallel] — $XX.XX` or `📉 Price Drop: [Player] [Parallel] — now $XX.XX`
- Card name, parallel, listing title
- Price vs. your max price
- Alert type (new listing vs. price drop)
- Direct eBay listing link
- "Pause alerts for this card" link

### 8.3 eBay Listing Copy Generator

**Trigger:** User taps "Generate eBay Listing" on a collection card

**Flow:**
1. Pull card data (player, set, year, parallel, condition, serial if applicable)
2. Pull current active listings for comparable cards (Browse API) for price reference
3. Call Claude API to generate:
   - Listing title (80 char eBay limit)
   - Item description (HTML-friendly)
   - Suggested price (based on current market listing range — lowest active BIN)
   - Suggested eBay category

**Title Formula:**
```
{Year} {Set} {Player} #{Card_Number} {Parallel} {/Serial if numbered} WNBA
```

**Output Display:** Copy-pasteable title + description, suggested price with current market context. User copies and posts to eBay manually (MVP).

---

## 9. UI/UX Requirements

### Design Principles

- **Mobile-first, always.** Design for phone at a card show, not a desktop. Every interaction must work with one thumb.
- **Fast lookups.** Search should be instant (client-side filter where possible, indexed Postgres search where not).
- **Beautiful, not bland.** This is a personal tool but deserves real design care. Think: dark mode option, card imagery front and center, bold typography.
- **Confidence over cleverness.** When AI identification is ambiguous, be honest. Never hide low-confidence results.

### Navigation (Mobile)

Bottom tab bar with 5 items:
1. **Collection** (home, grid/list of owned cards)
2. **Scan** (camera icon, primary action — always accessible)
3. **Want List** (pipeline view)
4. **Goals** (set completion tracker)
5. **eBay** (comps + listing generator + alert history)

### Scan Flow UX

1. Tap Scan tab
2. Camera opens (or photo picker — both options)
3. Capture / select image
4. Processing state: animated indicator, "Identifying card..."
5. Results screen: 3 candidate cards, swipeable
6. Confirm → success animation → "Added to collection"
7. Option to immediately add to Want List if it's a card you need more of (dupes for trade)

### Color & Visual Language

- Card parallels should have visual color coding throughout the app (silver badge for Silver Prizm, gold for Gold, etc.)
- Use card scan images wherever possible — the actual card photo > generic placeholder
- Dark mode default (cards pop more on dark backgrounds)

### Key Mobile UX Constraints

- All tap targets minimum 44×44pt
- No horizontal scroll on main views
- Bottom sheet modals (not full-screen navs) for eBay comps, card detail quick-view
- Skeleton loaders for async data — never blank screens

---

## 10. Authentication & Multi-User

### Auth Flow

- Google OAuth via Supabase Auth
- On first login: create `profiles` row, prompt for display name + eBay alert email
- Session persistence: stay logged in (mobile-friendly)

### Multi-User Architecture

- All user-owned data includes `user_id` FK to `auth.users`
- RLS policies enforce user isolation on all user-owned tables
- Reference data (sets, cards, parallels) is shared across users — any authenticated user can read, admin can write
- Admin role: first user, or managed via Supabase dashboard (no admin UI in MVP)
- Future: invite flow, shared collection views, trade matching

### Future Auth Considerations (Not MVP)

- Email/magic link as fallback
- User roles: admin (manage checklists), standard (collection only)
- Optional: public collection profile page

---

## 11. Build Phases

### Phase 1 — Foundation *(Build First)*

**Goal:** Working app shell, auth, schema, and manual collection CRUD

- [x] Supabase project setup
- [x] Run schema migrations (all tables + RLS policies)
- [x] Google OAuth configured
- [x] Next.js project scaffold on Vercel
- [x] Mobile-first shell: bottom nav, routing
- [x] Profiles: create on first login
- [x] Collection: manual add / edit / delete card
- [x] Collection: list + search view
- [x] Checklist management: add set, add parallels, add cards
- [x] CSV import for cards

**Done when:** You can manually add a card to your collection and see it in the list.

---

### Phase 2 — Scan Pipeline

**Goal:** Photograph a card → AI identifies it → confirm → collection

- [x] Supabase Storage bucket for card images
- [x] Image upload from camera/photo picker (front + back supported)
- [x] Stage 1 Edge Function (Claude Vision — card identity)
- [x] Stage 2 Edge Function (Claude Vision — parallel classification)
- [x] Serial number detection + candidate filtering logic
- [x] Scan confirmation UI (top 3 candidates, confidence, reasoning)
- [x] Confirm → write to collection
- [x] Auto-create set/card on confirm when not in checklist (flagged needs_review)
- [x] "None of these" → manual entry fallback
- [x] Scan session logging

**Done when:** You can scan a card, see AI candidates, confirm, and it appears in your collection.

**Status: ✅ Complete** — Committed April 17, 2026. Pending: apply migrations + deploy Edge Functions against Supabase project.

---

### Phase 2.5 — Checklist Management

**Goal:** Build reference data (sets, parallels, cards) so Stage 2 AI has training data for parallel classification. Populate with first set to enable full Phase 2 smoke testing.

**Why Phase 2.5 before Phase 3?** Without parallel reference data, Stage 2 classification has no candidates to match against. Phase 2.5 ensures the full scan pipeline (Stage 1 → Stage 2 → confirm) works end-to-end before building Want List + Goals.

- [ ] Admin/Checklist page layout: Tailwind scaffold with realistic structure (no placeholder text)
- [ ] Set management UI: create set (name, year, manufacturer), list sets
- [ ] Parallel management UI: add/edit parallels per set with visual descriptors (color, finish, print run, notes)
- [ ] Card management UI: add/edit cards individually per set
- [ ] CSV import for cards (simple format: `card_number,player_name,team,rookie_card`)
- [ ] Beckett Master Sheet import (.xlsx parsing for Prizm sets)
  - Parse `Card Set` field to extract insert name + parallel name
  - Parse `Sequence` field for print run detection
  - Upsert sets/parallels/cards in bulk
- [ ] Bulk load: 2024 Panini Prizm WNBA (first reference set for testing)
- [ ] Verify Stage 2 classification works with populated parallels

**Done when:** You can import a checklist (e.g., 2024 Panini Prizm WNBA), see parallels available in the DB, and full scan pipeline executes through Stage 2.

---

### Phase 3 — Want List & Goals

**Goal:** Full pipeline tracking and set-completion visibility

- [ ] Want list CRUD
- [ ] Status pipeline UI: Wanted / Ordered / Received
- [ ] Status tap-to-advance on mobile
- [ ] "Received" → prompt to add to collection
- [ ] Goal creation: pick set + parallel
- [ ] Goal detail: Have vs. Still Need lists
- [ ] One-tap "Add to Want List" from Still Need
- [ ] Dashboard: collection stats, open wants, goal progress

**Done when:** You have a full want list and can see set completion progress.

---

### Phase 4 — eBay Integration

**Goal:** Comps on demand, scheduled alerts, email delivery

- [ ] eBay API credentials in Supabase Vault
- [ ] On-demand comps: Finding API integration
- [ ] Comps cache (24hr TTL)
- [ ] Comps display: bottom sheet modal on card detail
- [ ] Resend account + API key configured
- [ ] Alert email template (React Email)
- [ ] Scheduled search Edge Function
- [ ] pg_cron job wired to Edge Function
- [ ] Alert deduplication logic
- [ ] Alert log view in eBay tab
- [ ] Per-item alert pause/resume toggle

**Done when:** You receive an email when a want-list card lists under your max price.

---

### Phase 5 — eBay Listing Helper

**Goal:** Generate ready-to-post listing copy from any collection card

- [ ] Listing generator UI on card detail
- [ ] Pull comps → suggest price (median of last 5)
- [ ] Claude API call: generate title + description
- [ ] 80-char title validation
- [ ] Copy-to-clipboard for title, description, price
- [ ] Listing history log (optional)

**Done when:** You can tap a card and get a ready-to-paste eBay listing in 10 seconds.

---

### Phase 6 — Polish & PWA

**Goal:** App feels native on mobile

- [ ] PWA config: manifest, service worker, add-to-home-screen
- [ ] Dark mode (default) + light mode toggle
- [ ] Parallel color coding system across all views
- [ ] Offline graceful degradation (show cached collection, queue scan for retry)
- [ ] Performance audit: Core Web Vitals on mobile
- [ ] Error states: empty states, failed scans, eBay API down
- [ ] Batch scan scoping + design (deferred build)

---

### Future / Backlog

- Batch binder-page scanning (multiple cards from one photo)
- eBay listing auto-submit (Browse API write operations)
- Grading integration (PSA/BGS lookup by cert number)
- Price history charting
- Trade matching (multi-user)
- Public collection profile
- Push notifications (vs. email alerts)
- Card value tracking over time

---

## 12. Open Questions & Decisions Log

| # | Question | Decision | Date |
|---|----------|----------|------|
| 1 | Batch vs. single card scan (MVP) | Single card MVP; batch deferred | April 2026 |
| 2 | Email provider | Resend (free tier, Edge Function native) | April 2026 |
| 3 | Auth method | Google OAuth via Supabase | April 2026 |
| 4 | Interface priority | Mobile-first (card show use case) | April 2026 |
| 5 | Collection greenfield vs. import | Greenfield; no legacy import needed | April 2026 |
| 6 | eBay listing submission | Generate copy only in MVP; no auto-submit | April 2026 |
| 7 | Which sets to checklist first | Prizm, Donruss, Select | April 2026 |
| 9 | eBay Sold Comps API | Unavailable/restricted — use current active BIN listings only | April 2026 |
| 10 | Goal scope | Goals support any subset: full insert sets, insert+parallel combos, player-filtered, or custom lists | April 2026 |
| 11 | eBay alert types | Configurable per want item: new listing, BIN price drop, or both. Pure auctions excluded from alerts. | April 2026 |
| 12 | Checklist import | Primary format: Beckett Master sheet (.xlsx). Card Set field parsed to extract insert + parallel. | April 2026 |
| 13 | Scan confirmation UX | Fields are editable on confirmation screen before committing to collection | April 2026 |
| 14 | Styling | Maintained in separate `styling-guidelines.md` — reference for all UI/UX decisions in Claude Code | April 2026 |
| 15 | Scan image transport | Images sent to Edge Functions as inline base64 in request body, not downloaded from Storage. Storage upload is fire-and-forget for permanent record only. Removes Storage as a dependency for the AI pipeline. | April 2026 |
| 16 | Edge Function HTTP status | All Edge Functions return HTTP 200. Errors are returned as `{ error: "..." }` in the JSON body. Supabase `functions.invoke` drops the response body on non-2xx status codes, making errors invisible. | April 2026 |
| 17 | Auto-create checklist entries | When a card confirmed from scan is not in the checklist, the confirm route creates the set + card automatically and flags them `needs_review = true`. This ensures no card is ever blocked from collection entry. | April 2026 |
| 18 | Front + back image capture | Both front and back images are supported throughout the pipeline. Stage 1 and Stage 2 prompts use back image when present for better card number, serial, and year detection. | April 2026 |
| 19 | Scan image size limit | Client enforces 750KB max before base64 conversion. Supabase Edge Function payload limit is ~1MB; base64 overhead (~33%) means 750KB raw → ~1MB encoded. No server-side resize in MVP. | April 2026 |
| 20 | Checklist management timing | Phase 2.5 (separate mini-phase) inserted between Phase 2 and Phase 3. Ensures Stage 2 parallel classification has reference data to match against before building Want List + Goals. | April 2026 |
| 20 | UI/UX scaffolding strategy (Phase 2.5+) | **Option C: Hybrid Smart Scaffold.** Each page/feature stub is built with realistic Tailwind structure (card layouts, grids, spacing) — no placeholder text. Component patterns from earlier phases are reused (e.g., Field, StatusBadge, MotionCard). `// TODO: implement X` comments mark incomplete sections. Maintains visual consistency without design overhead; enables fast iteration while preventing design debt. Reference `styling-guidelines.md` religiously. | April 2026 |

---

## Appendix A — Parallel Descriptor Library

*To be populated before Phase 2 build. This data feeds the Stage 2 AI prompt.*

### 2024 Panini Prizm WNBA

| Parallel | Color | Finish | Print Run | Notes |
|----------|-------|--------|-----------|-------|
| Base | White/silver border | Flat, non-refractor | Unlimited | No shimmer; matte finish |
| Silver Prizm | Silver | Full refractor, rainbow shimmer | Unlimited | Holographic; most common refractor |
| Gold Prizm | Gold | Refractor | /10 | Deep gold tone |
| Gold Vinyl | Black/gold | Foil | /1 | 1-of-1; logo stamp |
| Red Ice | Red with cracked ice pattern | Foil/textured | /99 | Cracked pattern distinguishes from solid Red |
| Blue Ice | Blue with cracked ice pattern | Foil/textured | /49 | |
| Neon Green Pulse | Neon green | Shimmer | /75 | Bright lime green |
| Tiger Stripe | Orange/black stripes | Foil | /25 | Distinctive striped pattern |
| Black | Black border | Foil | /1 | 1-of-1 |

*(Add additional sets here as checklists are built)*

---

## Appendix B — eBay Search Query Templates

```
# Standard card
"{player_name}" "{year} {set_short_name}" WNBA card "{parallel_name}"

# Numbered card
"{player_name}" "{year} {set_short_name}" WNBA "{parallel_name}" /{print_run}

# Base card (broad)
"{player_name}" "{year} Prizm WNBA" base card

# Serial-specific
"{player_name}" WNBA {year} "{serial_number}"
```

Strip: "Panini", common filler words that reduce result precision.

---

## Appendix C — Claude Code Kickoff Prompt

Use this prompt to start your Claude Code session for Phase 1:

```
I'm building a WNBA trading card collection tracker app. Here is my full PRD: [paste PRD]

Stack:
- Next.js (App Router) on Vercel
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Google OAuth via Supabase Auth
- TypeScript throughout
- Tailwind CSS, mobile-first

Start with Phase 1:
1. Generate Supabase migration SQL for the full schema in Section 5 (Data Model), including all RLS policies
2. Scaffold the Next.js project structure with App Router
3. Configure Supabase Auth with Google OAuth
4. Build the mobile-first shell: bottom navigation with 5 tabs (Collection, Scan, Want List, Goals, eBay)
5. Stub pages for each tab

Do the schema migration SQL first before any UI. Confirm the migration file before proceeding to Next.js setup.
```
