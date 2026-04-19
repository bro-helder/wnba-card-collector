'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { CardArt, type CardData } from '@/components/CardArt';
import { ParallelBadge } from '@/components/ParallelBadge';
import { PARALLELS, TEAMS, nameToParallelKey, type ParallelKey } from '@/lib/cardData';

// ── Types ──────────────────────────────────────────────────────────────────────

interface DBCollectionRow {
  id: string;
  serial_number: string | null;
  condition: string | null;
  cost_paid: number | null;
  acquisition_date: string | null;
  notes: string | null;
  cards: {
    player_name: string;
    team: string | null;
    card_number: string;
    rookie_card: boolean | null;
    sets: { name: string; year: number } | null;
  } | null;
  parallels: {
    name: string;
    print_run: number | null;
  } | null;
}

interface CollectionCard extends CardData {
  id: string;
  cond: string;
  cost: number;
  date: string;
  fav: boolean;
}

type ViewMode = 'grid' | 'list' | 'stack';
type FilterKey = 'all' | 'rookies' | 'premium' | 'hits';

// ── Helpers ────────────────────────────────────────────────────────────────────

function condShort(cond: string | null): 'MT' | 'NM' | 'EX' {
  if (!cond) return 'NM';
  const c = cond.toLowerCase();
  if (c.includes('mint') && !c.includes('near')) return 'MT';
  if (c.includes('near mint') || c.includes('nm')) return 'NM';
  return 'EX';
}

function isHit(c: CollectionCard): boolean {
  return c.serial !== null || (PARALLELS[c.parallel].run !== undefined && PARALLELS[c.parallel].run! <= 99);
}

function mapRow(row: DBCollectionRow): CollectionCard {
  const card = row.cards;
  const set = card?.sets;
  const parallelKey = nameToParallelKey(row.parallels?.name);
  const setName = set ? `${set.year} ${set.name}` : '2024 Prizm';

  return {
    id: row.id,
    player: card?.player_name ?? 'Unknown Player',
    team: card?.team ?? 'Indiana Fever',
    set: setName,
    num: card?.card_number ?? '?',
    parallel: parallelKey,
    rookie: card?.rookie_card ?? false,
    serial: row.serial_number,
    cond: condShort(row.condition),
    cost: row.cost_paid ?? 0,
    date: row.acquisition_date ?? row.id,
    // TODO: add favorites column to collection table
    fav: false,
  };
}

// ── Filter chip ────────────────────────────────────────────────────────────────

function FilterChip({ label, active, count, onClick }: { label: string; active?: boolean; count?: number; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: 9999,
        fontFamily: 'var(--font-body), Inter, sans-serif',
        fontSize: 13, fontWeight: 600,
        background: active ? '#FF4713' : '#1F1F23',
        color: active ? '#fff' : '#8E8E9A',
        border: active ? '1px solid #FF4713' : '1px solid #2A2A2F',
        cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        transition: 'all 150ms',
      }}
    >
      {label}
      {count !== undefined && <span style={{ fontSize: 11, opacity: 0.7 }}>{count}</span>}
    </button>
  );
}

// ── View mode button ───────────────────────────────────────────────────────────

function ViewBtn({ mode, current, onClick, icon }: { mode: ViewMode; current: ViewMode; onClick: () => void; icon: string }) {
  const active = mode === current;
  return (
    <button onClick={onClick} style={{
      width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
      background: active ? '#FF471326' : 'transparent',
      color: active ? '#FF4713' : '#45454E',
      fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{icon}</button>
  );
}

// ── Grid card ─────────────────────────────────────────────────────────────────

function GridCard({ card }: { card: CollectionCard }) {
  return (
    <div className="tilt-card" style={{ position: 'relative' }}>
      <CardArt card={card} size="sm" />
      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: 13, lineHeight: 1.1,
          color: '#F5F5F7', textTransform: 'uppercase',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{card.player}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <ParallelBadge parallelKey={card.parallel} size="sm" />
          {card.cost > 0 && (
            <div style={{
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 12, color: '#8E8E9A',
            }}>${card.cost}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Featured card (hero in grid view) ─────────────────────────────────────────

function FeatureCard({ card }: { card: CollectionCard }) {
  const p = PARALLELS[card.parallel];
  return (
    <div style={{
      position: 'relative',
      background: '#161618', border: '1px solid #1F1F23',
      borderRadius: 14, padding: 14,
      display: 'flex', gap: 14, overflow: 'hidden',
    }}>
      <div style={{ width: 120, flexShrink: 0 }} className="tilt-card">
        <CardArt card={card} size="md" />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          {card.fav && <span style={{ color: '#FFD700', fontSize: 14 }}>★</span>}
          <span style={{
            fontFamily: 'var(--font-body), Inter, sans-serif',
            fontSize: 10, fontWeight: 600, color: '#00C9A7',
            textTransform: 'uppercase', letterSpacing: 1.5,
          }}>Featured</span>
        </div>
        <div style={{
          fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
          fontWeight: 800, fontSize: 22, lineHeight: 1.05,
          textTransform: 'uppercase', marginBottom: 2,
        }}>{card.player}</div>
        <div style={{ fontSize: 12, color: '#8E8E9A', marginBottom: 8 }}>
          {card.set} · #{card.num}
        </div>
        <div style={{ marginBottom: 8 }}>
          <ParallelBadge parallelKey={card.parallel} />
        </div>
        {card.serial && (
          <div style={{
            fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
            fontWeight: 700, fontSize: 13, color: '#F5F5F7', marginBottom: 8,
          }}>Serial <span style={{ color: p.hex }}>{card.serial}</span></div>
        )}
        {card.cost > 0 && (
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <div style={{
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 20, color: '#F5F5F7',
            }}>${card.cost}</div>
            <div style={{ fontSize: 10, color: '#8E8E9A', textTransform: 'uppercase', letterSpacing: 1 }}>
              paid · {card.cond}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── List row ──────────────────────────────────────────────────────────────────

function ListRow({ card }: { card: CollectionCard }) {
  const team = TEAMS[card.team];
  const p = PARALLELS[card.parallel];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: '#161618', border: '1px solid #1F1F23',
      borderRadius: 12, padding: 10,
    }}>
      <div style={{ width: 54, flexShrink: 0 }}>
        <CardArt card={card} size="sm" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          {card.fav && <span style={{ color: '#FFD700', fontSize: 12, lineHeight: 1 }}>★</span>}
          <div style={{
            fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
            fontWeight: 700, fontSize: 17, lineHeight: 1.1,
            textTransform: 'uppercase', letterSpacing: 0.3,
          }}>{card.player}</div>
          {card.rookie && (
            <span style={{
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 9, color: '#FFD700',
              border: '1px solid #FFD70099', borderRadius: 3,
              padding: '1px 4px', lineHeight: 1, letterSpacing: 0.5,
            }}>RC</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#8E8E9A', marginBottom: 4 }}>
          {card.set} · #{card.num} · {team?.short ?? ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ParallelBadge parallelKey={card.parallel} size="sm" />
          {card.serial && (
            <span style={{
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 10, color: p.hex, letterSpacing: 0.5,
            }}>{card.serial}</span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {card.cost > 0 && (
          <>
            <div style={{
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 16, color: '#F5F5F7', lineHeight: 1,
            }}>${card.cost}</div>
            <div style={{ fontSize: 9, color: '#8E8E9A', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>
              {card.cond}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Stack view ────────────────────────────────────────────────────────────────

function StackView({ cards }: { cards: CollectionCard[] }) {
  const groups: Record<string, CollectionCard[]> = {};
  cards.forEach(c => {
    groups[c.player] = groups[c.player] || [];
    groups[c.player].push(c);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {Object.entries(groups).map(([player, pCards]) => {
        const team = TEAMS[pCards[0].team];
        return (
          <div key={player}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
                  fontWeight: 800, fontSize: 18, textTransform: 'uppercase', letterSpacing: 0.3,
                }}>{player}</div>
                <div style={{
                  fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
                  fontWeight: 700, fontSize: 10, color: team?.p ?? '#FF4713',
                  letterSpacing: 2, textTransform: 'uppercase',
                }}>{team?.short ?? ''}</div>
              </div>
              <div style={{
                fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
                fontWeight: 700, fontSize: 12, color: '#8E8E9A', letterSpacing: 1,
              }}>{pCards.length} COPIES</div>
            </div>
            <div className="no-scrollbar" style={{
              display: 'flex', gap: 10, overflowX: 'auto',
              marginLeft: -16, paddingLeft: 16, marginRight: -16, paddingRight: 16,
              paddingBottom: 4,
            }}>
              {pCards.map(c => (
                <div key={c.id} className="tilt-card" style={{ width: 110, flexShrink: 0 }}>
                  <CardArt card={c} size="sm" />
                  <div style={{ marginTop: 6 }}>
                    <ParallelBadge parallelKey={c.parallel} size="sm" />
                  </div>
                  {c.cost > 0 && (
                    <div style={{
                      fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
                      fontWeight: 700, fontSize: 12, color: '#F5F5F7', marginTop: 4,
                    }}>${c.cost}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CollectionPage() {
  const router = useRouter();
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const loadCollection = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('collection')
      .select('id,serial_number,condition,cost_paid,acquisition_date,notes,cards(player_name,team,card_number,rookie_card,sets(name,year)),parallels(name,print_run)')
      .order('acquisition_date', { ascending: false });

    setLoading(false);
    // TODO: regenerate database.types.ts when schema stabilises to replace this cast
    if (data) setCards((data as unknown as DBCollectionRow[]).map(mapRow));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }
      loadCollection();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.push('/login');
    });
    return () => subscription.unsubscribe();
  }, [router, loadCollection]);

  const filtered = useMemo(() => {
    let r = cards;
    if (filter === 'rookies') r = r.filter(c => c.rookie);
    if (filter === 'premium') r = r.filter(c => {
      const p = PARALLELS[c.parallel];
      return p.run !== undefined && p.run <= 25;
    });
    if (filter === 'hits') r = r.filter(isHit);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(c =>
        c.player.toLowerCase().includes(q) ||
        c.team.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q)
      );
    }
    return r;
  }, [cards, filter, search]);

  const totalValue = filtered.reduce((s, c) => s + c.cost, 0);
  const hitsCount = cards.filter(isHit).length;

  const [feature, ...rest] = filtered;

  return (
    <div style={{ background: '#0A0A0B', minHeight: '100vh', color: '#F5F5F7', paddingBottom: 100, fontFamily: 'var(--font-body), Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '56px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-body), Inter, sans-serif',
              fontSize: 11, fontWeight: 600, letterSpacing: 2,
              color: '#FF4713', textTransform: 'uppercase', marginBottom: 2,
            }}>My Collection</div>
            <div style={{
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 38, lineHeight: 1,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>The Vault</div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 9999,
            background: 'linear-gradient(135deg, #FF4713, #FFD700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
            fontWeight: 800, fontSize: 14, color: '#fff', letterSpacing: 0.5,
          }}>BR</div>
        </div>

        {/* Stat strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          background: '#161618', border: '1px solid #1F1F23',
          borderRadius: 14, padding: '12px 6px', marginBottom: 14,
        }}>
          {[
            { v: filtered.length, l: 'Cards' },
            { v: totalValue > 0 ? `$${(totalValue / 1000).toFixed(1)}k` : '—', l: 'Value' },
            { v: hitsCount, l: 'Hits' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', borderLeft: i > 0 ? '1px solid #1F1F23' : 'none' }}>
              <div style={{
                fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
                fontWeight: 800, fontSize: 22, lineHeight: 1, color: '#F5F5F7',
              }}>{s.v}</div>
              <div style={{ fontSize: 10, fontWeight: 500, color: '#8E8E9A', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#161618',
          border: `1px solid ${searchFocused ? '#FF471366' : '#2A2A2F'}`,
          borderRadius: 12, padding: '10px 14px', marginBottom: 12,
          height: 44, boxSizing: 'border-box', transition: 'border-color 150ms',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E9A" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search player, set, or #…"
            style={{
              flex: 1, fontSize: 14, background: 'none', border: 'none', outline: 'none',
              color: '#F5F5F7', fontFamily: 'var(--font-body), Inter, sans-serif',
            }}
          />
          {search && (
            <div style={{
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontSize: 11, fontWeight: 700, color: '#00C9A7',
              textTransform: 'uppercase', letterSpacing: 1,
            }}>{filtered.length} match</div>
          )}
        </div>

        {/* Filter chips + view mode */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="no-scrollbar" style={{
            display: 'flex', gap: 8, overflowX: 'auto',
            paddingBottom: 2, flex: 1,
          }}>
            <FilterChip label="All"      active={filter === 'all'}     count={cards.length}                          onClick={() => setFilter('all')} />
            <FilterChip label="Rookies"  active={filter === 'rookies'} count={cards.filter(c => c.rookie).length}    onClick={() => setFilter('rookies')} />
            <FilterChip label="Premium"  active={filter === 'premium'} count={cards.filter(c => { const p = PARALLELS[c.parallel]; return p.run !== undefined && p.run <= 25; }).length} onClick={() => setFilter('premium')} />
            <FilterChip label="Big Hits" active={filter === 'hits'}    count={cards.filter(isHit).length} onClick={() => setFilter('hits')} />
          </div>
          <div style={{ display: 'flex', gap: 2, marginLeft: 8, flexShrink: 0 }}>
            <ViewBtn mode="grid"  current={view} onClick={() => setView('grid')}  icon="⊞" />
            <ViewBtn mode="list"  current={view} onClick={() => setView('list')}  icon="☰" />
            <ViewBtn mode="stack" current={view} onClick={() => setView('stack')} icon="⫶" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8E8E9A' }}>
            <div style={{ fontSize: 13 }}>Loading your vault…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8E8E9A' }}>
            <div style={{
              fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 20, color: '#F5F5F7',
              textTransform: 'uppercase', marginBottom: 8,
            }}>{cards.length === 0 ? 'Your vault is empty' : 'No cards match'}</div>
            <div style={{ fontSize: 13 }}>
              {cards.length === 0 ? 'Scan a card to add it to the vault.' : 'Try a different filter or scan a new pull.'}
            </div>
          </div>
        ) : view === 'grid' ? (
          <div>
            {feature && (
              <>
                <div style={{
                  fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
                  fontWeight: 700, fontSize: 14, color: '#8E8E9A',
                  textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ color: '#FF4713' }}>◆</span> Featured Pull
                </div>
                <FeatureCard card={feature} />
              </>
            )}
            {rest.length > 0 && (
              <>
                <div style={{
                  fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
                  fontWeight: 700, fontSize: 14, color: '#8E8E9A',
                  textTransform: 'uppercase', letterSpacing: 2,
                  marginTop: 18, marginBottom: 10,
                }}>Recent Adds · {rest.length}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {rest.map(c => <GridCard key={c.id} card={c} />)}
                </div>
              </>
            )}
          </div>
        ) : view === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(c => <ListRow key={c.id} card={c} />)}
          </div>
        ) : (
          <StackView cards={filtered} />
        )}
      </div>
    </div>
  );
}
