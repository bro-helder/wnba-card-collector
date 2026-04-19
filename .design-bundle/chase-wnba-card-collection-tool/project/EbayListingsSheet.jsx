// Shared eBay listings sheet + data generator. Loaded by Want List, Goals, and Card Detail.

window.EBAY_LISTINGS_FOR = function(want) {
  const base = want.market;
  return [
    { price: Math.round(base*0.94), type: 'BIN',     cond: 'NM',    seller: 'topdeckcards',  rating: 4.98, ends: null,     bids: null, best: true,  inRange: Math.round(base*0.94) <= want.target },
    { price: Math.round(base*0.88), type: 'AUCTION', cond: 'NM',    seller: 'thundertrades', rating: 4.98, ends: '4h 12m', bids: 11,   inRange: Math.round(base*0.88) <= want.target },
    { price: Math.round(base*1.08), type: 'BIN',     cond: 'MT 9',  seller: 'wnbahoops',     rating: 4.92, ends: null,     bids: null, inRange: Math.round(base*1.08) <= want.target },
    { price: Math.round(base*1.22), type: 'BIN',     cond: 'GEM 10',seller: 'pristine_pc',   rating: 5.00, ends: null,     bids: null, inRange: Math.round(base*1.22) <= want.target },
  ];
};

function EbayListingsSheet({ title, subtitle, target, listings, onClose }) {
  const [fetched, setFetched] = React.useState(true);  // demo: start in "fetched" state
  const [loading, setLoading] = React.useState(false);
  const fetchedAt = 'Today · 2:14 PM';

  const handleFetch = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setFetched(true); }, 600);
  };

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, top: '28%',
      background: '#111115', borderTop: '1px solid #2a2a33',
      borderRadius: '20px 20px 0 0',
      zIndex: 50, display: 'flex', flexDirection: 'column',
      boxShadow: '0 -20px 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{ padding: '12px 20px 10px' }}>
        <div style={{
          width: 40, height: 4, background: '#2a2a33', borderRadius: 9999,
          margin: '0 auto 14px',
        }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
              fontSize: 20, letterSpacing: -0.2, lineHeight: 1,
            }}>{title}</div>
            <div style={{ fontSize: 11, color: '#9B9BA8', marginTop: 4 }}>{subtitle}</div>
          </div>
          <button
            onClick={handleFetch}
            style={{
              flexShrink: 0,
              background: fetched ? 'transparent' : '#FF4713',
              color: fetched ? '#E8E8EF' : '#fff',
              border: fetched ? '1px solid #2a2a33' : 'none',
              borderRadius: 9999, padding: '7px 12px',
              fontSize: 10, fontWeight: 700, letterSpacing: 1,
              textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'Barlow Condensed, sans-serif',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
              style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }}>
              <path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>
            </svg>
            {loading ? 'Checking…' : fetched ? 'Refresh' : 'Check eBay'}
          </button>
        </div>
        {fetched && (
          <div style={{
            fontSize: 10, color: '#6b6b78', marginTop: 8,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            Prices from {fetchedAt} · {listings.length} listings
          </div>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {!fetched ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 40px', textAlign: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 28, opacity: 0.3 }}>◌</div>
          <div style={{ fontSize: 13, color: '#9B9BA8', maxWidth: 240 }}>
            Tap <span style={{ color: '#FF4713', fontWeight: 700 }}>Check eBay</span> to fetch live listings. Prices aren't fetched automatically.
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {listings.map((l, i) => (
            <div key={i} style={{
              background: '#0A0A0B',
              border: `1px solid ${l.inRange ? 'rgba(255,71,19,0.4)' : '#1f1f26'}`,
              borderRadius: 10, padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700,
                color: l.inRange ? '#FF4713' : '#E8E8EF', width: 68, flexShrink: 0,
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
              {l.inRange && (
                <span style={{
                  fontSize: 9, color: '#FF4713', fontWeight: 700,
                  letterSpacing: 1, textTransform: 'uppercase',
                  padding: '2px 6px', background: 'rgba(255,71,19,0.12)',
                  border: '1px solid rgba(255,71,19,0.35)', borderRadius: 9999,
                  fontFamily: 'Barlow Condensed',
                }}>In range</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{
        padding: '10px 16px 16px', borderTop: '1px solid #1f1f26',
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <div style={{ fontSize: 11, color: '#6b6b78' }}>
          Target <span style={{ color: '#E8E8EF', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>${target}</span>
        </div>
        <button style={{
          marginLeft: 'auto', padding: '12px 18px',
          background: fetched ? '#FF4713' : '#2a2a33',
          color: fetched ? '#fff' : '#6b6b78',
          border: 'none', borderRadius: 10,
          fontSize: 12, fontWeight: 700,
          cursor: fetched ? 'pointer' : 'not-allowed', letterSpacing: 0.3,
        }}>Open on eBay ↗</button>
      </div>
    </div>
  );
}
window.EbayListingsSheet = EbayListingsSheet;
