// GoalsScreen.jsx — long-form collection chases.
//
// Mental model: a progress wall. Each goal is a chase (rainbow run of one card,
// a full team set, a player PC, a rookie class). Goals have visual progress —
// not just a %. Rainbow chases lay out every parallel as a color swatch that
// fills in when owned. Team sets and PCs use count meters.
//
// Why: tracking "I own 4 of 11 Caitlin parallels" on a spreadsheet is misery.
// Visual slots with the actual parallel color scratches the chase itch the way
// an album with holes does.

function GoalsScreen({ state = 'default' }) {
  const accent = '#FF4713';

  if (state === 'detail')       return <GoalDetail />;
  if (state === 'detailSheet')  return <GoalDetailWithSheet />;
  if (state === 'setBuild')     return <SetBuildDetail />;
  if (state === 'celebrate')    return <GoalCelebrate />;
  if (state === 'create')       return <GoalCreate />;

  // Default: overview of all goals
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#0A0A0B', color: '#E8E8EF' }}>
      <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 110 }}>

        {/* Header */}
        <div style={{ padding: '18px 20px 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
                fontSize: 30, letterSpacing: -0.3, lineHeight: 1,
              }}>Goals</div>
              <div style={{ fontSize: 13, color: '#9B9BA8', marginTop: 4 }}>
                4 chases active · 1 completed
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

        {/* Big featured goal — Caitlin rainbow */}
        <div style={{ padding: '16px 16px 0' }}>
          <FeaturedRainbow />
        </div>

        {/* Goal list */}
        <div style={{ padding: '18px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionLabel>In progress</SectionLabel>

          <GoalCard
            type="teamSet"
            title="2024 Indiana Fever"
            subtitle="Base team set · #1–#12"
            owned={8} total={12}
            tint="#FFC633"
          />

          <GoalCard
            type="playerPC"
            title="Cameron Brink PC"
            subtitle="All cards, all parallels"
            owned={3} total={14}
            tint="#552583"
          />

          <GoalCard
            type="completeSet"
            title="2024 Prizm · Base Set"
            subtitle="Full base · #1–#100"
            owned={62} total={100}
            tint="#E74C3C"
          />

          <GoalCard
            type="completeSet"
            title="'24 Prizm · Dawn of a New Era"
            subtitle="Insert set · 10 cards"
            owned={4} total={10}
            tint="#F39C12"
          />

          <GoalCard
            type="rookieClass"
            title="2024 Rookie Class"
            subtitle="Top 10 prospects' RCs"
            owned={6} total={10}
            tint="#FF4713"
          />

          <SectionLabel>Completed</SectionLabel>
          <GoalCard
            type="teamSet"
            title="2024 Sparks Silver Run"
            subtitle="All Sparks silvers · #3, #7, #11"
            owned={3} total={3}
            tint="#FDB927"
            done={true}
          />
        </div>

        <div style={{ height: 24 }}/>
      </div>
      <window.FixedBottomNav active="goals" />
    </div>
  );
}

/* ───── Featured rainbow chase (big tile) ───── */
function FeaturedRainbow() {
  // The Caitlin '24 Prizm rainbow — 11 parallels.
  const ORDER = ['base','silver','blueIce','redIce','neonPulse','tigerStripe','pulsar','mojo','gold','goldVinyl','oneOfOne'];
  // Which parallels the collector owns (pulled from the fixture for narrative fidelity)
  const owned = new Set(['silver','redIce','oneOfOne']);
  const total = ORDER.length;
  const count = owned.size;
  const pct = Math.round((count/total)*100);

  return (
    <div style={{
      position: 'relative',
      borderRadius: 16, overflow: 'hidden',
      background: 'linear-gradient(155deg, #1a0a06 0%, #0A0A0B 65%)',
      border: '1px solid rgba(255,71,19,0.3)',
      padding: 16,
    }}>
      {/* Ambient rainbow glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.28,
        background: 'radial-gradient(circle at 80% 0%, #FFD700 0%, transparent 40%), radial-gradient(circle at 20% 100%, #9B59B6 0%, transparent 45%)',
      }}/>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{
              fontSize: 10, letterSpacing: 2, fontWeight: 700, color: '#FFD700',
              fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase',
            }}>★ Rainbow Chase</div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
              fontSize: 24, letterSpacing: -0.2, marginTop: 2,
            }}>Caitlin Clark '24</div>
            <div style={{ fontSize: 11, color: '#9B9BA8', marginTop: 2 }}>
              2024 Prizm · every parallel
            </div>
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 28, fontWeight: 700, color: '#fff',
            lineHeight: 1, letterSpacing: -0.5,
          }}>
            {count}<span style={{ color: '#6b6b78', fontSize: 16 }}>/{total}</span>
          </div>
        </div>

        {/* Parallel slots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 4, marginTop: 14 }}>
          {ORDER.map(k => {
            const p = window.PARALLELS[k];
            const got = owned.has(k);
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
                }} className={isOOO && got ? 'rainbow-border' : ''}/>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 4, marginTop: 4 }}>
          {ORDER.map(k => {
            const got = owned.has(k);
            return (
              <div key={k} style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 7,
                color: got ? '#E8E8EF' : '#3a3a45',
                textAlign: 'center', lineHeight: 1,
                letterSpacing: 0.5, textTransform: 'uppercase',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{window.PARALLELS[k].run || '∞'}</div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, height: 4, background: '#1f1f26', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: pct + '%',
              background: 'linear-gradient(90deg, #FF4713, #FFD700)',
              borderRadius: 9999,
            }}/>
          </div>
          <div style={{ fontSize: 11, color: '#9B9BA8', fontFamily: 'JetBrains Mono' }}>{pct}%</div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button style={{
            flex: 1, padding: '10px 14px', background: 'rgba(255,71,19,0.9)', color: '#fff',
            border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            letterSpacing: 0.3,
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

/* ───── Generic goal row ───── */
function GoalCard({ type, title, subtitle, owned, total, tint, done }) {
  const pct = Math.round((owned/total)*100);
  const glyph = { teamSet: '⬡', playerPC: '◉', rookieClass: '✦', rainbow: '❏', completeSet: '▦' }[type] || '●';

  return (
    <div style={{
      background: '#111115',
      border: `1px solid ${done ? 'rgba(46,204,113,0.35)' : '#1f1f26'}`,
      borderRadius: 12, padding: 14,
      display: 'flex', gap: 14, alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* tint accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        background: done ? '#2ECC71' : tint,
      }}/>

      {/* Progress ring */}
      <div style={{ width: 54, height: 54, flexShrink: 0, position: 'relative' }}>
        <svg viewBox="0 0 54 54" width="54" height="54">
          <circle cx="27" cy="27" r="23" fill="none" stroke="#1f1f26" strokeWidth="4"/>
          <circle
            cx="27" cy="27" r="23" fill="none"
            stroke={done ? '#2ECC71' : tint} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 23}
            strokeDashoffset={2 * Math.PI * 23 * (1 - pct/100)}
            transform="rotate(-90 27 27)"
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700,
          color: done ? '#2ECC71' : '#E8E8EF',
        }}>{done ? '✓' : pct+'%'}</div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 10, color: tint }}>{glyph}</span>
          <span style={{
            fontSize: 9, letterSpacing: 1.5, fontWeight: 700,
            color: '#6b6b78', textTransform: 'uppercase',
            fontFamily: 'Barlow Condensed, sans-serif',
          }}>
            {type === 'teamSet' ? 'Team set' : type === 'playerPC' ? 'Player PC' : type === 'rookieClass' ? 'Rookie class' : type === 'completeSet' ? 'Set build' : 'Rainbow'}
          </span>
        </div>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
          fontSize: 17, letterSpacing: 0.1, lineHeight: 1.1,
          color: '#E8E8EF',
        }}>{title}</div>
        <div style={{ fontSize: 11, color: '#9B9BA8', marginTop: 2 }}>{subtitle}</div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 17, fontWeight: 700,
          color: '#E8E8EF', lineHeight: 1,
        }}>
          {owned}<span style={{ color: '#6b6b78', fontSize: 12 }}>/{total}</span>
        </div>
        <div style={{ fontSize: 10, color: '#6b6b78', marginTop: 3, letterSpacing: 0.3 }}>
          {done ? 'complete' : `${total-owned} to go`}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
      fontSize: 11, letterSpacing: 2.5, color: '#6b6b78',
      textTransform: 'uppercase', marginTop: 6, marginBottom: -2,
    }}>{children}</div>
  );
}

/* ───── Goal detail — full parallel breakdown ───── */
function GoalDetail() {
  const ORDER = ['base','silver','blueIce','redIce','neonPulse','tigerStripe','pulsar','mojo','gold','goldVinyl','oneOfOne'];
  const OWNED = { silver: 'c01', redIce: 'c03', oneOfOne: 'c02' };
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#0A0A0B', color: '#E8E8EF' }}>
      <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 110 }}>

        {/* Header */}
        <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{
            width: 32, height: 32, borderRadius: 9999,
            background: 'rgba(255,255,255,0.06)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#E8E8EF" strokeWidth="2.2" strokeLinecap="round">
              <path d="M15 6l-6 6 6 6"/>
            </svg>
          </button>
          <div style={{ fontSize: 10, color: '#6b6b78', letterSpacing: 2, fontFamily: 'Barlow Condensed', fontWeight: 700 }}>RAINBOW CHASE</div>
        </div>

        {/* Title block */}
        <div style={{ padding: '4px 20px 14px' }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
            fontSize: 34, letterSpacing: -0.5, lineHeight: 1,
          }}>Caitlin Clark '24</div>
          <div style={{ fontSize: 12, color: '#9B9BA8', marginTop: 4 }}>
            2024 Prizm · Indiana Fever · #1
          </div>
        </div>

        {/* Stat grid */}
        <div style={{ padding: '0 16px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <StatCell label="Owned" value="3" tone="#FF4713"/>
          <StatCell label="To go" value="8" tone="#E8E8EF"/>
          <StatCell label="Spent" value="$5,300" tone="#E8E8EF" mono/>
        </div>

        {/* Parallel checklist */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ORDER.map(k => {
            const p = window.PARALLELS[k];
            const got = OWNED[k];
            return <ParallelRow key={k} pKey={k} p={p} owned={got} />;
          })}
        </div>

        <div style={{ height: 24 }}/>
      </div>
      <window.FixedBottomNav active="goals" />
    </div>
  );
}

function StatCell({ label, value, tone, mono }) {
  return (
    <div style={{
      background: '#111115', border: '1px solid #1f1f26', borderRadius: 10,
      padding: '10px 12px',
    }}>
      <div style={{ fontSize: 9, color: '#6b6b78', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{
        fontFamily: mono ? 'JetBrains Mono, monospace' : 'Barlow Condensed, sans-serif',
        fontWeight: mono ? 600 : 800, fontSize: mono ? 17 : 22,
        color: tone, marginTop: 3, lineHeight: 1,
      }}>{value}</div>
    </div>
  );
}

function ParallelRow({ pKey, p, owned }) {
  const isOOO = pKey === 'oneOfOne';
  const isMojo = pKey === 'mojo';
  const bg = isOOO
    ? 'linear-gradient(135deg, #FF4713, #FFD700, #00C9A7, #9B59B6)'
    : isMojo
    ? 'linear-gradient(135deg, #2C65D4, #9B59B6, #E74C3C)'
    : p.hex;
  const marketPrice = {
    base: 18, silver: 120, blueIce: 180, redIce: 380, neonPulse: 165,
    tigerStripe: 340, pulsar: 420, mojo: 680, gold: 2100, goldVinyl: 4500, oneOfOne: 12000,
  }[pKey];

  return (
    <div style={{
      background: owned ? 'rgba(255,71,19,0.06)' : '#111115',
      border: `1px solid ${owned ? 'rgba(255,71,19,0.35)' : '#1f1f26'}`,
      borderRadius: 10, padding: 10,
      display: 'flex', gap: 12, alignItems: 'center',
    }}>
      <div style={{
        width: 32, height: 44, borderRadius: 4,
        background: owned ? bg : 'transparent',
        border: owned ? 'none' : '1.5px dashed #2a2a33',
        boxShadow: owned ? `0 0 10px ${isOOO ? '#FFD700' : p.hex}66` : 'none',
        flexShrink: 0,
      }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: owned ? '#E8E8EF' : '#9B9BA8',
        }}>{p.name}</div>
        <div style={{ fontSize: 11, color: '#6b6b78', marginTop: 2, fontFamily: 'JetBrains Mono' }}>
          {p.run ? `/${p.run}` : '∞'} · market ${marketPrice.toLocaleString()}
        </div>
      </div>
      {owned ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 10, color: '#FF4713', fontWeight: 700,
          letterSpacing: 1, textTransform: 'uppercase',
          fontFamily: 'Barlow Condensed, sans-serif',
        }}>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#FF4713" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7"/>
          </svg>
          Owned
        </div>
      ) : (
        <button style={{
          padding: '6px 10px', background: 'transparent',
          color: '#E8E8EF', border: '1px solid #2a2a33',
          borderRadius: 9999, fontSize: 10, fontWeight: 700, cursor: 'pointer',
          letterSpacing: 0.5, textTransform: 'uppercase',
        }}>Add to wants</button>
      )}
    </div>
  );
}

/* ───── Goal completed celebration ───── */
function GoalCelebrate() {
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#0A0A0B', color: '#E8E8EF' }}>
      {/* confetti-ish sparkle field */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(255,215,0,0.22), transparent 40%), radial-gradient(circle at 70% 80%, rgba(255,71,19,0.25), transparent 40%)',
      }}/>
      {/* diagonal rays */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.12,
        background: 'repeating-linear-gradient(35deg, transparent 0 40px, rgba(255,215,0,0.3) 40px 42px)',
      }}/>

      <div style={{
        position: 'relative', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 32px', paddingBottom: 100, textAlign: 'center',
      }}>
        <div style={{
          fontSize: 11, letterSpacing: 4, color: '#FFD700', fontWeight: 700,
          fontFamily: 'Barlow Condensed, sans-serif', marginBottom: 6,
        }}>★ CHASE COMPLETE ★</div>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
          fontSize: 48, lineHeight: 0.95, letterSpacing: -1,
          background: 'linear-gradient(90deg, #FFD700, #FF4713)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 6,
        }}>RAINBOW<br/>COMPLETE</div>
        <div style={{ fontSize: 13, color: '#9B9BA8', marginTop: 4, maxWidth: 280, lineHeight: 1.5 }}>
          All 11 parallels of <b style={{ color: '#E8E8EF' }}>Caitlin Clark '24 Prizm #1</b> collected.
        </div>

        {/* 11 parallel swatches */}
        <div style={{
          marginTop: 24, display: 'grid',
          gridTemplateColumns: 'repeat(11, 1fr)', gap: 3, width: '100%',
        }}>
          {['base','silver','blueIce','redIce','neonPulse','tigerStripe','pulsar','mojo','gold','goldVinyl','oneOfOne'].map(k => {
            const isOOO = k === 'oneOfOne', isMojo = k === 'mojo';
            const bg = isOOO
              ? 'linear-gradient(135deg, #FF4713, #FFD700, #00C9A7, #9B59B6)'
              : isMojo
              ? 'linear-gradient(135deg, #2C65D4, #9B59B6, #E74C3C)'
              : window.PARALLELS[k].hex;
            return <div key={k} style={{
              aspectRatio: '5/7', borderRadius: 2, background: bg,
              boxShadow: `0 0 6px ${window.PARALLELS[k].hex}88`,
            }}/>;
          })}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 24, marginTop: 26, alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 22, color: '#E8E8EF', lineHeight: 1 }}>11/11</div>
            <div style={{ fontSize: 9, color: '#6b6b78', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>Parallels</div>
          </div>
          <div style={{ width: 1, height: 24, background: '#2a2a33' }}/>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 22, color: '#E8E8EF', lineHeight: 1 }}>287d</div>
            <div style={{ fontSize: 9, color: '#6b6b78', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>Chase time</div>
          </div>
          <div style={{ width: 1, height: 24, background: '#2a2a33' }}/>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 22, color: '#FFD700', lineHeight: 1 }}>$8.5k</div>
            <div style={{ fontSize: 9, color: '#6b6b78', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>Invested</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 28, width: '100%' }}>
          <button style={{
            flex: 1, padding: '14px', background: '#FF4713', color: '#fff',
            border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', letterSpacing: 0.3,
            boxShadow: '0 4px 14px rgba(255,71,19,0.4)',
          }}>Share the rainbow</button>
          <button style={{
            padding: '14px 16px', background: 'transparent', color: '#E8E8EF',
            border: '1px solid #2a2a33', borderRadius: 12, fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}>Next chase →</button>
        </div>
      </div>
      <window.FixedBottomNav active="goals" />
    </div>
  );
}

/* ───── Create a new goal ───── */
function GoalCreate() {
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#0A0A0B', color: '#E8E8EF' }}>
      <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 110 }}>
        <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{
            width: 32, height: 32, borderRadius: 9999,
            background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#E8E8EF" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 20 }}>New Goal</div>
        </div>

        <div style={{ padding: '4px 20px 10px' }}>
          <div style={{ fontSize: 13, color: '#9B9BA8', lineHeight: 1.5 }}>
            Pick a chase type. We'll auto-generate the checklist.
          </div>
        </div>

        <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <GoalTypeCard
            glyph="❏" tint="#FFD700"
            title="Rainbow chase"
            desc="Collect every parallel of one card (#1 Caitlin Clark '24)"
            active={true}
          />
          <GoalTypeCard
            glyph="▦" tint="#E74C3C"
            title="Complete a set"
            desc="Every card in a base set or insert set (2024 Prizm base · 1–100)"
          />
          <GoalTypeCard
            glyph="⬡" tint="#4A9EE8"
            title="Team set"
            desc="Every base card for a team (2024 Indiana Fever)"
          />
          <GoalTypeCard
            glyph="◉" tint="#552583"
            title="Player PC"
            desc="Every card of one player across sets and years"
          />
          <GoalTypeCard
            glyph="✦" tint="#FF4713"
            title="Rookie class"
            desc="First-year cards of a draft class (2024 Top 10)"
          />
          <GoalTypeCard
            glyph="◆" tint="#2ECC71"
            title="Custom"
            desc="Hand-pick any cards. Useful for trade-up goals."
          />
        </div>

        {/* Picker preview */}
        <div style={{ padding: '18px 16px 0' }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
            fontSize: 11, letterSpacing: 2, color: '#6b6b78',
            textTransform: 'uppercase', marginBottom: 8,
          }}>Pick the card</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#1F1F23', border: '1px solid #2A2A2F',
            borderRadius: 10, padding: '12px 14px',
          }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9B9BA8" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
            <div style={{ fontSize: 14, color: '#6b6b78', flex: 1 }}>Search player or card #</div>
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 82,
        padding: 16, borderTop: '1px solid #1f1f26', background: '#0A0A0B',
      }}>
        <button disabled style={{
          width: '100%', padding: 14, background: 'rgba(255,71,19,0.35)', color: '#fff',
          border: 'none', borderRadius: 12, fontFamily: 'Inter', fontSize: 14, fontWeight: 700,
          cursor: 'not-allowed', opacity: 0.6,
        }}>Select a card to continue</button>
      </div>
      <window.FixedBottomNav active="goals" />
    </div>
  );
}

function GoalTypeCard({ glyph, tint, title, desc, active }) {
  return (
    <div style={{
      background: active ? 'rgba(255,71,19,0.06)' : '#111115',
      border: `1px solid ${active ? 'rgba(255,71,19,0.45)' : '#1f1f26'}`,
      borderRadius: 12, padding: 14,
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: `${tint}1f`, border: `1px solid ${tint}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: tint, fontSize: 18, flexShrink: 0,
      }}>{glyph}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
          fontSize: 16, color: '#E8E8EF', lineHeight: 1.1,
        }}>{title}</div>
        <div style={{ fontSize: 11, color: '#9B9BA8', marginTop: 3, lineHeight: 1.4 }}>{desc}</div>
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: 9999,
        border: active ? 'none' : '1.5px solid #3a3a45',
        background: active ? '#FF4713' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 4,
      }}>
        {active && (
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7"/>
          </svg>
        )}
      </div>
    </div>
  );
}

function GoalDetailWithSheet() {
  const listings = [
    { price: 380, type: 'BIN', cond: 'NM', seller: 'topdeckcards', rating: 4.98, ends: null, bids: null, inRange: true, best: true },
    { price: 420, type: 'AUCTION', cond: 'MT', seller: 'thundertrades', rating: 4.98, ends: '4h 12m', bids: 11, inRange: false },
    { price: 540, type: 'BIN', cond: 'GEM 10', seller: 'pristine_pc', rating: 5.00, ends: null, bids: null, inRange: false },
    { price: 340, type: 'AUCTION', cond: 'EX', seller: 'cardboard.co', rating: 4.81, ends: '1d 6h', bids: 4, inRange: true },
  ];
  return (
    <>
      <GoalDetail />
      <window.EbayListingsSheet
        title="Red Ice /99"
        subtitle="Caitlin Clark '24 #1 · rainbow slot 4/11"
        target={400}
        listings={listings}
      />
    </>
  );
}

Object.assign(window, { GoalsScreen });

/* ───── Set build detail (new goal type) ───── */
function SetBuildDetail() {
  // 2024 Prizm Base Set, #1–100. 62 owned, 38 missing.
  // Real set-building UX: a grid of every card number, lit/dimmed by ownership.
  const TOTAL = 100;
  // Seeded "owned" pattern — 62 cards, visually scattered
  const owned = new Set();
  let seed = 7;
  while (owned.size < 62) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    owned.add(1 + (seed % TOTAL));
  }

  const accent = '#E74C3C';
  const tabActive = { active: { color: '#E8E8EF', borderColor: accent }, dim: { color: '#6b6b78', borderColor: 'transparent' } };

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#0A0A0B', color: '#E8E8EF' }}>
      <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 120 }}>
        {/* Top bar */}
        <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{
            width: 32, height: 32, borderRadius: 9999,
            background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#E8E8EF" strokeWidth="2.2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <div style={{ fontSize: 10, color: '#6b6b78', letterSpacing: 2, fontFamily: 'Barlow Condensed', fontWeight: 700 }}>SET BUILD</div>
        </div>

        {/* Header */}
        <div style={{ padding: '4px 20px 12px' }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
            fontSize: 26, letterSpacing: -0.2, lineHeight: 1.05,
          }}>2024 Prizm · Base Set</div>
          <div style={{ fontSize: 12, color: '#9B9BA8', marginTop: 4 }}>#1–100 · base paper</div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 14 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>
              62<span style={{ color: '#6b6b78', fontSize: 20 }}>/100</span>
            </div>
            <div style={{ fontSize: 11, color: accent, fontFamily: 'Barlow Condensed', fontWeight: 700, letterSpacing: 1 }}>62% COMPLETE</div>
          </div>

          <div style={{
            marginTop: 10, height: 5, borderRadius: 9999,
            background: '#1f1f26', overflow: 'hidden',
          }}>
            <div style={{ height: '100%', width: '62%', background: accent, borderRadius: 9999, boxShadow: `0 0 10px ${accent}66` }}/>
          </div>
        </div>

        {/* Tabs: all / missing / duplicates */}
        <div style={{
          display: 'flex', gap: 20, padding: '4px 20px',
          borderBottom: '1px solid #1f1f26',
        }}>
          {[
            { label: 'All 100', active: true },
            { label: 'Missing 38', active: false },
            { label: 'Duplicates 7', active: false },
          ].map((t, i) => (
            <div key={i} style={{
              padding: '10px 0',
              fontSize: 12, fontWeight: 600,
              borderBottom: `2px solid ${t.active ? accent : 'transparent'}`,
              color: t.active ? '#E8E8EF' : '#6b6b78',
              fontFamily: 'Barlow Condensed', letterSpacing: 0.5,
            }}>{t.label}</div>
          ))}
        </div>

        {/* Card-number grid */}
        <div style={{ padding: '14px 14px 0' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4,
          }}>
            {Array.from({ length: TOTAL }, (_, i) => {
              const n = i + 1;
              const got = owned.has(n);
              return (
                <div key={n} style={{
                  aspectRatio: '5/7',
                  borderRadius: 3,
                  background: got ? '#1a1a20' : 'transparent',
                  border: got ? '1px solid #2a2a33' : '1px dashed #1f1f26',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {got && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(135deg, rgba(231,76,60,0.18), transparent 60%)',
                    }}/>
                  )}
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 9, fontWeight: 600,
                    color: got ? '#E8E8EF' : '#3a3a44',
                    position: 'relative',
                  }}>{n}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next up / missing block highlights */}
        <div style={{ padding: '20px 16px 0' }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
            fontSize: 11, letterSpacing: 2, color: '#6b6b78',
            textTransform: 'uppercase', marginBottom: 10,
          }}>Cheapest missing</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { num: 14, player: 'Kamilla Cardoso', price: 4 },
              { num: 27, player: 'Nika Mühl', price: 4 },
              { num: 41, player: 'Dyaisha Fair', price: 5 },
              { num: 58, player: 'Leïla Lacan', price: 5 },
            ].map((c, i) => (
              <div key={i} style={{
                background: '#111115', border: '1px solid #1f1f26',
                borderRadius: 10, padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 32, textAlign: 'center',
                  fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                  fontSize: 13, color: '#6b6b78',
                }}>#{c.num}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#E8E8EF', fontWeight: 500 }}>{c.player}</div>
                  <div style={{ fontSize: 10, color: '#6b6b78', marginTop: 1, fontFamily: 'JetBrains Mono' }}>Last checked 3h ago</div>
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700,
                  color: accent,
                }}>${c.price}</div>
                <button style={{
                  background: 'transparent', color: '#E8E8EF',
                  border: '1px solid #2a2a33', borderRadius: 8,
                  padding: '6px 10px', fontSize: 10, fontWeight: 700,
                  letterSpacing: 1, fontFamily: 'Barlow Condensed',
                  textTransform: 'uppercase', cursor: 'pointer',
                }}>+ Want</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '18px 16px 0', fontSize: 11, color: '#6b6b78', lineHeight: 1.5 }}>
          Set-build math: ${4+4+5+5}+ to finish bottom 4 · avg missing card ${"~"}$7 · total to complete ~${Math.round(38*7)}
        </div>
      </div>
      <window.FixedBottomNav active="goals" />
    </div>
  );
}

function GoalWithSheet() {
  // Open sheet showing eBay listings for a missing parallel — Caitlin Blue Ice
  const fakeWant = { market: 180, target: 200 };
  const listings = window.EBAY_LISTINGS_FOR ? window.EBAY_LISTINGS_FOR(fakeWant) : [];
  return (
    <>
      <GoalsScreen state="detail" />
      {window.EbayListingsSheet && (
        <window.EbayListingsSheet
          title="Caitlin Clark · Blue Ice"
          subtitle={`${listings.length} listings · 2024 Prizm #1 · /49`}
          target={200}
          listings={listings}
        />
      )}
    </>
  );
}
