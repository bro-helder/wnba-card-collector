import Link from 'next/link';
import { SectionShell } from '@/components/SectionShell';

const navItems = [
  { href: '/collection', label: 'Collection' },
  { href: '/scan', label: 'Scan' },
  { href: '/want-list', label: 'Want List' },
  { href: '/goals', label: 'Goals' },
  { href: '/ebay', label: 'eBay' },
];

export default function HomePage() {
  return (
    <SectionShell
      title="Phase 1: Mobile-first WNBA collection shell"
      description="Start with a mobile-friendly Next.js foundation, Supabase auth, and the core route structure for your collection tracker."
      action={
        <Link href="/collection" className="inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300">
          Open Collection
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 transition hover:border-cyan-400/40 hover:bg-slate-800"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">{item.label}</p>
            <p className="mt-3 text-xl font-semibold text-white">View {item.label}</p>
            <p className="mt-2 text-sm text-slate-400">Mobile-first shell content for the {item.label.toLowerCase()} workflow.</p>
          </Link>
        ))}
      </div>
    </SectionShell>
  );
}
