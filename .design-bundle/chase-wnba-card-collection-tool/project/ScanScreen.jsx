// ScanScreen.jsx — the 5 stages of the scan flow.

function ScanShell({ children }) {
  return (
    <div style={{
      background: '#0A0A0B', minHeight: '100%', color: '#F5F5F7',
      paddingTop: 56, paddingBottom: 100, fontFamily: 'Inter, sans-serif',
    }}>
      {children}
    </div>
  );
}

function ScanHeader({ title, supertitle = 'Scan Card', onBack }) {
  return (
    <div style={{ padding: '0 16px 20px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
      }}>
        {onBack && (
          <div style={{
            width: 36, height: 36, borderRadius: 9999,
            background: '#161618', border: '1px solid #2A2A2F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="18" viewBox="0 0 12 18" fill="none" stroke="#F5F5F7" strokeWidth="2" strokeLinecap="round">
              <path d="M9 2L2 9l7 7"/>
            </svg>
          </div>
        )}
        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
          color: '#FF4713', letterSpacing: 2, textTransform: 'uppercase',
        }}>{supertitle}</div>
      </div>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
        fontSize: 34, lineHeight: 1, textTransform: 'uppercase', letterSpacing: 0.3,
      }}>{title}</div>
    </div>
  );
}

// STAGE 1: Idle — ready to capture
function ScanIdle({ hasFront = false, hasBack = false }) {
  return (
    <ScanShell>
      <ScanHeader title="New Pull" />
      <div style={{ padding: '0 16px' }}>
        {/* FRONT zone */}
        <Zone label="Front of card" required hasImage={hasFront}>
          {hasFront ? (
            <div style={{ width: '70%' }}>
              <window.CardArt card={window.CARDS[1]} size="md" />
            </div>
          ) : (
            <CameraPrompt primary />
          )}
        </Zone>

        {/* BACK zone */}
        <Zone label="Back of card" optional subtitle="Helps identify card number & serial" hasImage={hasBack} small>
          <CameraPrompt />
        </Zone>

        {/* Action button */}
        <button style={{
          width: '100%', height: 56, borderRadius: 12,
          background: hasFront ? '#FF4713' : '#2A2A2F',
          color: hasFront ? '#fff' : '#45454E',
          border: 'none', cursor: hasFront ? 'pointer' : 'not-allowed',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 18, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: 2, marginTop: 18,
        }}>Identify Card →</button>

        <div style={{
          textAlign: 'center', marginTop: 14, fontSize: 12,
          color: '#8E8E9A',
        }}>AI identifies player, set, parallel, and serial in ~3s.</div>
      </div>
    </ScanShell>
  );
}

function Zone({ label, required, optional, subtitle, small, hasImage, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
          fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
          color: '#F5F5F7',
        }}>{label}
          {required && <span style={{ color: '#FF4713', marginLeft: 6, fontSize: 10 }}>REQUIRED</span>}
          {optional && <span style={{ color: '#8E8E9A', marginLeft: 6, fontSize: 10 }}>OPTIONAL</span>}
        </div>
      </div>
      <div style={{
        aspectRatio: small ? '7/3' : '5/4',
        background: '#161618',
        border: hasImage ? '1px solid #2A2A2F' : '2px dashed #2A2A2F',
        borderRadius: 16, padding: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 10,
        position: 'relative',
      }}>
        {children}
      </div>
      {subtitle && (
        <div style={{
          fontSize: 11, color: '#8E8E9A', marginTop: 6,
        }}>{subtitle}</div>
      )}
    </div>
  );
}

function CameraPrompt({ primary }) {
  return (
    <>
      <div style={{
        width: 48, height: 48, borderRadius: 9999,
        background: primary ? '#FF471326' : '#1F1F23',
        border: primary ? '1px solid #FF471399' : '1px solid #2A2A2F',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={primary ? '#FF4713' : '#8E8E9A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8h3l2-3h8l2 3h3v12H3z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      </div>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
        fontSize: 14, letterSpacing: 1, textTransform: 'uppercase',
        color: '#F5F5F7',
      }}>Tap to photograph</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Ghost label="Camera" />
        <Ghost label="Library" />
      </div>
    </>
  );
}

function Ghost({ label }) {
  return (
    <div style={{
      padding: '6px 12px', borderRadius: 8,
      background: '#1F1F23', border: '1px solid #2A2A2F',
      fontSize: 11, fontWeight: 600, color: '#F5F5F7',
      textTransform: 'uppercase', letterSpacing: 0.5,
    }}>{label}</div>
  );
}

// STAGE 2: Processing — spinner + status
function ScanProcessing({ stage = 'identifying' }) {
  const stages = {
    uploading:    { label: 'Uploading…',           sub: 'Sending to secure storage' },
    identifying:  { label: 'Identifying card…',    sub: 'Analyzing player, set, and card number' },
    classifying:  { label: 'Classifying parallel…', sub: 'Matching border color, finish, and print run' },
  };
  const s = stages[stage];
  return (
    <ScanShell>
      <ScanHeader title="Working" onBack />
      <div style={{
        padding: '20px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          width: 180, aspectRatio: '5/7',
          borderRadius: 12,
          padding: 4, position: 'relative',
          background: 'radial-gradient(circle, #FF4713 0%, transparent 70%)',
        }} className="tilt-card">
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 12,
            border: '3px solid #FF4713',
            animation: 'pulse-ring 1.6s ease-in-out infinite',
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <window.CardArt card={window.CARDS[1]} size="md" />
          </div>
        </div>

        {/* Stage progression */}
        <div style={{
          marginTop: 36, width: '100%', maxWidth: 280,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {Object.entries(stages).map(([k, v]) => {
            const active = k === stage;
            const done = k === 'uploading' && stage !== 'uploading' ||
                         k === 'identifying' && stage === 'classifying';
            return (
              <div key={k} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: active ? 1 : done ? 0.8 : 0.3,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 9999,
                  background: done ? '#00C9A7' : active ? '#FF4713' : '#1F1F23',
                  border: '1px solid',
                  borderColor: done ? '#00C9A7' : active ? '#FF4713' : '#2A2A2F',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {done && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M2 6l3 3 5-6"/>
                    </svg>
                  )}
                  {active && (
                    <div style={{
                      width: 8, height: 8, borderRadius: 9999, background: '#fff',
                    }} />
                  )}
                </div>
                <div>
                  <div style={{
                    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
                    fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>{v.label}</div>
                  {active && (
                    <div style={{ fontSize: 11, color: '#8E8E9A', marginTop: 2 }}>
                      {v.sub}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScanShell>
  );
}

// STAGE 3: Confirming — AI results
function ScanConfirming({ candidateIdx = 0, confidence = 'high', showReasoning = false }) {
  const candidates = [
    { card: window.CARDS[1], conf: 0.94, reason: 'Rainbow holographic border with no visible serial etched variants. Print run marker in bottom-right reads "1/1". Clark #1 confirmed via top-left RC stamp and Prizm foil pattern.' },
    { card: window.CARDS[0], conf: 0.12, reason: 'Silver refractor pattern is possible but border color reads more saturated than typical Silver Prizm.' },
    { card: window.CARDS[2], conf: 0.08, reason: 'Red Ice shows cracked-ice pattern, which is not visible here.' },
  ];
  const c = candidates[candidateIdx];
  const confLabel = { high: 'HIGH', medium: 'MEDIUM', low: 'LOW' }[confidence];
  const confColor = { high: '#00C9A7', medium: '#F5A623', low: '#E8373A' }[confidence];

  return (
    <ScanShell>
      <ScanHeader title="Confirm Card" onBack />

      <div style={{ padding: '0 16px' }}>
        {/* Candidate nav */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex', gap: 4,
            }}>
              {candidates.map((_, i) => (
                <div key={i} style={{
                  width: i === candidateIdx ? 20 : 6, height: 6, borderRadius: 9999,
                  background: i === candidateIdx ? '#FF4713' : '#2A2A2F',
                  transition: 'width 200ms',
                }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#8E8E9A', fontWeight: 600 }}>
              Candidate {candidateIdx + 1} of {candidates.length}
            </div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 9px', borderRadius: 9999,
            background: `${confColor}26`, border: `1px solid ${confColor}99`,
            color: confColor,
            fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 1,
          }}>● {confLabel}</div>
        </div>

        {/* Low-confidence banner */}
        {confidence === 'low' && (
          <div style={{
            background: '#3D2800', border: '1px solid #F5A62399',
            borderRadius: 10, padding: '10px 12px', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ color: '#F5A623', fontSize: 14 }}>⚠</span>
            <div style={{ fontSize: 12, color: '#F5A623' }}>
              Review carefully — AI isn't confident in this match.
            </div>
          </div>
        )}

        {/* Card preview */}
        <div style={{
          display: 'flex', gap: 14, marginBottom: 16,
          background: '#161618', border: '1px solid #1F1F23',
          borderRadius: 14, padding: 14,
        }}>
          <div style={{ width: 110, flexShrink: 0 }} className="tilt-card">
            <window.CardArt card={c.card} size="md" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
              fontSize: 20, lineHeight: 1.1, textTransform: 'uppercase',
              marginBottom: 4,
            }}>{c.card.player}</div>
            <div style={{ fontSize: 12, color: '#8E8E9A', marginBottom: 8 }}>
              {c.card.set} · #{c.card.num}
            </div>
            <div style={{ marginBottom: 8 }}>
              <window.ParallelBadge parallelKey={c.card.parallel} />
            </div>
            {c.card.serial && (
              <div style={{
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
                fontSize: 13, color: window.PARALLELS[c.card.parallel].hex,
              }}>Serial {c.card.serial}</div>
            )}
          </div>
        </div>

        {/* AI reasoning */}
        <div style={{
          background: '#161618', border: '1px solid #1F1F23',
          borderRadius: 10, padding: '10px 12px', marginBottom: 16,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: showReasoning ? 8 : 0,
          }}>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
              fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
              color: '#8E8E9A',
            }}>▶ AI Reasoning</div>
            <div style={{ fontSize: 10, color: '#8E8E9A' }}>
              {(c.conf * 100).toFixed(0)}%
            </div>
          </div>
          {showReasoning && (
            <div style={{ fontSize: 12, color: '#F5F5F7', lineHeight: 1.5 }}>
              {c.reason}
            </div>
          )}
        </div>

        {/* Editable fields */}
        <div style={{ marginBottom: 18 }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
            fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
            color: '#8E8E9A', marginBottom: 10,
          }}>Editable</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Parallel" value={window.PARALLELS[c.card.parallel].name} />
            <Field label="Serial" value={c.card.serial || '—'} />
            <Field label="Condition" value="Mint" />
            <Field label="Cost paid" value="$4,800" />
          </div>
        </div>

        {/* Primary CTA */}
        <button style={{
          width: '100%', height: 56, borderRadius: 12,
          background: '#FF4713', color: '#fff', border: 'none',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 18, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: 2, cursor: 'pointer',
        }}>Confirm · Add to Collection</button>

        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <span style={{
            fontSize: 12, color: '#8E8E9A',
            textDecoration: 'underline', textDecorationColor: '#2A2A2F',
          }}>None of these — enter manually</span>
        </div>
      </div>
    </ScanShell>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{
        fontSize: 10, color: '#8E8E9A', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
      }}>{label}</div>
      <div style={{
        background: '#161618', border: '1px solid #2A2A2F',
        borderRadius: 8, padding: '10px 12px',
        fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#F5F5F7',
        minHeight: 40,
      }}>{value}</div>
    </div>
  );
}

// STAGE 4: Manual — empty form
function ScanManual() {
  return (
    <ScanShell>
      <ScanHeader title="Manual Entry" onBack />
      <div style={{ padding: '0 16px' }}>
        <div style={{
          background: '#3D2800', border: '1px solid #F5A62399',
          borderRadius: 10, padding: '10px 12px', marginBottom: 16,
          fontSize: 12, color: '#F5A623',
        }}>
          AI couldn't identify this card. Enter details by hand.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Player name *" value="" />
          <Field label="Set *" value="2024 Prizm" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Card # *" value="" />
            <Field label="Serial" value="" />
          </div>
          <Field label="Parallel" value="Base" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Condition" value="Near Mint" />
            <Field label="Cost paid" value="$" />
          </div>
          <Field label="Date acquired" value="04/18/2026" />
        </div>

        <button style={{
          width: '100%', height: 56, borderRadius: 12,
          background: '#FF4713', color: '#fff', border: 'none',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 18, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: 2, marginTop: 18, cursor: 'pointer',
        }}>Add to Collection</button>
      </div>
    </ScanShell>
  );
}

// STAGE 5: Success — pack-opening energy
function ScanSuccess() {
  return (
    <ScanShell>
      <div style={{
        padding: '20px 16px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
      }}>
        {/* Burst glow */}
        <div style={{
          position: 'relative', marginTop: 20, marginBottom: 24,
          width: 220, aspectRatio: '5/7',
        }}>
          <div style={{
            position: 'absolute', inset: -40, borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(0,201,167,0.35) 0%, transparent 60%)',
            filter: 'blur(10px)',
          }} />
          <div style={{
            position: 'absolute', inset: -80, borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
          }} />
          <div style={{ position: 'relative' }} className="tilt-card">
            <window.CardArt card={window.CARDS[1]} size="md" />
          </div>
          {/* Teal checkmark badge */}
          <div style={{
            position: 'absolute', bottom: -10, right: -10,
            width: 44, height: 44, borderRadius: 9999,
            background: '#00C9A7', border: '3px solid #0A0A0B',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,201,167,0.5)',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0A0A0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 9l3 3 7-8"/>
            </svg>
          </div>
        </div>

        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700,
          color: '#00C9A7', letterSpacing: 2, textTransform: 'uppercase',
          marginBottom: 4,
        }}>★ 1-of-1 pulled</div>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
          fontSize: 30, lineHeight: 1, textTransform: 'uppercase',
          letterSpacing: 0.5, marginBottom: 6,
        }}>Added to the Vault</div>
        <div style={{
          fontSize: 13, color: '#8E8E9A', marginBottom: 24,
        }}>Caitlin Clark · 1-of-1 · 2024 Prizm #1</div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{
            width: '100%', height: 52, borderRadius: 12,
            background: '#FF4713', color: '#fff', border: 'none',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 17, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: 2, cursor: 'pointer',
          }}>Scan Another Card</button>
          <button style={{
            width: '100%', height: 52, borderRadius: 12,
            background: 'transparent', color: '#F5F5F7',
            border: '1px solid #2A2A2F',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 17, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: 2, cursor: 'pointer',
          }}>View Collection</button>
        </div>
      </div>
    </ScanShell>
  );
}

Object.assign(window, { ScanIdle, ScanProcessing, ScanConfirming, ScanManual, ScanSuccess });
