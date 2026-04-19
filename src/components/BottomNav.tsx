'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/collection', label: 'Collection', icon: 'cards' },
  { href: '/want-list',  label: 'Want List',  icon: 'star' },
  { href: '/scan',       label: 'Scan',        icon: 'scan' },
  { href: '/goals',      label: 'Goals',       icon: 'target' },
];

function NavIcon({ id, color, size = 22 }: { id: string; color: string; size?: number }) {
  const s = { width: size, height: size, fill: 'none' as const, stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (id) {
    case 'cards':
      return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="5" width="14" height="16" rx="2"/><path d="M7 5V3h14v16h-2"/></svg>;
    case 'star':
      return <svg viewBox="0 0 24 24" {...s}><path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9z"/></svg>;
    case 'scan':
      return <svg viewBox="0 0 24 24" {...s} strokeWidth={2}><path d="M4 8V5a1 1 0 011-1h3M20 8V5a1 1 0 00-1-1h-3M4 16v3a1 1 0 001 1h3M20 16v3a1 1 0 01-1 1h-3"/><circle cx="12" cy="12" r="3.5"/></svg>;
    case 'target':
      return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill={color} stroke="none"/></svg>;
    default:
      return null;
  }
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 82,
      background: 'rgba(10,10,11,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid #1F1F23',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-around',
      paddingTop: 10,
      paddingBottom: 24,
      zIndex: 40,
    }}>
      {tabs.map(tab => {
        const active = pathname === tab.href || pathname?.startsWith(tab.href + '/');
        const isScan = tab.href === '/scan';

        if (isScan) {
          return (
            <Link key={tab.href} href={tab.href} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2,
              textDecoration: 'none',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 9999,
                background: '#FF4713',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(255,71,19,0.45), 0 0 0 4px rgba(255,71,19,0.15)',
                marginTop: -14,
              }}>
                <NavIcon id={tab.icon} color="#fff" size={26} />
              </div>
            </Link>
          );
        }

        return (
          <Link key={tab.href} href={tab.href} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3,
            textDecoration: 'none',
            padding: '4px 8px',
            minWidth: 48,
          }}>
            <NavIcon id={tab.icon} color={active ? '#FF4713' : '#8E8E9A'} size={22} />
            {active && (
              <div style={{
                fontFamily: 'var(--font-body), Inter, sans-serif',
                fontSize: 10, fontWeight: 600,
                color: '#FF4713', letterSpacing: 0.3,
              }}>{tab.label}</div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
