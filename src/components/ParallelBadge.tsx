'use client';

import React from 'react';
import { PARALLELS, type ParallelKey } from '@/lib/cardData';

interface ParallelBadgeProps {
  parallelKey: ParallelKey;
  size?: 'sm' | 'md';
}

export function ParallelBadge({ parallelKey, size = 'md' }: ParallelBadgeProps) {
  const p = PARALLELS[parallelKey];
  if (!p) return null;

  const isMojo = parallelKey === 'mojo';
  const isOneOfOne = parallelKey === 'oneOfOne';
  const isShimmer = p.animated === 'shimmer';
  const px = size === 'sm' ? '3px 7px' : '4px 9px';
  const fs = size === 'sm' ? 9 : 10;

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: px,
    borderRadius: 9999,
    fontFamily: 'var(--font-body), Inter, sans-serif',
    fontWeight: 600,
    fontSize: fs,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    lineHeight: 1,
  };

  if (isMojo) {
    return (
      <span style={{
        ...base,
        background: 'linear-gradient(135deg, #2C65D4, #9B59B6, #E74C3C)',
        backgroundSize: '200% 200%',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.25)',
      }} className="mojo-gradient">{p.name}</span>
    );
  }
  if (isOneOfOne) {
    return (
      <span style={{
        ...base,
        background: 'linear-gradient(90deg, #FF4713, #FFD700, #00C9A7, #9B59B6, #FF4713)',
        backgroundSize: '300% 100%',
        color: '#fff',
        border: '1px solid #FFD700',
        textShadow: '0 0 4px rgba(0,0,0,0.5)',
      }} className="mojo-gradient">★ 1-OF-1</span>
    );
  }
  if (isShimmer) {
    return (
      <span style={{
        ...base,
        background: `linear-gradient(90deg, ${p.hex}33 0%, ${p.hex}80 50%, ${p.hex}33 100%)`,
        backgroundSize: '200% 100%',
        color: p.hex,
        border: `1px solid ${p.hex}99`,
      }} className="shimmer-bg">{p.name}</span>
    );
  }
  return (
    <span style={{
      ...base,
      background: `${p.hex}26`,
      color: p.hex,
      border: `1px solid ${p.hex}99`,
    }}>{p.name}</span>
  );
}
