// CardDetailScreen.jsx — the "museum piece" view of a single card.
// Full-bleed card art at the top with gentle float/tilt,
// title block with player/set/parallel,
// key stats (value, last comp, population),
// ownership metadata (condition, acquired date/cost/source),
// price history sparkline,
// related copies (other parallels of same base card you own),
// action bar (share, sell on eBay, add to wants, mark sold).

function CardDetailScreen({ cardId, state = 'default', cards = window.CARDS }) {
  const card = cards.find(c => c.id === cardId) || cards[0];
  const team = window.TEAMS[card.team] || { p: '#333', s: '#000', short: '???' };
  const parallel = window.PARALLELS[card.parallel];

  // Sibling cards: same player, same number, different parallel copies in collection
  const siblings = cards.filter(c => c.player === card.player && c.num === card.num && c.id !== card.id);

  // Synthetic comp history
  const comps = window.COMPS_FOR(card);

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#0A0A0B', color: '#E8E8EF' }}>
      {/* Ambient team-color glow behind the hero */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 440,
        background: `radial-gradient(ellipse at 50% 0%, ${team.p}33 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 120 }}>
        {/* Top nav: close + meatball */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 16px 10px',
          background: 'linear-gradient(180deg, rgba(10,10,11,0.92) 60%, transparent 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          <button style={iconBtn}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#E8E8EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div style={{
            fontFamily: 'Inter', fontSize: 11, color: '#6b6b78',
            letterSpacing: 1, textTransform: 'uppercase',
          }}>Detail · #{card.num}</div>
          <button style={iconBtn}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#E8E8EF">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </button>
        </div>

        {/* HERO — full card art floating */}
        <div style={{
          padding: '16px 48px 32px',
          display: 'flex', justifyContent: 'center',
          perspective: '1000px',
        }}>
          <div style={{
            width: '100%',
            transform: state === 'flipped' ? 'rotateY(180deg)' : state === 'zoomed' ? 'scale(1.08)' : 'rotateY(-4deg) rotateX(2deg)',
            transformStyle: 'preserve-3d',
            transition: 'transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}>
            {state === 'flipped'
              ? <CardBack card={card} team={team} />
              : <window.CardArt card={card} size="lg" scanned={true} />
            }
          </div>
        </div>

        {/* TITLE BLOCK */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
          }}>
            <window.ParallelBadge parallelKey={card.parallel} size="sm" />
            {card.rookie && (
              <div style={{
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 11,
                color: '#FFD700', border: '1px solid #FFD700',
                padding: '2px 6px', borderRadius: 3, letterSpacing: 1.5,
              }}>ROOKIE</div>
            )}
            {card.serial && (
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                color: parallel.hex, letterSpacing: 0.3,
              }}>{card.serial}</div>
            )}
          </div>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 34,
            lineHeight: 1.02, letterSpacing: -0.5,
          }}>{card.player}</div>
          <div style={{
            fontSize: 13, color: '#9B9BA8', marginTop: 4,
          }}>{card.team} · {card.set} · #{card.num}</div>
        </div>

        {/* VALUE STRIP */}
        <ValueStrip card={card} state={state} />

        {/* TABS */}
        <div style={{
          display: 'flex', gap: 24, padding: '24px 20px 12px',
          borderBottom: '1px solid #1f1f26',
        }}>
          <TabLink active={state !== 'selling'}>Overview</TabLink>
          <TabLink>Comps</TabLink>
          <TabLink>History</TabLink>
        </div>

        {/* OWNERSHIP */}
        <Section title="Your copy">
          <KV k="Condition" v={<CondBadge cond={card.cond}/>} />
          <KV k="Acquired" v={formatDate(card.date)} />
          <KV k="Paid" v={`$${card.cost}`} />
          <KV k="Source" v={card.source || 'eBay auction'} />
          <KV k="Location" v="Binder · Page 3" />
        </Section>

        {/* PRICE HISTORY */}
        <Section title="Price history · 90 days">
          <PriceSparkline card={card} />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, color: '#6b6b78', marginTop: 6,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            <span>90d ago</span><span>45d</span><span>today</span>
          </div>
        </Section>

        {/* RECENT COMPS */}
        <Section title="Recent comps">
          {comps.map((c, i) => (
            <CompRow key={i} {...c} />
          ))}
          <button style={{
            marginTop: 8, background: 'none', border: '1px solid #1f1f26',
            color: '#9B9BA8', padding: '10px 14px', borderRadius: 8,
            fontFamily: 'Inter', fontSize: 12, fontWeight: 600,
            width: '100%', cursor: 'pointer',
          }}>See all 14 comps →</button>
        </Section>

        {/* RELATED COPIES — siblings */}
        {siblings.length > 0 && (
          <Section title={`Other ${card.player} #${card.num}`}>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
              {siblings.map(s => (
                <div key={s.id} style={{ minWidth: 100, flexShrink: 0 }}>
                  <window.CardArt card={s} size="sm" scanned={true} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* NOTES */}
        <Section title="Notes">
          <div style={{
            fontSize: 13, color: '#9B9BA8', lineHeight: 1.55,
            padding: '12px 14px', background: '#111115', borderRadius: 8,
            border: '1px solid #1f1f26',
          }}>
            {card.note || "Pulled live at the Chicago card show. Centered, sharp corners, great eye appeal."}
          </div>
        </Section>
      </div>

      {/* SELL-CONFIRM SHEET OVERLAY */}
      {state === 'selling' && <SellSheet card={card} />}

      {/* CHECK-EBAY SHEET OVERLAY — light list of live listings */}
      {state === 'checkingMarket' && <MarketSheet card={card} />}

      {/* FLIPPED STATE MESSAGE */}
      {state === 'flipped' && (
        <div style={{
          position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(10,10,11,0.85)', border: '1px solid #1f1f26',
          borderRadius: 9999, padding: '6px 12px', fontSize: 11, color: '#9B9BA8',
          letterSpacing: 0.5, zIndex: 5,
        }}>Back of card · tap to flip</div>
      )}

      {/* BOTTOM ACTION BAR */}
      {state !== 'selling' && state !== 'checkingMarket' && (
        <div style={{
          position: 'absolute', bottom: 82, left: 0, right: 0, zIndex: 30,
          background: 'linear-gradient(180deg, transparent 0%, rgba(10,10,11,0.92) 30%, rgba(10,10,11,0.98) 100%)',
          padding: '20px 16px 12px',
          display: 'flex', gap: 10,
        }}>
          <ActionBtn>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
            </svg>
            Share
          </ActionBtn>
          <ActionBtn>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
            Check eBay
          </ActionBtn>
          <ActionBtn primary>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12L12 20l-9-9V3h8l9 9z"/>
              <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/>
            </svg>
            Sell
          </ActionBtn>
        </div>
      )}
      <window.FixedBottomNav active="collection" />
    </div>
  );
}

// ---- helpers ----

const iconBtn = {
  width: 36, height: 36, borderRadius: 9999,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', padding: 0,
};

function TabLink({ children, active }) {
  return (
    <div style={{
      fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
      fontSize: 15, letterSpacing: 1, textTransform: 'uppercase',
      color: active ? '#E8E8EF' : '#6b6b78',
      paddingBottom: 10,
      borderBottom: active ? '2px solid #FF4713' : '2px solid transparent',
      marginBottom: -13,
      cursor: 'pointer',
    }}>{children}</div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ padding: '18px 20px 6px' }}>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
        fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
        color: '#6b6b78', marginBottom: 10,
      }}>{title}</div>
      {children}
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid #14141a',
      fontSize: 13,
    }}>
      <span style={{ color: '#9B9BA8' }}>{k}</span>
      <span style={{ color: '#E8E8EF', fontWeight: 500 }}>{v}</span>
    </div>
  );
}

function CondBadge({ cond }) {
  const map = { MT: ['Mint', '#2ECC71'], NM: ['Near Mint', '#F2C94C'], EX: ['Excellent', '#E67E22'] };
  const [label, color] = map[cond] || ['—', '#9B9BA8'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: 9999, background: color }}/>
      <span>{cond}</span>
      <span style={{ color: '#6b6b78' }}>· {label}</span>
    </span>
  );
}

function ValueStrip({ card, state }) {
  const base = card.cost;
  const mkt = Math.round(base * (card.serial ? 1.9 : 1.4));
  const delta = mkt - base;
  const pct = Math.round((delta / base) * 100);
  const trending = state === 'trending';
  return (
    <div style={{
      margin: '0 20px',
      background: '#111115', border: '1px solid #1f1f26',
      borderRadius: 12, padding: 16,
      display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr', gap: 12,
    }}>
      <Metric label="Market" value={`$${mkt.toLocaleString()}`} accent />
      <div style={{ background: '#1f1f26' }}/>
      <Metric label="P / L" value={<>
        <span style={{ color: delta >= 0 ? '#2ECC71' : '#E74C3C' }}>
          {delta >= 0 ? '+' : '−'}${Math.abs(delta).toLocaleString()}
        </span>
      </>} sub={`${pct >= 0 ? '+' : ''}${pct}%`} />
      <div style={{ background: '#1f1f26' }}/>
      <Metric label="Pop" value="142" sub={trending ? '▲ hot' : 'stable'} subColor={trending ? '#FF4713' : undefined} />
    </div>
  );
}

function Metric({ label, value, sub, subColor, accent }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10,
        letterSpacing: 2, textTransform: 'uppercase', color: '#6b6b78',
        fontWeight: 700, marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
        fontSize: 22, letterSpacing: -0.3, color: accent ? '#E8E8EF' : '#E8E8EF',
        lineHeight: 1,
      }}>{value}</div>
      {sub !== undefined && (
        <div style={{
          fontSize: 10, color: subColor || '#6b6b78', marginTop: 4,
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.3,
        }}>{sub}</div>
      )}
    </div>
  );
}

function PriceSparkline({ card }) {
  // Deterministic wavy line from card id
  const seed = card.id.charCodeAt(card.id.length-1);
  const pts = [];
  const base = card.cost * 1.4;
  const w = 350, h = 90;
  for (let i = 0; i <= 30; i++) {
    const v = base * (0.75 + 0.5 * Math.sin(i * 0.4 + seed) * Math.cos(i * 0.11 + seed/3)) + (i * base * 0.02);
    pts.push([i * (w/30), h - ((v / (base*1.5)) * h)]);
  }
  const path = pts.map((p,i) => `${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = path + ` L${w},${h} L0,${h} Z`;
  return (
    <div style={{
      padding: 14, background: '#111115', border: '1px solid #1f1f26',
      borderRadius: 10,
    }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 90 }}>
        <defs>
          <linearGradient id={`grd-${card.id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FF4713" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#FF4713" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grd-${card.id})`} />
        <path d={path} fill="none" stroke="#FF4713" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="4" fill="#FF4713" stroke="#0A0A0B" strokeWidth="2"/>
      </svg>
    </div>
  );
}

function CompRow({ cond, price, date, source }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 12px', background: '#111115',
      border: '1px solid #1f1f26', borderRadius: 8, marginBottom: 6,
    }}>
      <div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#E8E8EF', fontWeight: 600 }}>
          ${price.toLocaleString()}
        </div>
        <div style={{ fontSize: 11, color: '#6b6b78', marginTop: 2 }}>
          {source} · {date}
        </div>
      </div>
      <CondBadge cond={cond} />
    </div>
  );
}

function CardBack({ card, team }) {
  return (
    <div style={{
      width: '100%', aspectRatio: '5/7', borderRadius: 6,
      background: `linear-gradient(160deg, ${team.s} 0%, #0A0A0B 100%)`,
      border: '2px solid #1a1a1a',
      boxShadow: '0 10px 22px rgba(0,0,0,0.55)',
      padding: '24px 22px',
      color: '#E8E8EF', fontFamily: 'Inter',
      transform: 'rotateY(180deg)',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
        fontSize: 22, letterSpacing: -0.3,
      }}>{card.player}</div>
      <div style={{ fontSize: 11, color: '#9B9BA8', lineHeight: 1.5 }}>
        Drafted 1st overall in the 2024 WNBA Draft. Unanimous Rookie of the Year. Broke the single-season assist record as a rookie. Led the Fever to the playoffs for the first time since 2016.
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        marginTop: 'auto',
      }}>
        {[['PPG','19.2'],['APG','8.4'],['RPG','5.7'],['3P%','34.4']].map(([k,v]) => (
          <div key={k} style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 6px', borderRadius: 4, textAlign: 'center' }}>
            <div style={{ color: '#6b6b78', fontSize: 9, marginBottom: 2 }}>{k}</div>
            <div style={{ color: '#E8E8EF', fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionBtn({ children, primary }) {
  return (
    <button style={{
      flex: primary ? 2 : 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '14px 16px', borderRadius: 12,
      background: primary ? '#FF4713' : 'rgba(255,255,255,0.06)',
      color: primary ? '#fff' : '#E8E8EF',
      border: primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
      fontFamily: 'Inter', fontSize: 14, fontWeight: 600, letterSpacing: 0.2,
      cursor: 'pointer',
      boxShadow: primary ? '0 4px 14px rgba(255,71,19,0.4)' : 'none',
    }}>{children}</button>
  );
}

function SellSheet({ card }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, top: '45%',
      background: '#111115', borderTop: '1px solid #2a2a33',
      borderRadius: '20px 20px 0 0', padding: '16px 20px 100px',
      zIndex: 50, overflowY: 'auto',
      boxShadow: '0 -20px 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        width: 40, height: 4, background: '#2a2a33', borderRadius: 9999,
        margin: '0 auto 18px',
      }}/>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
        fontSize: 22, marginBottom: 6,
      }}>List on eBay</div>
      <div style={{ fontSize: 12, color: '#9B9BA8', marginBottom: 18 }}>
        We'll pre-fill the listing with scan + comps data.
      </div>
      {[
        ['Suggested BIN', '$' + Math.round(card.cost * 2.1).toLocaleString(), 'Based on last 14 comps'],
        ['Auction start', '$' + Math.round(card.cost * 1.2).toLocaleString(), '7-day, no reserve'],
        ['Condition claim', card.cond + ' (Near Mint)', 'From your notes'],
      ].map(([k, v, sub]) => (
        <div key={k} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 0', borderBottom: '1px solid #1f1f26',
        }}>
          <div>
            <div style={{ fontSize: 13, color: '#E8E8EF', fontWeight: 500 }}>{k}</div>
            <div style={{ fontSize: 11, color: '#6b6b78', marginTop: 3 }}>{sub}</div>
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 14,
            color: '#E8E8EF', fontWeight: 600,
          }}>{v}</div>
        </div>
      ))}
      <button style={{
        width: '100%', marginTop: 24, padding: '16px',
        background: '#FF4713', color: '#fff', border: 'none',
        borderRadius: 12, fontFamily: 'Inter', fontSize: 15, fontWeight: 700,
        cursor: 'pointer',
      }}>Review & publish →</button>
    </div>
  );
}

// Lightweight eBay listings sheet — fetch-live market, tap-out to eBay
function MarketSheet({ card }) {
  const team = window.TEAMS[card.team] || {};
  const base = Math.round(card.cost * 1.4);
  const listings = [
    { price: Math.round(base*0.94), type: 'BIN',     cond: 'NM',    seller: 'topdeckcards',   rating: 4.98, ends: null,     bids: null, best: true  },
    { price: Math.round(base*1.08), type: 'BIN',     cond: 'MT 9',  seller: 'wnbahoops',      rating: 4.92, ends: null,     bids: null              },
    { price: Math.round(base*0.78), type: 'AUCTION', cond: 'NM',    seller: 'thundertrades',  rating: 4.98, ends: '4h 12m', bids: 11                },
    { price: Math.round(base*1.22), type: 'BIN',     cond: 'GEM 10',seller: 'pristine_pc',    rating: 5.00, ends: null,     bids: null              },
    { price: Math.round(base*0.86), type: 'AUCTION', cond: 'EX',    seller: 'cardboard.co',   rating: 4.81, ends: '1d 6h',  bids: 4                 },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, top: '30%',
      background: '#111115', borderTop: '1px solid #2a2a33',
      borderRadius: '20px 20px 0 0',
      zIndex: 50, display: 'flex', flexDirection: 'column',
      boxShadow: '0 -20px 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{ padding: '12px 20px 6px' }}>
        <div style={{
          width: 40, height: 4, background: '#2a2a33', borderRadius: 9999,
          margin: '0 auto 14px',
        }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
              fontSize: 22, letterSpacing: -0.3, lineHeight: 1,
            }}>Live on eBay</div>
            <div style={{ fontSize: 11, color: '#9B9BA8', marginTop: 4 }}>
              {listings.length} listings · synced just now
            </div>
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            color: '#2ECC71', padding: '3px 7px',
            background: 'rgba(46,204,113,0.12)', borderRadius: 4,
            border: '1px solid rgba(46,204,113,0.3)', fontWeight: 600,
          }}>● LIVE</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {listings.map((l, i) => (
          <div key={i} style={{
            background: '#0A0A0B',
            border: `1px solid ${l.best ? 'rgba(46,204,113,0.4)' : '#1f1f26'}`,
            borderRadius: 10, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700,
              color: '#E8E8EF', width: 70, flexShrink: 0,
            }}>${l.price.toLocaleString()}</div>
            <div style={{
              fontSize: 9, color: '#FFD700', fontWeight: 700,
              padding: '2px 5px', background: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.3)', borderRadius: 3,
              letterSpacing: 1, flexShrink: 0, whiteSpace: 'nowrap',
            }}>{l.cond}</div>
            <div style={{
              fontSize: 9, color: l.type === 'AUCTION' ? '#E74C3C' : '#9B9BA8',
              fontWeight: 700, letterSpacing: 1, flexShrink: 0,
              fontFamily: 'Barlow Condensed, sans-serif',
            }}>{l.type}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11, color: '#E8E8EF',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{l.seller}</div>
              <div style={{ fontSize: 10, color: '#6b6b78', marginTop: 1, fontFamily: 'JetBrains Mono' }}>
                ★ {l.rating}{l.ends ? ` · ${l.ends} · ${l.bids} bids` : ''}
              </div>
            </div>
            {l.best && (
              <span style={{
                fontSize: 9, color: '#2ECC71', fontWeight: 700,
                letterSpacing: 1, textTransform: 'uppercase',
                padding: '2px 6px', background: 'rgba(46,204,113,0.12)',
                border: '1px solid rgba(46,204,113,0.35)', borderRadius: 9999,
                fontFamily: 'Barlow Condensed',
              }}>Best</span>
            )}
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#6b6b78" strokeWidth="2" strokeLinecap="round">
              <path d="M7 17L17 7M9 7h8v8"/>
            </svg>
          </div>
        ))}
      </div>

      <div style={{
        padding: '10px 16px 16px', borderTop: '1px solid #1f1f26',
        display: 'flex', gap: 8,
      }}>
        <button style={{
          flex: 1, padding: '12px', background: 'transparent', color: '#E8E8EF',
          border: '1px solid #2a2a33', borderRadius: 10,
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>30-day sold comps</button>
        <button style={{
          flex: 1, padding: '12px', background: '#FF4713', color: '#fff',
          border: 'none', borderRadius: 10,
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          letterSpacing: 0.3,
        }}>Open on eBay ↗</button>
      </div>
    </div>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// synthetic comps generator
window.COMPS_FOR = function(card) {
  const base = card.cost * 1.4;
  const seed = card.id.charCodeAt(card.id.length-1);
  return [
    { cond: 'MT',   price: Math.round(base * 1.12), date: '3d ago', source: 'eBay' },
    { cond: 'NM',   price: Math.round(base * 0.96), date: '6d ago', source: 'eBay' },
    { cond: 'NM',   price: Math.round(base * 0.91), date: '11d ago', source: 'PWCC' },
    { cond: 'EX',   price: Math.round(base * 0.72), date: '18d ago', source: 'eBay' },
  ];
};

Object.assign(window, { CardDetailScreen });
