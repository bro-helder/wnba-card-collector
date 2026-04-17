'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Collection', icon: '🏀' },
  { href: '/scan', label: 'Scan', icon: '📸' },
  { href: '/want-list', label: 'Want List', icon: '⭐' },
  { href: '/goals', label: 'Goals', icon: '🎯' },
  { href: '/ebay', label: 'eBay', icon: '💰' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl justify-between px-4 py-3">
        {tabs.map((tab) => {
          const active = pathname === tab.href ||
            (tab.href === '/' ? pathname === '/' : pathname?.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-w-[0] flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center text-[0.78rem] font-medium transition ${
                active ? 'text-cyan-300' : 'text-slate-500 hover:text-slate-100'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
