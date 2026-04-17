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

1. **Create GitHub Repository:**
   ```bash
   # Option 1: Using GitHub CLI (if installed)
   gh repo create wnba-card-collector --public --source=. --remote=origin --push

   # Option 2: Manual creation
   # 1. Go to https://github.com/new
   # 2. Repository name: wnba-card-collector
   # 3. Make it public
   # 4. Don't initialize with README
   # 5. Run: git remote add origin https://github.com/YOUR_USERNAME/wnba-card-collector.git
   # 6. Run: git push -u origin main
   ```

2. **Setup Environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Setup Supabase:**
   - Create a new Supabase project
   - Run the migration: `supabase/migrations/00000000000000_init.sql`
   - Configure Google OAuth in Supabase Auth settings

5. **Start Development:**
   ```bash
   npm run dev
   ```

## Notes

- The Supabase schema includes RLS policies for user-owned tables and readable shared reference data.
- The login page triggers Google OAuth using Supabase Auth.
- The current UI is a scaffold for Phase 1 and includes placeholder screens for core flows.
- All protected routes now require authentication and redirect to login if not signed in.
- Database includes integrity constraints to prevent invalid data states.
