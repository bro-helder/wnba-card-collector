# WNBA Card Collector

Phase 1 foundation for a WNBA trading card collection tracker.

## What is included

- Supabase migration SQL for Phase 1 schema (in dedicated `wnba_cards` schema)
- Next.js App Router scaffold with mobile-first shell
- Bottom navigation and route placeholders for Collection, Scan, Want List, Goals, and eBay
- Supabase Google OAuth sign-in entrypoint
- Tailwind CSS setup and global styling
- Auth guards on all protected routes
- Database integrity constraints and RLS policy fixes

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Run the development server:

```bash
npm run dev
```

4. Apply the Supabase migration SQL in `supabase/migrations/00000000000000_init.sql` to your Supabase project. This creates all tables in a dedicated `wnba_cards` schema to avoid conflicts with other projects.

## Notes

- The Supabase schema includes RLS policies for user-owned tables and readable shared reference data.
- The login page triggers Google OAuth using Supabase Auth.
- The current UI is a scaffold for Phase 1 and includes placeholder screens for core flows.
- All protected routes now require authentication and redirect to login if not signed in.
- Database includes integrity constraints to prevent invalid data states.
