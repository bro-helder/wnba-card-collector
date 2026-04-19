// WantListScreen.jsx — the "I still need this" board.
//
// Mental model: a trophy case of cards you don't own yet, each with a target
// price and a progress indicator. Lights up when market drops into your range.
// Sorted by urgency (price-alert cards first, then by priority).

window.WANTS = [
  { id: 'w1', player: "Paige Bueckers", team: 'Dallas Wings',      set: '2025 Prizm', num: 1,   parallel: 'silver',    rookie: true,  serial: null,     target: 80,  market: 74,  priority: 'high', alert: true,  note: 'Rookie year — get before she drops 30' },
  { id: 'w2', player: "Caitlin Clark",  team: 'Indiana Fever',     set: '2024 Prizm', num: 1,   parallel: 'gold',      rookie: true,  serial: '4/10',   target: 3200, market: 3450, priority: 'high', alert: false, note: 'Holy grail for the CC rainbow run' },
  { id: 'w3', player: "Angel Reese",    team: 'Chicago Sky',       set: '2024 Prizm', num: 2,   parallel: 'pulsar',    rookie: true,  serial: '18/49',  target: 180, market: 165, priority: 'med',  alert: true,  note: 'Rainbow chase — need pulsar' },
  { id: 'w4', player: "Cameron Brink",  team: 'Los Angeles Sparks', set: '2024 Prizm', num: 3,   parallel: 'neonPulse', rookie: true,  serial: '31/75',  target: 150, market: 210, priority: 'med',  alert: false, note: 'Waiting for price to cool' },
  { id: 'w5', player: "A'ja Wilson",    team: 'Las Vegas Aces',    set: '2024 Prizm', num: 4,   parallel: 'redIce',    rookie: false, serial: '62/99',  target: 220, market: 240, priority: 'low',  alert: false, note: '' },
  { id: 'w6', player: "Sabrina Ionescu",team: 'New York Liberty',  set: '2024 Prizm', num: 6,   parallel: 'pulsar',    rookie: false, serial: '11/49',  target: 200, market: 195, priority: 'low',  alert: true,  note: '' },
];

function WantListScreen({ state = 'default' }) {
  const accent = '#FF4713';

  if (state === 'empty') {
    return <EmptyState />;
  }
  if (state === 'add') {
    return <AddWantFlow />;
  }
  if (state === 'listingsSheet') {
    return <WantsWithSheet />;
  }
  if (state === 'inlineStrip') {
    return <WantsInlineStrip />;
  }

  let items = window.WANTS;
  if (state === 'alerts') items = items.filter(w => w.alert);
  if (state === 'set')    items = items.filter(w => w.player === 'Caitlin Clark' || w.player === 'Angel Reese' || w.player === 'Cameron Brink' || w.player === 'Paige Bueckers');

  const totalNeeded = items.reduce((s,w) => s + w.target, 0);
  const alertCount = window.WANTS.filter(w => w.alert).length;

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#0A0A0B', color: '#E8E8EF' }}>
      <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 110 }}>

        {/* HEADER */}
        <div style={{ padding: '18px 20px 4px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 8,
          }}>
            <div>
              <div style={{
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
                fontSize: 30, letterSpacing: -0.3, lineHeight: 1,
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

        {/* ALERT STRIP — only when there are alerts */}
        {alertCount > 0 && state !== 'alerts' && (
          <div style={{
            margin: '0 16px 14px', padding: '12px 14px',
            background: 'linear-gradient(90deg, rgba(255,71,19,0.15), rgba(255,71,19,0.05))',
            border: '1px solid rgba(255,71,19,0.35)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: 9999, background: accent,
              boxShadow: `0 0 0 4px ${accent}33`,
              animation: 'alertPulse 1.6s ease-in-out infinite',
            }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {alertCount} card{alertCount>1?'s':''} in your price range now
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

        {/* FILTER CHIPS */}
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 16px 14px',
        }}>
          <FilterChip label="All" count={window.WANTS.length} active={state==='default'} />
          <FilterChip label="Price alerts" count={alertCount} active={state==='alerts'} />
          <FilterChip label="Caitlin rainbow" active={state==='set'} />
          <FilterChip label="Rookies" />
          <FilterChip label="Under $100" />
        </div>

        {/* CARDS */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(w => <WantRow key={w.id} want={w} accent={accent} />)}
        </div>

        {state === 'set' && (
          <div style={{
            margin: '24px 16px 0', padding: '16px',
            border: '1px dashed #2a2a33', borderRadius: 12,
            textAlign: 'center', color: '#6b6b78', fontSize: 12,
          }}>
            Viewing your <b style={{ color: '#E8E8EF' }}>2024 Prizm Rainbow Run</b> · 4 of 11 colors owned · 7 to go
          </div>
        )}
      </div>
      <window.FixedBottomNav active="wants" />
    </div>
  );
}

function WantRow({ want, accent }) {
  const team = window.TEAMS[want.team] || { p: '#333', s: '#000', short: '???' };
  const progress = Math.min(100, Math.max(0, 100 - ((want.market - want.target) / want.target * 100)));
  const inRange = want.market <= want.target;
  const delta = want.market - want.target;
  const deltaPct = Math.round((delta / want.target) * 100);

  return (
    <div style={{
      background: '#111115',
      border: `1px solid ${inRange ? 'rgba(255,71,19,0.45)' : '#1f1f26'}`,
      borderRadius: 12, padding: 14,
      display: 'flex', gap: 14,
      position: 'relative',
      boxShadow: inRange ? `0 0 0 1px rgba(255,71,19,0.15) inset, 0 4px 20px rgba(255,71,19,0.1)` : 'none',
    }}>
      {/* Card mini */}
      <div style={{ width: 72, flexShrink: 0, opacity: 0.92 }}>
        <window.CardArt card={want} size="sm" scanned={true} />
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
          <PriorityDot level={want.priority} />
          <window.ParallelBadge parallelKey={want.parallel} size="sm" />
          {want.rookie && <RCTag/>}
        </div>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
          fontSize: 16, letterSpacing: 0.1, lineHeight: 1.1,
          color: '#E8E8EF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{want.player}</div>
        <div style={{ fontSize: 11, color: '#6b6b78', marginTop: 2 }}>
          {team.short} · #{want.num}{want.serial ? ` · /${want.serial.split('/')[1]}` : ''}
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: 10,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            flex: 1, height: 5, borderRadius: 9999,
            background: '#1f1f26', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: Math.min(100, Math.max(12, progress)) + '%',
              background: inRange ? accent : '#3D7CFF',
              borderRadius: 9999,
              transition: 'width .4s',
              boxShadow: inRange ? `0 0 12px ${accent}88` : 'none',
            }}/>
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: inRange ? accent : '#9B9BA8', fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            ${want.market} / ${want.target}
          </div>
        </div>

        {/* Status line */}
        <div style={{
          marginTop: 6, fontSize: 11, color: inRange ? accent : '#6b6b78',
          fontWeight: inRange ? 600 : 400,
        }}>
          {inRange
            ? `✦ ${Math.abs(deltaPct)}% under your target`
            : `${deltaPct > 0 ? '+' : ''}${deltaPct}% over target`}
        </div>

        {want.note && (
          <div style={{
            marginTop: 8, fontSize: 11, color: '#9B9BA8',
            fontStyle: 'italic', lineHeight: 1.35,
          }}>"{want.note}"</div>
        )}
      </div>

      {/* Quick eBay button — only if last-checked price is in range */}
      {inRange && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
        }}>
          <button style={{
            background: accent, color: '#fff', border: 'none',
            borderRadius: 9999, padding: '6px 10px',
            fontSize: 10, fontWeight: 700, letterSpacing: 1,
            textTransform: 'uppercase', cursor: 'pointer',
            boxShadow: `0 2px 8px ${accent}66`,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: 'Barlow Condensed, sans-serif',
          }}>
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>
            Check eBay
          </button>
        </div>
      )}

      {/* Listings badge — manual fetch. Shows last-checked timestamp, not "live". */}
      <div style={{
        position: 'absolute', bottom: 10, right: 12,
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 9999,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid #2a2a33',
        fontSize: 9, color: '#6b6b78', fontWeight: 600,
        letterSpacing: 0.3, cursor: 'pointer',
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="#6b6b78" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        <span>Checked 2h ago</span>
      </div>
    </div>
  );
}

function PriorityDot({ level }) {
  const colors = { high: '#E74C3C', med: '#F2C94C', low: '#9B9BA8' };
  return (
    <div style={{
      width: 6, height: 6, borderRadius: 9999,
      background: colors[level], marginRight: 2,
    }}/>
  );
}

function RCTag() {
  return (
    <span style={{
      fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 9,
      color: '#FFD700', border: '1px solid #FFD700',
      padding: '1px 4px', borderRadius: 2, letterSpacing: 1.5,
    }}>RC</span>
  );
}

function FilterChip({ label, count, active }) {
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 12px', borderRadius: 9999,
      background: active ? '#FF4713' : '#1F1F23',
      color: active ? '#fff' : '#8E8E9A',
      border: active ? '1px solid #FF4713' : '1px solid #2A2A2F',
      fontFamily: 'Inter', fontSize: 12, fontWeight: 600,
      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {label}
      {count !== undefined && (
        <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 500 }}>{count}</span>
      )}
    </button>
  );
}

function EmptyState() {
  return (
    <div style={{
      height: '100%', background: '#0A0A0B', color: '#E8E8EF',
      display: 'flex', flexDirection: 'column',
      padding: '0 24px',
    }}>
      <div style={{ padding: '18px 0' }}>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
          fontSize: 30, letterSpacing: -0.3,
        }}>Want List</div>
      </div>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', gap: 20, paddingBottom: 100,
      }}>
        <div style={{
          width: 96, height: 132,
          background: 'linear-gradient(155deg, #1f1f26 0%, #0A0A0B 100%)',
          border: '2px dashed #3a3a45', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#3a3a45', fontSize: 40, fontWeight: 300,
        }}>?</div>
        <div>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
            fontSize: 22, marginBottom: 6,
          }}>Chase something</div>
          <div style={{ fontSize: 13, color: '#9B9BA8', maxWidth: 280, lineHeight: 1.5 }}>
            Add cards you're hunting for. We'll track prices and ping you when one drops into your range.
          </div>
        </div>
        <button style={{
          background: '#FF4713', color: '#fff', border: 'none',
          borderRadius: 12, padding: '14px 24px',
          fontFamily: 'Inter', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,71,19,0.4)',
        }}>+ Add your first want</button>
      </div>
      <window.FixedBottomNav active="wants" />
    </div>
  );
}

function AddWantFlow() {
  // Search-first add; example query with Paige Bueckers results
  return (
    <div style={{ height: '100%', background: '#0A0A0B', color: '#E8E8EF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{
          width: 32, height: 32, borderRadius: 9999,
          background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#E8E8EF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 20 }}>Add to Want List</div>
      </div>
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#1F1F23', border: '1px solid #2A2A2F',
          borderRadius: 10, padding: '12px 14px',
        }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9B9BA8" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <div style={{ fontSize: 14, color: '#E8E8EF' }}>Paige Bueckers</div>
          <div style={{ marginLeft: 'auto', width: 2, height: 16, background: '#FF4713' }}/>
        </div>
      </div>

      <div style={{ padding: '0 16px 4px', fontSize: 11, color: '#6b6b78', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>
        3 matches
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { parallel: 'silver', set: '2025 Prizm', num: 1, serial: null, price: 74, picked: true },
          { parallel: 'blueIce', set: '2025 Prizm', num: 1, serial: '32/49', price: 210, picked: false },
          { parallel: 'gold', set: '2025 Prizm', num: 1, serial: '6/10', price: 890, picked: false },
        ].map((m, i) => (
          <div key={i} style={{
            background: m.picked ? 'rgba(255,71,19,0.08)' : '#111115',
            border: m.picked ? '1px solid rgba(255,71,19,0.45)' : '1px solid #1f1f26',
            borderRadius: 10, padding: 12, display: 'flex', gap: 12, alignItems: 'center',
          }}>
            <div style={{ width: 52, flexShrink: 0 }}>
              <window.CardArt card={{ ...m, id: 'match'+i, player: 'Paige Bueckers', team: 'Dallas Wings', rookie: true }} size="sm" scanned={true} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E8EF' }}>
                {window.PARALLELS[m.parallel]?.name}
                {m.serial ? <span style={{ color: '#6b6b78', fontFamily: 'JetBrains Mono', fontSize: 11 }}> · /{m.serial.split('/')[1]}</span> : null}
              </div>
              <div style={{ fontSize: 11, color: '#9B9BA8', marginTop: 2 }}>
                {m.set} · #{m.num}
              </div>
              <div style={{ fontSize: 11, color: '#6b6b78', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
                Market <span style={{ color: '#E8E8EF', fontWeight: 600 }}>${m.price}</span>
              </div>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: 9999,
              border: m.picked ? 'none' : '1.5px solid #3a3a45',
              background: m.picked ? '#FF4713' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {m.picked && (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7"/>
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: 16, borderTop: '1px solid #1f1f26', background: '#0A0A0B',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: '#9B9BA8' }}>Target price</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 15, color: '#E8E8EF', fontWeight: 600 }}>$80</div>
        </div>
        <div style={{ height: 4, background: '#1f1f26', borderRadius: 9999, marginBottom: 16, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '32%', background: '#FF4713', borderRadius: 9999 }}/>
          <div style={{ position: 'absolute', left: '32%', top: -4, width: 12, height: 12, borderRadius: 9999, background: '#fff', transform: 'translateX(-50%)', boxShadow: '0 0 0 3px #FF4713' }}/>
        </div>
        <button style={{
          width: '100%', padding: 14, background: '#FF4713', color: '#fff',
          border: 'none', borderRadius: 12, fontFamily: 'Inter', fontSize: 14, fontWeight: 700,
          cursor: 'pointer',
        }}>Add to Want List →</button>
      </div>
      <window.FixedBottomNav active="wants" />
    </div>
  );
}

// Ensure pulse animation exists
if (!document.getElementById('want-list-styles')) {
  const s = document.createElement('style');
  s.id = 'want-list-styles';
  s.innerHTML = `
    @keyframes alertPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { WantListScreen });


function WantsWithSheet() {
  const paige = window.WANTS.find(w => w.player === 'Paige Bueckers');
  const listings = window.EBAY_LISTINGS_FOR(paige);
  return (
    <>
      <WantListScreen state="default" />
      <window.EbayListingsSheet
        title="Paige Bueckers · Silver"
        subtitle={`${listings.length} listings · 2025 Prizm #1`}
        target={paige.target}
        listings={listings}
      />
    </>
  );
}

// Option B: inline top-3 listings strip baked into each want row (no sheet).
function WantsInlineStrip() {
  const accent = '#FF4713';
  const items = window.WANTS.slice(0, 4);
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#0A0A0B', color: '#E8E8EF' }}>
      <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 110 }}>
        <div style={{ padding: '18px 20px 14px' }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: -0.3, lineHeight: 1 }}>Want List</div>
          <div style={{ fontSize: 13, color: '#9B9BA8', marginTop: 4 }}>Top 3 cheapest · last checked 2h ago · tap to refresh</div>
        </div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(w => {
            const ls = window.EBAY_LISTINGS_FOR(w).slice(0,3);
            const team = window.TEAMS[w.team] || { short: '???' };
            return (
              <div key={w.id} style={{
                background: '#111115', border: '1px solid #1f1f26',
                borderRadius: 12, padding: 12,
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 52, flexShrink: 0 }}>
                    <window.CardArt card={w} size="sm" scanned={true} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15, color: '#E8E8EF' }}>{w.player}</div>
                    <div style={{ fontSize: 10, color: '#6b6b78' }}>{team.short} · #{w.num} · target ${w.target}</div>
                  </div>
                </div>
                <div style={{
                  marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6,
                }}>
                  {ls.map((l, i) => (
                    <div key={i} style={{
                      background: '#0A0A0B',
                      border: `1px solid ${l.inRange ? 'rgba(255,71,19,0.4)' : '#1f1f26'}`,
                      borderRadius: 8, padding: '8px 9px',
                      display: 'flex', flexDirection: 'column', gap: 2,
                    }}>
                      <div style={{
                        fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700,
                        color: l.inRange ? accent : '#E8E8EF', lineHeight: 1,
                      }}>${l.price.toLocaleString()}</div>
                      <div style={{ fontSize: 9, color: '#9B9BA8', fontFamily: 'Barlow Condensed', letterSpacing: 1, fontWeight: 700 }}>
                        {l.type} · {l.cond}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <window.FixedBottomNav active="wants" />
    </div>
  );
}
