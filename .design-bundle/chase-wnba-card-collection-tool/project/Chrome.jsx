// Parallel badge — pill with parallel color coding
function ParallelBadge({ parallelKey, size = 'md' }) {
  const p = window.PARALLELS[parallelKey];
  if (!p) return null;
  const isMojo = parallelKey === 'mojo';
  const isOneOfOne = parallelKey === 'oneOfOne';
  const isShimmer = p.animated === 'shimmer';
  const px = size === 'sm' ? '3px 7px' : '4px 9px';
  const fs = size === 'sm' ? 9 : 10;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: px,
    borderRadius: 9999,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    fontSize: fs,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    lineHeight: 1,
  };

  if (isMojo) {
    return <span style={{
      ...baseStyle,
      background: 'linear-gradient(135deg, #2C65D4, #9B59B6, #E74C3C)',
      backgroundSize: '200% 200%',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.25)',
    }} className="mojo-gradient">{p.name}</span>;
  }
  if (isOneOfOne) {
    return <span style={{
      ...baseStyle,
      background: 'linear-gradient(90deg, #FF4713, #FFD700, #00C9A7, #9B59B6, #FF4713)',
      backgroundSize: '300% 100%',
      color: '#fff',
      border: '1px solid #FFD700',
      textShadow: '0 0 4px rgba(0,0,0,0.5)',
    }} className="mojo-gradient">★ 1-OF-1</span>;
  }
  if (isShimmer) {
    return <span style={{
      ...baseStyle,
      background: `linear-gradient(90deg, ${p.hex}33 0%, ${p.hex}80 50%, ${p.hex}33 100%)`,
      backgroundSize: '200% 100%',
      color: p.hex,
      border: `1px solid ${p.hex}99`,
    }} className="shimmer-bg">{p.name}</span>;
  }
  return <span style={{
    ...baseStyle,
    background: `${p.hex}26`,
    color: p.hex,
    border: `1px solid ${p.hex}99`,
  }}>{p.name}</span>;
}

// Filter chip for the horizontal scroller
function FilterChip({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 9999,
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        fontWeight: 600,
        background: active ? '#FF4713' : '#1F1F23',
        color: active ? '#fff' : '#8E8E9A',
        border: active ? '1px solid #FF4713' : '1px solid #2A2A2F',
        letterSpacing: 0.2,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: 'all 150ms',
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{
          fontSize: 11,
          opacity: 0.7,
          fontWeight: 500,
        }}>{count}</span>
      )}
    </button>
  );
}

// Bottom navigation matching styling-guidelines: orange Scan pill as anchor
function BottomNav({ active = 'collection', onChange }) {
  const tabs = [
    { id: 'collection', label: 'Collection', icon: 'cards' },
    { id: 'wants',      label: 'Want List',  icon: 'star' },
    { id: 'scan',       label: 'Scan',       icon: 'scan' },
    { id: 'goals',      label: 'Goals',      icon: 'target' },
  ];

  const Icon = ({ id, color, size = 22 }) => {
    const s = { width: size, height: size, fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
    switch (id) {
      case 'cards':
        return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="5" width="14" height="16" rx="2"/><path d="M7 5V3h14v16h-2"/></svg>;
      case 'star':
        return <svg viewBox="0 0 24 24" {...s}><path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9z"/></svg>;
      case 'scan':
        return <svg viewBox="0 0 24 24" {...s} strokeWidth="2"><path d="M4 8V5a1 1 0 011-1h3M20 8V5a1 1 0 00-1-1h-3M4 16v3a1 1 0 001 1h3M20 16v3a1 1 0 01-1 1h-3"/><circle cx="12" cy="12" r="3.5"/></svg>;
      case 'target':
        return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill={color}/></svg>;
      case 'tag':
        return <svg viewBox="0 0 24 24" {...s}><path d="M20 12L12 20l-9-9V3h8l9 9z"/><circle cx="7.5" cy="7.5" r="1.2" fill={color}/></svg>;
      default: return null;
    }
  };

  return (
    <div style={{
      position: 'absolute',
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
      {tabs.map(t => {
        const isActive = active === t.id;
        const isScan = t.id === 'scan';
        if (isScan) {
          return (
            <button
              key={t.id}
              onClick={() => onChange && onChange(t.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 9999,
                background: '#FF4713',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(255,71,19,0.45), 0 0 0 4px rgba(255,71,19,0.15)',
                marginTop: -14,
              }}>
                <Icon id={t.icon} color="#fff" size={26} />
              </div>
            </button>
          );
        }
        return (
          <button
            key={t.id}
            onClick={() => onChange && onChange(t.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              minWidth: 48,
            }}
          >
            <Icon id={t.icon} color={isActive ? '#FF4713' : '#8E8E9A'} size={22} />
            {isActive && (
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                fontWeight: 600,
                color: '#FF4713',
                letterSpacing: 0.3,
              }}>{t.label}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { ParallelBadge, FilterChip, BottomNav });
