# WNBA Card Collector — Styling Guidelines

**Version:** 0.2
**Owner:** Brook
**Last Updated:** April 2026
**Companion:** `wnba-card-collector-prd.md`

> This document is the single source of truth for visual design decisions. Reference it in every Claude Code session that touches UI. Update it whenever a design decision is made or changed.

---

## 1. Design Principles

1. **Cards are the hero.** Card scan images should be prominent. The UI frames and surfaces the cards — it doesn't compete with them.
2. **Mobile-first, always.** Designed for one-thumb use at a card show. Every interaction works at arm's length on a phone screen.
3. **Fast and confident.** Skeleton loaders, not spinners. No blank screens. No ambiguous states.
4. **WNBA energy.** The aesthetic draws from official WNBA branding — dark, bold, orange-forward. Feels like the league, not a generic sports app.
5. **Honest UI.** Low AI confidence gets flagged. Cached eBay data shows its age. Don't hide uncertainty.

---

## 2. Brand Inspiration

The visual direction is grounded in official WNBA branding as seen on WNBA.com and WNBA All-Star event sites:

- **Near-black backgrounds** (not pure black — slightly warm dark)
- **WNBA Orange** as the dominant accent — CTAs, active states, highlights
- **Teal** as secondary accent — positive/winning states
- **Bold, condensed, uppercase** display type for headings
- **High contrast** white body text on dark surfaces

The WNBA standings streak badge color system maps directly onto collection UI:

| Standings Meaning | Badge | App Equivalent |
|------------------|-------|---------------|
| Hot streak (W10) | Teal | Owned, confirmed, goal complete |
| Mid (.500, 5-5) | Yellow | Ordered, in progress, medium confidence |
| Cold streak (L10) | Red | Missing, failed scan, low confidence |

---

## 3. Color System

### Base Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#0A0A0B` | App background |
| `--color-surface` | `#161618` | Card surfaces, panels |
| `--color-surface-raised` | `#1F1F23` | Elevated surfaces, modals, bottom sheets |
| `--color-border` | `#2A2A2F` | Subtle borders, dividers |
| `--color-border-accent` | `#3D3D45` | Stronger borders, focus rings |
| `--color-text-primary` | `#F5F5F7` | Primary text |
| `--color-text-secondary` | `#8E8E9A` | Secondary/muted text |
| `--color-text-disabled` | `#45454E` | Disabled states |

### Accent Palette (WNBA-Derived)

| Token | Hex | Source |
|-------|-----|--------|
| `--color-orange` | `#FF4713` | WNBA primary orange — CTAs, active tab, highlights |
| `--color-orange-muted` | `#3D1A0A` | Orange background tints |
| `--color-orange-hover` | `#E63D0F` | Orange hover state |
| `--color-teal` | `#00C9A7` | Secondary accent — confirmed, owned, winning |
| `--color-teal-muted` | `#003D33` | Teal background tints |

### Status / Feedback (Standings-Derived)

| Token | Hex | Maps To |
|-------|-----|---------|
| `--color-success` | `#00C9A7` | Owned, confirmed, received, goal complete |
| `--color-success-bg` | `#003D33` | Success backgrounds |
| `--color-warning` | `#F5A623` | Ordered, medium confidence, in progress |
| `--color-warning-bg` | `#3D2800` | Warning backgrounds |
| `--color-error` | `#E8373A` | Error, failed scan, low confidence |
| `--color-error-bg` | `#3D0A0B` | Error backgrounds |

### Tailwind Config Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0B',
        surface: '#161618',
        'surface-raised': '#1F1F23',
        border: '#2A2A2F',
        'text-primary': '#F5F5F7',
        'text-secondary': '#8E8E9A',
        orange: { DEFAULT: '#FF4713', muted: '#3D1A0A', hover: '#E63D0F' },
        teal:   { DEFAULT: '#00C9A7', muted: '#003D33' },
      }
    }
  }
}
```

---

## 4. Typography

### Font Families

| Role | Font | Fallback | Notes |
|------|------|---------|-------|
| Display / Headings | **Barlow Condensed** | Impact, sans-serif | Bold condensed all-caps — matches WNBA heading energy |
| Body / UI | **Inter** | system-ui, sans-serif | Clean, highly legible at small sizes on mobile |

Both free on Google Fonts. Load via `next/font/google`:

```typescript
// app/fonts.ts
import { Barlow_Condensed, Inter } from 'next/font/google'

export const barlowCondensed = Barlow_Condensed({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-display',
})

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})
```

### Type Scale

| Role | Family | Weight | Size (mobile) | Transform |
|------|--------|--------|--------------|-----------|
| Page title | Barlow Condensed | 800 | 32px | UPPERCASE |
| Section heading | Barlow Condensed | 700 | 22px | UPPERCASE |
| Card player name | Barlow Condensed | 600 | 18px | Title Case |
| Body | Inter | 400 | 14px | — |
| UI label | Inter | 500 | 13px | — |
| Caption / meta | Inter | 400 | 12px | — |
| Badge label | Inter | 600 | 11px | UPPERCASE |

---

## 5. Parallel Badge Color System

Parallel badges appear throughout the app — collection list, scan confirmation, want list, goals. Consistent color coding is how collectors read card value at a glance.

### Badge Anatomy
- Shape: pill, `border-radius: 9999px`
- Background: parallel color @ 15% opacity
- Border: parallel color @ 60% opacity, 1px solid
- Text: parallel color @ 100%, Inter 600, 11px, UPPERCASE
- Premium (/10 or rarer, 1/1): CSS shimmer or glow animation

### Parallel Color Reference

| Parallel | Hex | Animated |
|----------|-----|---------|
| Base | `#A8A8B3` | No |
| Silver | `#D4D4E0` | No |
| Gold | `#FFD700` | No |
| Gold Vinyl | `#C9A84C` | Yes — shimmer |
| Blue | `#4A9EE8` | No |
| Blue Pulsar | `#2C65D4` | No |
| Green | `#2ECC71` | No |
| Green Pulsar | `#1A9A52` | No |
| Red | `#E74C3C` | No |
| Red Pulsar | `#C0392B` | No |
| Orange | `#E67E22` | No |
| Orange Pulsar | `#CA6F1E` | No |
| Purple | `#9B59B6` | No |
| Teal | `#1ABC9C` | No |
| White Ice | `#E8EAF6` | No |
| White Sparkle | `#F0F0FF` | No |
| Ice | `#B3D9F5` | No |
| Gold Ice | `#F0C040` | Yes — shimmer |
| Checkerboard | `#888888` | No |
| Snake Skin | `#8A9A5B` | No |
| Cherry Blossom | `#FFB7C5` | No |
| Lotus Flower | `#C9A0DC` | No |
| Black Finite | `#1A1A1A` (gold border) | Yes — glow |
| Black Velocity | `#1A1A1A` (silver border) | No |
| Mojo | Gradient (blue→purple→red) | Yes — shift |
| Pulsar | `#8A2BE2`→`#00C9A7` gradient | No |
| **1-of-1 / Unique** | Rainbow gradient | Yes — rotate |

### Key CSS

```css
/* Mojo gradient */
background: linear-gradient(135deg, #2C65D4, #9B59B6, #E74C3C);

/* 1-of-1 animated border */
@keyframes rainbow-border {
  0%   { border-color: #FF4713; }
  25%  { border-color: #FFD700; }
  50%  { border-color: #00C9A7; }
  75%  { border-color: #9B59B6; }
  100% { border-color: #FF4713; }
}
animation: rainbow-border 2s linear infinite;

/* Gold Vinyl shimmer */
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
```

---

## 6. Team Logos & Player Images

> **Personal use only — do not use in any commercial or public-facing context.**

### Team Logos

WNBA team logos are available via the official WNBA CDN as SVGs:

```
https://cdn.wnba.com/logos/wnba/{team_id}/primary/L/logo.svg
```

**Team ID Reference:**

| Team | ID |
|------|----|
| Atlanta Dream | 1611661313 |
| Chicago Sky | 1611661319 |
| Connecticut Sun | 1611661320 |
| Dallas Wings | 1611661325 |
| Golden State Valkyries | 1611661329 |
| Indiana Fever | 1611661323 |
| Las Vegas Aces | 1611661317 |
| Los Angeles Sparks | 1611661316 |
| Minnesota Lynx | 1611661322 |
| New York Liberty | 1611661318 |
| Phoenix Mercury | 1611661321 |
| Seattle Storm | 1611661324 |
| Washington Mystics | 1611661314 |

**Implementation:**
- Cache SVGs in `/public/logos/wnba/` at build time — don't runtime-fetch from CDN
- Display sizes: 16px (inline/tag), 24px (list item), 32px (filter chips), 48px (team header)
- Apply `drop-shadow(0 1px 4px rgba(0,0,0,0.8))` for visibility on dark backgrounds
- Store team → ID mapping in a constants file for reuse across the app

### Player Headshots

```
https://cdn.wnba.com/headshots/wnba/latest/260x190/{player_id}.png
```

Player IDs via WNBA Stats API:
```
https://stats.wnba.com/stats/commonallplayers?LeagueID=10&Season=2024-25&IsOnlyCurrentSeason=1
```

**Implementation:**
- Fetch once, cache in Supabase Storage under `player-headshots/{player_id}.png`
- Seed on first use per player — don't pre-fetch all 300+
- Crop to face: `object-fit: cover; object-position: top center`
- Fallback: player initials in a colored circle, color derived from team primary

**Display contexts:**
- Card detail view: blurred headshot as hero background, or corner inset
- Collection grid: optional corner badge (16px circle)
- Scan confirmation: small inset on candidate card

---

## 7. Spacing & Layout

### Grid
- Mobile: 16px horizontal padding
- Desktop: 24px horizontal padding
- Max content width: 1280px, centered

### Spacing Scale (8px base)
| Tailwind Class | Value |
|---------------|-------|
| `p-1` | 4px |
| `p-2` | 8px |
| `p-3` | 12px |
| `p-4` | 16px |
| `p-6` | 24px |
| `p-8` | 32px |
| `p-12` | 48px |

### Tap Targets
- Minimum: 44×44px on all interactive elements
- Preferred: 48px height for list items and buttons

---

## 8. Component Patterns

### Bottom Navigation (Mobile)

```
[ Collection ] [ Scan ◉ ] [ Want List ] [ Goals ] [ eBay ]
```

- Fixed bottom, respects `env(safe-area-inset-bottom)`
- Active: `--color-orange` icon + label
- Inactive: `--color-text-secondary`, icon only (no label)
- Scan: orange background pill treatment — always the visual anchor

### Primary Button
```css
background: #FF4713;
color: white;
font: 600 14px/1 Inter, sans-serif;
border-radius: 8px;
height: 48px;
padding: 0 24px;
letter-spacing: 0.02em;
```
Hover: `#E63D0F`. Disabled: opacity 40%, cursor not-allowed.

### Card Thumbnail
- Aspect ratio: `aspect-[5/7]` (2.5:3.5)
- `border-radius: 8px`
- Shadow: `0 4px 16px rgba(0,0,0,0.6)`
- Parallel badge: bottom-left corner overlay
- Team logo: top-right corner, 16px
- Never stretch or crop the card — use `object-fit: contain` with dark fill

### Collection List Item
```
┌──────────────────────────────────────────┐
│ [Card  ] Player Name (Barlow 600 18px)   │
│ [Thumb ] 2024 Prizm · #42               │
│ [ 48px ] [Team Logo] Las Vegas Aces      │
│          [Silver Prizm badge] [/99]      │
└──────────────────────────────────────────┘
```

### Collection Grid Item (2-col mobile)
- Card image fills the cell
- Bottom gradient overlay: `linear-gradient(transparent, rgba(0,0,0,0.85))`
- Player name + parallel badge overlaid on gradient
- Tap → card detail bottom sheet

### Scan Confirmation Card
```
┌────────────────────────────────────┐
│  [Card Image — large, ~60% height] │
│                                    │
│  ● HIGH CONFIDENCE    (teal badge) │
│  Player Name (Barlow 700, 20px)    │
│  2024 Panini Prizm WNBA            │
│  #42 · [Silver Prizm badge]        │
│                                    │
│  ┌──── Editable Fields ──────────┐ │
│  │ Parallel   [Silver Prizm  ▼]  │ │
│  │ Serial     [/99_________]     │ │
│  │ Condition  [Near Mint     ▼]  │ │
│  │ Cost paid  [$_____________]   │ │
│  │ Date       [04/17/2026    ]   │ │
│  └───────────────────────────────┘ │
│                                    │
│  [▶ View AI Reasoning]             │
│                                    │
│  [     CONFIRM     ] [Not This ▸]  │
└────────────────────────────────────┘
```

### Bottom Sheet Modal
- Slide up from bottom
- Max height: 85vh, scrollable content inside
- Background: `--color-surface-raised`
- Drag handle: 36×4px centered pill in `--color-border`
- Dismiss: swipe down, or tap dark scrim
- Animation: `250ms cubic-bezier(0.32, 0.72, 0, 1)`

### Confidence Indicator

| Score | Label | Color Token |
|-------|-------|------------|
| ≥ 0.80 | HIGH | `--color-success` (teal) |
| 0.50–0.79 | MEDIUM | `--color-warning` (yellow) |
| < 0.50 | LOW | `--color-error` (red) |

### Goal Progress Badge

Borrowed from standings streak badges:

| Progress | Badge Style | Example |
|----------|------------|---------|
| 100% complete | Solid teal | ✓ COMPLETE |
| > 60% | Orange | 18/30 |
| 30–60% | Yellow | 9/30 |
| < 30% | Red | 2/30 |

### Want List Status Badges

| Status | Color | Icon |
|--------|-------|------|
| Wanted | Orange `#FF4713` | ★ |
| Ordered | Yellow `#F5A623` | 📦 |
| Received | Teal `#00C9A7` | ✓ |

---

## 9. Motion & Animation

- **Default transition:** `150ms ease-out` on color/opacity
- **Layout transitions:** `200ms ease-out`
- **Bottom sheet open:** `250ms cubic-bezier(0.32, 0.72, 0, 1)` slide-up
- **Scan processing:** pulsing orange border ring on card preview
- **Confirm success:** teal flash + scale pulse (1.0 → 1.03 → 1.0, 300ms)
- **Premium parallel badge shimmer:** 2s looping, only on Gold Vinyl / Mojo / 1-of-1
- Never animate purely for decoration

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Iconography

- **Library:** `@phosphor-icons/react`
- **Sizes:** 16px inline · 20px standard · 24px navigation
- **Style:** Regular weight by default, Bold for primary actions
- **Color:** Inherit from context — no hardcoded icon colors in components

---

## 11. Image Handling

- Card images: `aspect-[5/7]`, `object-fit: contain`, dark fill — never crop or stretch
- Player headshots: `object-fit: cover`, `object-position: top center` to favor face
- All images via `next/image` with appropriate `sizes` prop
- Skeleton loaders: shimmer animation matching the element shape (card, circle, rectangle)
- Team logos: SVG, `drop-shadow` for dark background visibility

---

## 12. Dark Mode

- **MVP: dark mode only**
- All colors via CSS custom properties — no hardcoded hex in components
- Minimum surface color: `--color-surface` — no `#fff` or near-white backgrounds
- Tailwind: `darkMode: 'class'`
- Light mode toggle planned for Phase 6

---

## 13. Open Design Decisions

| # | Decision | Status | Notes |
|---|----------|--------|-------|
| 1 | Collection: grid vs. list default view | ❌ Undecided | Offer toggle; grid is card-forward, list is info-dense |
| 2 | Scan: native camera picker vs. in-app camera | ❌ Undecided | Native is simpler to ship; in-app feels more polished |
| 3 | App name / wordmark | ❌ Undecided | |
| 4 | Light mode palette | ⏸ Phase 6 | |
| 5 | Player headshot placement on card detail | ❌ Undecided | Blurred BG, corner inset, or header strip |
| 6 | Team color accents per card detail | ❌ Undecided | Tint card detail header with team primary color? |
| 7 | Team logo fallback for new/expansion teams | ❌ Undecided | Golden State Valkyries CDN ID needs verification |
