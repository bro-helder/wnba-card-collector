// CollectionScreen.jsx — the main Collection browse view
// Renders inside an iOS device frame. Multiple variants exposed as props.

function CollectionScreen({ variant = 'grid', searchQuery = '', activeFilter = 'all', showFavs = false, cards = window.CARDS }) {
  const filtered = React.useMemo(() => {
    let r = cards;
    if (showFavs) r = r.filter(c => c.fav);
    if (activeFilter !== 'all') {
      if (activeFilter === 'rookies') r = r.filter(c => c.rookie);
      else if (activeFilter === 'premium') r = r.filter(c => {
        const p = window.PARALLELS[c.parallel];
        return p.run && p.run <= 25;
      });
      else if (activeFilter === 'hits') r = r.filter(c => c.cost > 200);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter(c =>
        c.player.toLowerCase().includes(q) ||
        c.team.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q)
      );
    }
    return r;
  }, [cards, activeFilter, searchQuery, showFavs]);

  const totalValue = filtered.reduce((s, c) => s + (c.cost || 0), 0);

  return (
    <div style={{
      background: '#0A0A0B',
      minHeight: '100%',
      color: '#F5F5F7',
      paddingBottom: 100,
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Header — respects status bar */}
      <div style={{
        padding: '56px 16px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 2,
              color: '#FF4713',
              textTransform: 'uppercase',
              marginBottom: 2,
            }}>My Collection</div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 38,
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>The Vault</div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 9999,
            background: 'linear-gradient(135deg, #FF4713, #FFD700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
            fontSize: 14, color: '#fff', letterSpacing: 0.5,
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
            { v: `$${(totalValue/1000).toFixed(1)}k`, l: 'Value' },
            { v: filtered.filter(c => window.PARALLELS[c.parallel].run && window.PARALLELS[c.parallel].run <= 25).length, l: 'Hits' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', borderLeft: i > 0 ? '1px solid #1F1F23' : 'none' }}>
              <div style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 800, fontSize: 22, lineHeight: 1,
                color: '#F5F5F7',
              }}>{s.v}</div>
              <div style={{
                fontSize: 10, fontWeight: 500, color: '#8E8E9A',
                textTransform: 'uppercase', letterSpacing: 1, marginTop: 3,
              }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#161618', border: '1px solid #2A2A2F',
          borderRadius: 12, padding: '10px 14px', marginBottom: 12,
          height: 44, boxSizing: 'border-box',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E9A" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>
          </svg>
          <div style={{
            flex: 1, fontSize: 14, color: searchQuery ? '#F5F5F7' : '#45454E',
          }}>{searchQuery || 'Search player, set, or #…'}</div>
          {searchQuery && (
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 11, fontWeight: 700, color: '#00C9A7',
              textTransform: 'uppercase', letterSpacing: 1,
            }}>{filtered.length} match</div>
          )}
        </div>

        {/* Filter chips */}
        <div className="no-scrollbar" style={{
          display: 'flex', gap: 8, overflowX: 'auto',
          marginBottom: 14, paddingBottom: 2, marginLeft: -16, paddingLeft: 16, marginRight: -16, paddingRight: 16,
        }}>
          <window.FilterChip label="All" active={activeFilter==='all'} count={cards.length} />
          <window.FilterChip label="Rookies" active={activeFilter==='rookies'} count={cards.filter(c=>c.rookie).length} />
          <window.FilterChip label="Premium" active={activeFilter==='premium'} count={cards.filter(c=>{const p=window.PARALLELS[c.parallel];return p.run&&p.run<=25;}).length} />
          <window.FilterChip label="Big Hits" active={activeFilter==='hits'} />
          <window.FilterChip label="By Set" />
          <window.FilterChip label="By Team" />
        </div>
      </div>

      {/* Content area */}
      <div style={{ padding: '0 16px' }}>
        {variant === 'grid' && <GridView cards={filtered} />}
        {variant === 'list' && <ListView cards={filtered} />}
        {variant === 'stack' && <StackView cards={filtered} />}
      </div>
    </div>
  );
}

function GridView({ cards }) {
  // Feature the first card big, rest 2-col
  const [feature, ...rest] = cards;
  if (!feature) return <EmptyState />;
  return (
    <div>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: 700, fontSize: 14,
        color: '#8E8E9A', textTransform: 'uppercase',
        letterSpacing: 2, marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ color: '#FF4713' }}>◆</span> Featured Pull
      </div>
      <FeatureCard card={feature} />

      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: 700, fontSize: 14,
        color: '#8E8E9A', textTransform: 'uppercase',
        letterSpacing: 2, marginTop: 18, marginBottom: 10,
      }}>Recent Adds · {rest.length}</div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        {rest.map(c => <GridCard key={c.id} card={c} />)}
      </div>
    </div>
  );
}

function FeatureCard({ card }) {
  const p = window.PARALLELS[card.parallel];
  return (
    <div style={{
      position: 'relative',
      background: '#161618',
      border: '1px solid #1F1F23',
      borderRadius: 14,
      padding: 14,
      display: 'flex',
      gap: 14,
      overflow: 'hidden',
    }}>
      <div style={{ width: 120, flexShrink: 0 }} className="tilt-card">
        <window.CardArt card={card} size="md" />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          {card.fav && <span style={{ color: '#FFD700', fontSize: 14 }}>★</span>}
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 10, fontWeight: 600, color: '#00C9A7',
            textTransform: 'uppercase', letterSpacing: 1.5,
          }}>Featured</span>
        </div>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800, fontSize: 22, lineHeight: 1.05,
          textTransform: 'uppercase', marginBottom: 2,
        }}>{card.player}</div>
        <div style={{ fontSize: 12, color: '#8E8E9A', marginBottom: 8 }}>
          {card.set} · #{card.num}
        </div>
        <div style={{ marginBottom: 8 }}>
          <window.ParallelBadge parallelKey={card.parallel} />
        </div>
        {card.serial && (
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700, fontSize: 13, color: '#F5F5F7',
            marginBottom: 8,
          }}>Serial <span style={{ color: p.hex }}>{card.serial}</span></div>
        )}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 800, fontSize: 20, color: '#F5F5F7',
          }}>${card.cost}</div>
          <div style={{ fontSize: 10, color: '#8E8E9A', textTransform: 'uppercase', letterSpacing: 1 }}>paid · {card.cond}</div>
        </div>
      </div>
    </div>
  );
}

function GridCard({ card }) {
  return (
    <div className="tilt-card" style={{ position: 'relative' }}>
      <window.CardArt card={card} size="sm" />
      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: 13, lineHeight: 1.1,
          color: '#F5F5F7', textTransform: 'uppercase',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{card.player}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <window.ParallelBadge parallelKey={card.parallel} size="sm" />
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700, fontSize: 12, color: '#8E8E9A',
          }}>${card.cost}</div>
        </div>
      </div>
    </div>
  );
}

function ListView({ cards }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {cards.map(c => <ListRow key={c.id} card={c} />)}
    </div>
  );
}

function ListRow({ card }) {
  const team = window.TEAMS[card.team];
  const p = window.PARALLELS[card.parallel];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: '#161618', border: '1px solid #1F1F23',
      borderRadius: 12, padding: 10,
    }}>
      <div style={{ width: 54, flexShrink: 0 }}>
        <window.CardArt card={card} size="sm" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          {card.fav && <span style={{ color: '#FFD700', fontSize: 12, lineHeight: 1 }}>★</span>}
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700, fontSize: 17, lineHeight: 1.1,
            textTransform: 'uppercase', letterSpacing: 0.3,
          }}>{card.player}</div>
          {card.rookie && <span style={{
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
            fontSize: 9, color: '#FFD700', border: '1px solid #FFD70099',
            borderRadius: 3, padding: '1px 4px', lineHeight: 1, letterSpacing: 0.5,
          }}>RC</span>}
        </div>
        <div style={{ fontSize: 11, color: '#8E8E9A', marginBottom: 4 }}>
          {card.set} · #{card.num} · {team && team.short}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <window.ParallelBadge parallelKey={card.parallel} size="sm" />
          {card.serial && (
            <span style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 10, color: p.hex, letterSpacing: 0.5,
            }}>{card.serial}</span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800, fontSize: 16, color: '#F5F5F7', lineHeight: 1,
        }}>${card.cost}</div>
        <div style={{
          fontSize: 9, color: '#8E8E9A',
          textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2,
        }}>{card.cond}</div>
      </div>
    </div>
  );
}

function StackView({ cards }) {
  // Grouped by player — shows the stacked "binder" metaphor
  const groups = {};
  cards.forEach(c => {
    groups[c.player] = groups[c.player] || [];
    groups[c.player].push(c);
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {Object.entries(groups).map(([player, pCards]) => (
        <PlayerStack key={player} player={player} cards={pCards} />
      ))}
    </div>
  );
}

function PlayerStack({ player, cards }) {
  const team = window.TEAMS[cards[0].team];
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 800, fontSize: 18, textTransform: 'uppercase',
            letterSpacing: 0.3,
          }}>{player}</div>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700, fontSize: 10, color: team && team.p,
            letterSpacing: 2, textTransform: 'uppercase',
          }}>{team && team.short}</div>
        </div>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: 12, color: '#8E8E9A', letterSpacing: 1,
        }}>{cards.length} COPIES</div>
      </div>
      <div className="no-scrollbar" style={{
        display: 'flex', gap: 10, overflowX: 'auto',
        marginLeft: -16, paddingLeft: 16, marginRight: -16, paddingRight: 16,
        paddingBottom: 4,
      }}>
        {cards.map(c => (
          <div key={c.id} className="tilt-card" style={{ width: 110, flexShrink: 0 }}>
            <window.CardArt card={c} size="sm" />
            <div style={{ marginTop: 6 }}>
              <window.ParallelBadge parallelKey={c.parallel} size="sm" />
            </div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 12, color: '#F5F5F7', marginTop: 4,
            }}>${c.cost}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center', padding: '40px 20px',
      color: '#8E8E9A',
    }}>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: 800, fontSize: 20,
        color: '#F5F5F7', textTransform: 'uppercase', marginBottom: 8,
      }}>No cards match</div>
      <div style={{ fontSize: 13 }}>Try a different filter or scan a new pull.</div>
    </div>
  );
}

Object.assign(window, { CollectionScreen });
