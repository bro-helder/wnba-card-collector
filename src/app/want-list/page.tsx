'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { CardArt, type CardData } from '@/components/CardArt';
import { ParallelBadge } from '@/components/ParallelBadge';
import { TEAMS, type ParallelKey } from '@/lib/cardData';

// ── Mock want list data (backend not yet built) ────────────────────────────────

interface WantItem extends CardData {
  id: string;
  target: number;
  market: number;
  priority: 'high' | 'med' | 'low';
  alert: boolean;
  note: string;
}

const WANTS: WantItem[] = [
  { id: 'w1', player: 'Paige Bueckers', team: 'Dallas Wings',       set: '2025 Prizm', num: 1,  parallel: 'silver',    rookie: true,  serial: null,      target: 80,   market: 74,   priority: 'high', alert: true,  note: "Rookie year — get before she drops 30" },
  { id: 'w2', player: 'Caitlin Clark',  team: 'Indiana Fever',      set: '2024 Prizm', num: 1,  parallel: 'gold',      rookie: true,  serial: '4/10',    target: 3200, market: 3450, priority: 'high', alert: false, note: 'Holy grail for the CC rainbow run' },
  { id: 'w3', player: 'Angel Reese',    team: 'Chicago Sky',        set: '2024 Prizm', num: 2,  parallel: 'pulsar',    rookie: true,  serial: '18/49',   target: 180,  market: 165,  priority: 'med',  alert: true,  note: 'Rainbow chase — need pulsar' },
  { id: 'w4', player: 'Cameron Brink',  team: 'Los Angeles Sparks', set: '2024 Prizm', num: 3,  parallel: 'neonPulse', rookie: true,  serial: '31/75',   target: 150,  market: 210,  priority: 'med',  alert: false, note: 'Waiting for price to cool' },
  { id: 'w5', player: "A'ja Wilson",    team: 'Las Vegas Aces',     set: '2024 Prizm', num: 4,  parallel: 'redIce',    rookie: false, serial: '62/99',   target: 220,  market: 240,  priority: 'low',  alert: false, note: '' },
  { id: 'w6', player: 'Sabrina Ionescu',team: 'New York Liberty',   set: '2024 Prizm', num: 6,  parallel: 'pulsar',    rookie: false, serial: '11/49',   target: 200,  market: 195,  priority: 'low',  alert: true,  note: '' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function FilterChip({ label, count, active, onClick }: { label: string; count?: number; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 12px', borderRadius: 9999,
      background: active ? '#FF4713' : '#1F1F23',
      color: active ? '#fff' : '#8E8E9A',
      border: active ? '1px solid #FF4713' : '1px solid #2A2A2F',
      fontFamily: 'var(--font-body), Inter, sans-serif', fontSize: 12, fontWeight: 600,
      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {label}
      {count !== undefined && <span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>}
    </button>
  );
}

function PriorityDot({ level }: { level: 'high' | 'med' | 'low' }) {
  const colors = { high: '#E74C3C', med: '#F2C94C', low: '#9B9BA8' };
  return <div style={{ width: 6, height: 6, borderRadius: 9999, background: colors[level], marginRight: 2 }} />;
}

function RCTag() {
  return (
    <span style={{
      fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
      fontWeight: 800, fontSize: 9,
      color: '#FFD700', border: '1px solid #FFD700',
      padding: '1px 4px', borderRadius: 2, letterSpacing: 1.5,
    }}>RC</span>
  );
}

function WantRow({ want }: { want: WantItem }) {
  const team = TEAMS[want.team] ?? { p: '#333', s: '#000', short: '???' };
  const progress = Math.min(100, Math.max(0, 100 - ((want.market - want.target) / want.target * 100)));
  const inRange = want.market <= want.target;
  const delta = want.market - want.target;
  const deltaPct = Math.round((delta / want.target) * 100);
  const accent = '#FF4713';

  return (
    <div style={{
      background: '#111115',
      border: `1px solid ${inRange ? 'rgba(255,71,19,0.45)' : '#1f1f26'}`,
      borderRadius: 12, padding: 14,
      display: 'flex', gap: 14,
      position: 'relative',
      boxShadow: inRange ? '0 0 0 1px rgba(255,71,19,0.15) inset, 0 4px 20px rgba(255,71,19,0.1)' : 'none',
    }}>
      <div style={{ width: 72, flexShrink: 0, opacity: 0.92 }}>
        <CardArt card={want} size="sm" scanned={true} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
          <PriorityDot level={want.priority} />
          <ParallelBadge parallelKey={want.parallel as ParallelKey} size="sm" />
          {want.rookie && <RCTag />}
        </div>
        <div style={{
          fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: 16, letterSpacing: 0.1, lineHeight: 1.1,
          color: '#E8E8EF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{want.player}</div>
        <div style={{ fontSize: 11, color: '#6b6b78', marginTop: 2 }}>
          {team.short} · #{want.num}{want.serial ? ` · /${want.serial.split('/')[1]}` : ''}
        </div>

        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 5, borderRadius: 9999, background: '#1f1f26', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: Math.min(100, Math.max(12, progress)) + '%',
              background: inRange ? accent : '#3D7CFF', borderRadius: 9999,
              transition: 'width .4s',
              boxShadow: inRange ? `0 0 12px ${accent}88` : 'none',
            }} />
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: inRange ? accent : '#9B9BA8', fontWeight: 600, whiteSpace: 'nowrap',
          }}>${want.market} / ${want.target}</div>
        </div>

        <div style={{ marginTop: 6, fontSize: 11, color: inRange ? accent : '#6b6b78', fontWeight: inRange ? 600 : 400 }}>
          {inRange
            ? `✦ ${Math.abs(deltaPct)}% under your target`
            : `${deltaPct > 0 ? '+' : ''}${deltaPct}% over target`}
        </div>

        {want.note && (
          <div style={{ marginTop: 8, fontSize: 11, color: '#9B9BA8', fontStyle: 'italic', lineHeight: 1.35 }}>
            "{want.note}"
          </div>
        )}
      </div>

      {inRange && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <button style={{
            background: accent, color: '#fff', border: 'none',
            borderRadius: 9999, padding: '6px 10px',
            fontSize: 10, fontWeight: 700, letterSpacing: 1,
            textTransform: 'uppercase', cursor: 'pointer',
            boxShadow: `0 2px 8px ${accent}66`,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
          }}>
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>
            </svg>
            Check eBay
          </button>
        </div>
      )}

      <div style={{
        position: 'absolute', bottom: 10, right: 12,
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 9999,
        background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a33',
        fontSize: 9, color: '#6b6b78', fontWeight: 600, letterSpacing: 0.3,
        cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace',
      }}>
        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="#6b6b78" strokeWidth="2.4" strokeLinecap="round">
          <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
        </svg>
        <span>Checked 2h ago</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'alerts' | 'high';

export default function WantListPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.push('/login');
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const items = filter === 'alerts' ? WANTS.filter(w => w.alert)
    : filter === 'high' ? WANTS.filter(w => w.priority === 'high')
    : WANTS;

  const totalNeeded = items.reduce((s, w) => s + w.target, 0);
  const alertCount = WANTS.filter(w => w.alert).length;
  const accent = '#FF4713';

  return (
    <div style={{ background: '#0A0A0B', minHeight: '100vh', color: '#E8E8EF', paddingBottom: 110, fontFamily: 'var(--font-body), Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '18px 20px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 30, letterSpacing: -0.3, lineHeight: 1,
            }}>Want List</div>
            <div style={{ fontSize: 13, color: '#9B9BA8', marginTop: 4 }}>
              {items.length} cards · ${totalNeeded.toLocaleString()} to finish
            </div>
          </div>
          <button style={{
            background: accent, color: '#fff', border: 'none',
            borderRadius: 9999, width: 36, height: 36,
            fontSize: 20, fontWeight: 500, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255,71,19,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>+</button>
        </div>
      </div>

      {/* Alert strip */}
      {alertCount > 0 && filter !== 'alerts' && (
        <div style={{
          margin: '0 16px 14px', padding: '12px 14px',
          background: 'linear-gradient(90deg, rgba(255,71,19,0.15), rgba(255,71,19,0.05))',
          border: '1px solid rgba(255,71,19,0.35)', borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        }} onClick={() => setFilter('alerts')}>
          <div style={{
            width: 8, height: 8, borderRadius: 9999, background: accent,
            boxShadow: `0 0 0 4px ${accent}33`,
            animation: 'alertPulse 1.6s ease-in-out infinite',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
              {alertCount} card{alertCount > 1 ? 's' : ''} in your price range now
            </div>
            <div style={{ fontSize: 11, color: '#FFB8A3', marginTop: 2 }}>
              Market dropped below your target. Tap to see.
            </div>
          </div>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      )}

      {/* Filter chips */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 16px 14px' }}>
        <FilterChip label="All"          count={WANTS.length}  active={filter === 'all'}    onClick={() => setFilter('all')} />
        <FilterChip label="Price alerts" count={alertCount}    active={filter === 'alerts'} onClick={() => setFilter('alerts')} />
        <FilterChip label="High priority"                      active={filter === 'high'}   onClick={() => setFilter('high')} />
      </div>

      {/* Cards */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(w => <WantRow key={w.id} want={w} />)}
      </div>
    </div>
  );
}
