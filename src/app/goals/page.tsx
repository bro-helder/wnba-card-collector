'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { PARALLELS, type ParallelKey } from '@/lib/cardData';

// ── Rainbow data ───────────────────────────────────────────────────────────────

const RAINBOW_ORDER: ParallelKey[] = ['base','silver','blueIce','redIce','neonPulse','tigerStripe','pulsar','mojo','gold','goldVinyl','oneOfOne'];
const RAINBOW_OWNED = new Set<ParallelKey>(['silver','redIce','oneOfOne']);

// ── Goal card ─────────────────────────────────────────────────────────────────

interface GoalCardProps {
  type: 'teamSet' | 'playerPC' | 'rookieClass' | 'completeSet' | 'rainbow';
  title: string;
  subtitle: string;
  owned: number;
  total: number;
  tint: string;
  done?: boolean;
}

function GoalCard({ type, title, subtitle, owned, total, tint, done }: GoalCardProps) {
  const pct = Math.round((owned / total) * 100);
  const glyph = { teamSet: '⬡', playerPC: '◉', rookieClass: '✦', rainbow: '❏', completeSet: '▦' }[type] || '●';
  const typeLabel = { teamSet: 'Team set', playerPC: 'Player PC', rookieClass: 'Rookie class', completeSet: 'Set build', rainbow: 'Rainbow' }[type];
  const r = 23;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{
      background: '#111115',
      border: `1px solid ${done ? 'rgba(46,204,113,0.35)' : '#1f1f26'}`,
      borderRadius: 12, padding: 14,
      display: 'flex', gap: 14, alignItems: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: done ? '#2ECC71' : tint }} />
      <div style={{ width: 54, height: 54, flexShrink: 0, position: 'relative' }}>
        <svg viewBox="0 0 54 54" width="54" height="54">
          <circle cx="27" cy="27" r={r} fill="none" stroke="#1f1f26" strokeWidth="4"/>
          <circle cx="27" cy="27" r={r} fill="none"
            stroke={done ? '#2ECC71' : tint} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct / 100)}
            transform="rotate(-90 27 27)"
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700,
          color: done ? '#2ECC71' : '#E8E8EF',
        }}>{done ? '✓' : pct + '%'}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 10, color: tint }}>{glyph}</span>
          <span style={{
            fontSize: 9, letterSpacing: 1.5, fontWeight: 700, color: '#6b6b78',
            textTransform: 'uppercase', fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
          }}>{typeLabel}</span>
        </div>
        <div style={{
          fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: 17, letterSpacing: 0.1, lineHeight: 1.1, color: '#E8E8EF',
        }}>{title}</div>
        <div style={{ fontSize: 11, color: '#9B9BA8', marginTop: 2 }}>{subtitle}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 17, fontWeight: 700, color: '#E8E8EF', lineHeight: 1,
        }}>{owned}<span style={{ color: '#6b6b78', fontSize: 12 }}>/{total}</span></div>
        <div style={{ fontSize: 10, color: '#6b6b78', marginTop: 3, letterSpacing: 0.3 }}>
          {done ? 'complete' : `${total - owned} to go`}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
      fontWeight: 700, fontSize: 11, letterSpacing: 2.5, color: '#6b6b78',
      textTransform: 'uppercase', marginTop: 6, marginBottom: -2,
    }}>{children}</div>
  );
}

// ── Featured rainbow tile ─────────────────────────────────────────────────────

function FeaturedRainbow() {
  const count = RAINBOW_OWNED.size;
  const total = RAINBOW_ORDER.length;
  const pct = Math.round((count / total) * 100);

  return (
    <div style={{
      position: 'relative', borderRadius: 16, overflow: 'hidden',
      background: 'linear-gradient(155deg, #1a0a06 0%, #0A0A0B 65%)',
      border: '1px solid rgba(255,71,19,0.3)', padding: 16,
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.28,
        background: 'radial-gradient(circle at 80% 0%, #FFD700 0%, transparent 40%), radial-gradient(circle at 20% 100%, #9B59B6 0%, transparent 45%)',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, fontWeight: 700, color: '#FFD700', fontFamily: 'var(--font-display), Barlow Condensed, sans-serif', textTransform: 'uppercase' }}>★ Rainbow Chase</div>
            <div style={{ fontFamily: 'var(--font-display), Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 24, letterSpacing: -0.2, marginTop: 2 }}>Caitlin Clark '24</div>
            <div style={{ fontSize: 11, color: '#9B9BA8', marginTop: 2 }}>2024 Prizm · every parallel</div>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1, letterSpacing: -0.5 }}>
            {count}<span style={{ color: '#6b6b78', fontSize: 16 }}>/{total}</span>
          </div>
        </div>

        {/* Parallel slots */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${total}, 1fr)`, gap: 4, marginTop: 14 }}>
          {RAINBOW_ORDER.map(k => {
            const p = PARALLELS[k];
            const got = RAINBOW_OWNED.has(k);
            const isOOO = k === 'oneOfOne';
            const bg = isOOO
              ? 'linear-gradient(135deg, #FF4713, #FFD700, #00C9A7, #9B59B6)'
              : k === 'mojo'
              ? 'linear-gradient(135deg, #2C65D4, #9B59B6, #E74C3C)'
              : p.hex;
            return (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{
                  width: '100%', aspectRatio: '5/7', borderRadius: 3,
                  background: got ? bg : 'transparent',
                  border: got ? 'none' : '1.2px dashed #2a2a33',
                  opacity: got ? 1 : 0.5,
                  boxShadow: got ? `0 0 8px ${isOOO ? '#FFD700' : p.hex}aa` : 'none',
                }} className={isOOO && got ? 'rainbow-border' : undefined} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${total}, 1fr)`, gap: 4, marginTop: 4 }}>
          {RAINBOW_ORDER.map(k => {
            const got = RAINBOW_OWNED.has(k);
            return (
              <div key={k} style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 7,
                color: got ? '#E8E8EF' : '#3a3a45',
                textAlign: 'center', lineHeight: 1,
                letterSpacing: 0.5, textTransform: 'uppercase',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{PARALLELS[k].run ?? '∞'}</div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, height: 4, background: '#1f1f26', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: pct + '%', background: 'linear-gradient(90deg, #FF4713, #FFD700)', borderRadius: 9999 }} />
          </div>
          <div style={{ fontSize: 11, color: '#9B9BA8', fontFamily: 'JetBrains Mono, monospace' }}>{pct}%</div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button style={{
            flex: 1, padding: '10px 14px', background: 'rgba(255,71,19,0.9)', color: '#fff',
            border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3,
          }}>View progress →</button>
          <button style={{
            padding: '10px 14px', background: 'transparent', color: '#E8E8EF',
            border: '1px solid #2a2a33', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>8 on market</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.push('/login');
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div style={{ background: '#0A0A0B', minHeight: '100vh', color: '#E8E8EF', paddingBottom: 110, fontFamily: 'var(--font-body), Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '18px 20px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 30, letterSpacing: -0.3, lineHeight: 1,
            }}>Goals</div>
            <div style={{ fontSize: 13, color: '#9B9BA8', marginTop: 4 }}>4 chases active · 1 completed</div>
          </div>
          <button style={{
            background: '#FF4713', color: '#fff', border: 'none',
            borderRadius: 9999, width: 36, height: 36,
            fontSize: 20, fontWeight: 500, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255,71,19,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>+</button>
        </div>
      </div>

      {/* Featured rainbow */}
      <div style={{ padding: '16px 16px 0' }}>
        <FeaturedRainbow />
      </div>

      {/* Goal list */}
      <div style={{ padding: '18px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionLabel>In progress</SectionLabel>

        <GoalCard type="teamSet"     title="2024 Indiana Fever"         subtitle="Base team set · #1–#12"       owned={8}  total={12}  tint="#FFC633" />
        <GoalCard type="playerPC"    title="Cameron Brink PC"           subtitle="All cards, all parallels"     owned={3}  total={14}  tint="#552583" />
        <GoalCard type="completeSet" title="2024 Prizm · Base Set"      subtitle="Full base · #1–#100"          owned={62} total={100} tint="#E74C3C" />
        <GoalCard type="rookieClass" title="2024 Rookie Class"          subtitle="Top 10 prospects' RCs"        owned={6}  total={10}  tint="#FF4713" />

        <SectionLabel>Completed</SectionLabel>
        <GoalCard type="teamSet"     title="2024 Sparks Silver Run"     subtitle="All Sparks silvers · #3, #7, #11" owned={3} total={3} tint="#FDB927" done />
      </div>
    </div>
  );
}
