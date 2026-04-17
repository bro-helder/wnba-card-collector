# WNBA Card Collector — Claude Code Project Guide

> This file is the coordination layer for all Claude Code sessions on this project.
> Read it fully before starting any task. Reference it when making routing or delegation decisions.

---

## Project Overview

A mobile-first WNBA trading card collection manager. Single primary user (Brook), multi-user architecture from day one. Core flows: scan-to-catalogue, duplicate prevention, want list tracking, eBay alerts and comps, listing copy generation.

**PRD:** `wnba-card-collector-prd.md` — source of truth for features, data model, and build phases.
**Styling:** `styling-guidelines.md` — source of truth for all UI/UX decisions. Always reference before writing UI code.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Backend | Supabase (Postgres + RLS, Auth, Storage, Edge Functions) |
| Auth | Google OAuth via Supabase Auth |
| Scheduled Jobs | pg_cron → Edge Functions |
| AI | Claude Vision API (claude-3-5-sonnet) |
| eBay | Browse API + Finding API (BIN listings; no sold comps API) |
| Email | Resend (React Email templates) |
| Hosting | Vercel |

**Also used in this repo (non-app contexts):**
- **SQL** — schema migrations, RLS policies, pg_cron jobs, ad hoc queries
- **Jupyter Notebooks** — data exploration, checklist import validation, AI pipeline prototyping
- **Arduino** — unrelated hardware side projects; treat as isolated, do not apply web app conventions

---

## Domain Ownership (Multi-Agent Routing)

When spawning parallel agents, assign work by domain. Agents must not edit files outside their domain without explicit instruction.

| Domain | Owns | Agent Focus |
|--------|------|-------------|
| **frontend** | `app/` (UI components, pages, hooks, client state) | React, Tailwind, mobile UX, App Router patterns |
| **backend** | `app/api/`, `supabase/functions/` (Edge Functions) | API routes, business logic, Supabase client, Edge Function authoring |
| **database** | `supabase/migrations/`, RLS policies, pg_cron | Schema design, migration SQL, RLS, indexes, query performance |
| **ai-pipeline** | Claude Vision calls, scan logic, prompt templates | Stage 1 (identity) and Stage 2 (parallel) pipeline, confidence scoring |
| **ebay** | eBay API integration, alert logic, comps caching | Browse API, Finding API, search query construction, 24hr TTL cache |
| **email** | Resend integration, React Email templates | Alert templates, trigger logic, deduplication |

### When to Parallelize vs. Sequence

**Parallelize when:**
- Work spans independent domains (e.g., frontend component + database migration + Edge Function for same feature)
- Running review or audit tasks (security review, code review, test suite) alongside implementation
- Researching multiple approaches or libraries simultaneously

**Keep sequential when:**
- Database migration must land before backend code that depends on it
- API contract must be defined before frontend consumes it
- Any task where one output is the input to the next

**Background agents for:**
- Security audits
- Test suite runs
- eBay API response research / documentation lookups
- Codebase exploration when the result isn't immediately needed

---

## Code Standards

### TypeScript
- Strict mode on. No `any` unless explicitly justified with a comment.
- Define types for all API responses, DB row types, and props. Co-locate types with the file that owns them.
- Use Supabase-generated types from `database.types.ts` — regenerate when schema changes.

### Next.js / React
- App Router throughout. No Pages Router.
- Prefer Server Components; drop to Client Components only when interactivity or browser APIs require it.
- `use client` at the leaf, not the top of the tree.
- Data fetching in Server Components or Route Handlers — not in `useEffect`.

### Supabase
- RLS is always on. Every table has policies. Never disable RLS to make something work.
- Use Supabase Vault for secrets (eBay API keys, etc.) — never in environment variables or code.
- Edge Functions are Deno/TypeScript. Do not use Node APIs.
- pg_cron jobs are defined in migration files, not applied manually.

### Tailwind / Styling
- Mobile-first always (`base` = mobile, `md:` / `lg:` = desktop).
- All design decisions live in `styling-guidelines.md`. Check it before introducing new colors, spacing, or component patterns.
- Dark mode is default. Light mode is a toggle.

### SQL
- Migrations go in `supabase/migrations/` with sequential timestamps.
- Never write destructive migrations (DROP, TRUNCATE) without a comment explaining why and a rollback plan.
- Include `explain analyze` in PR comments for any new query on a large table.

### Testing
- Unit tests for pure logic (AI confidence scoring, eBay query construction, deduplication).
- Integration tests for Edge Functions before shipping.
- End-to-end tests via Playwright for critical flows: scan → confirm → collection; want list alert trigger.
- Test files co-located: `foo.test.ts` next to `foo.ts`.

---

## Key Architectural Decisions (Hardcoded — Do Not Re-litigate)

| Decision | Choice | Do Not Change Unless Brook Says So |
|----------|--------|-------------------------------------|
| Scan flow | One card at a time | Batch deferred to post-MVP |
| eBay comps | Active BIN listings only | Sold comps API unavailable/restricted |
| Auth | Google OAuth via Supabase | No other auth method in MVP |
| Listing submission | Generate copy only | No auto-submit to eBay in MVP |
| Checklist import | Beckett Master sheet (.xlsx) | Primary import format |
| Scan confirmation | Fields editable before commit | AI result is always a suggestion, not a write |

---

## AI Pipeline Rules (Phase 2)

The scan pipeline is two-stage and sequential — do not collapse into one call.

1. **Stage 1 — Card Identity:** Player, set, year, card number. Returns top 3 candidates with confidence and reasoning.
2. **Stage 2 — Parallel Classification:** Runs only after user selects a Stage 1 candidate. Uses parallel descriptor library from PRD Appendix A.

- Serial number detection happens in Stage 1 and is used to filter Stage 2 candidates.
- The confirmation screen is always shown — never auto-commit.
- All field values are editable on the confirmation screen before writing to the database.
- Log every scan session to `scan_logs` table regardless of outcome.

---

## eBay Integration Rules

- Search query construction follows templates in PRD Appendix B exactly.
- Strip "Panini" and common filler words from queries (reduces noise).
- Alerts fire only on BIN listings. Pure auctions excluded.
- Alert deduplication: do not re-alert on a listing already sent. Check `alert_log` before sending.
- Comps cache TTL: 24 hours. Always serve from cache if valid; only call eBay API on miss.
- Per-want alert type is configurable: new listing, BIN price drop, or both.

---

## Pre-Commit Checklist (Run Before Every Check-in)

```
/code-review
```

This spawns parallel agents checking for:
- Bugs and logic errors
- Security vulnerabilities (especially RLS gaps and API key exposure)
- Regressions against existing functionality
- TypeScript errors and type safety issues

**Fix all findings before committing.** If you disagree with a finding, add an inline comment explaining why — don't just suppress it.

Also confirm before committing:
- [ ] No secrets or API keys in code or environment files
- [ ] RLS policies added for any new table
- [ ] Migration file created for any schema change
- [ ] `database.types.ts` regenerated if schema changed
- [ ] `styling-guidelines.md` consulted for any new UI

---

## Jupyter Notebooks

Used for: checklist import validation, AI pipeline prototyping, data exploration.

- Notebooks live in `/notebooks/`
- Keep exploratory notebooks separate from production-bound logic
- When a notebook produces logic worth shipping, extract it to TypeScript — do not ship notebook code to production
- Document data sources and assumptions at the top of each notebook

---

## Arduino

Hardware side projects are isolated from this codebase. If Arduino files appear in this repo:
- Do not apply web app linting, TypeScript, or Tailwind rules
- Do not include in `/code-review` scope
- Treat as a separate project with no shared conventions

---

## Build Phase Reference

| Phase | Goal | Status |
|-------|------|--------|
| 1 | Manual collection management (schema + UI shell) | 🔲 Not started |
| 2 | Scan pipeline (Claude Vision → confirm → collection) | 🔲 Not started |
| 3 | Want list + set-completion goals | 🔲 Not started |
| 4 | eBay alerts + comps | 🔲 Not started |
| 5 | eBay listing helper | 🔲 Not started |
| 6 | PWA + polish | 🔲 Not started |

**Always confirm the current phase before starting new feature work.** Do not build Phase 2+ features while Phase 1 is incomplete.

---

## Session Startup Protocol

At the start of every Claude Code session:

1. Read this file
2. Read `styling-guidelines.md` if doing any UI work
3. Check current phase — confirm with Brook if unclear
4. For multi-agent work: identify domain ownership before spawning agents
5. State your plan before writing code on any task over ~30 min of estimated work
