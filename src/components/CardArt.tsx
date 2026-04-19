'use client';

import React from 'react';
import { TEAMS, PARALLELS, type ParallelKey } from '@/lib/cardData';

export interface CardData {
  player: string;
  team: string;
  set: string;
  num: string | number;
  parallel: ParallelKey;
  rookie?: boolean;
  serial?: string | null;
  cond?: string;
  cost?: number;
  fav?: boolean;
}

interface CardArtProps {
  card: CardData;
  size?: 'sm' | 'md' | 'lg';
  scanned?: boolean;
  tilt?: number;
}

export function CardArt({ card, size = 'md', scanned = true, tilt = 0 }: CardArtProps) {
  const team = TEAMS[card.team] ?? { p: '#333', s: '#000', short: '???' };
  const p = PARALLELS[card.parallel] ?? PARALLELS.base;
  const isOneOfOne = card.parallel === 'oneOfOne';
  const isMojo = card.parallel === 'mojo';
  const isGoldVinyl = card.parallel === 'goldVinyl';
  const isTiger = card.parallel === 'tigerStripe';
  const isPremium = p.animated !== false || (p.run !== undefined && p.run <= 25);

  let faceBg: string;
  if (isTiger) {
    faceBg = `repeating-linear-gradient(115deg, ${team.p} 0 14px, #111 14px 22px)`;
  } else if (isMojo) {
    faceBg = `linear-gradient(150deg, #2C65D4 0%, #9B59B6 45%, #E74C3C 100%)`;
  } else if (isOneOfOne) {
    faceBg = `linear-gradient(145deg, #FFD700 0%, #FF4713 45%, #9B59B6 100%)`;
  } else if (card.parallel === 'gold' || isGoldVinyl) {
    faceBg = `linear-gradient(160deg, #FFD700 0%, #8B6914 50%, ${team.s} 100%)`;
  } else if (card.parallel === 'redIce') {
    faceBg = `linear-gradient(160deg, #FF5C4D 0%, ${team.s} 55%, #0A0A0B 100%)`;
  } else if (card.parallel === 'blueIce' || card.parallel === 'pulsar') {
    faceBg = `linear-gradient(160deg, ${p.hex} 0%, ${team.s} 55%, #0A0A0B 100%)`;
  } else if (card.parallel === 'neonPulse') {
    faceBg = `linear-gradient(160deg, #2ECC71 0%, ${team.s} 55%, #0A0A0B 100%)`;
  } else {
    faceBg = `linear-gradient(155deg, ${team.p} 0%, ${team.s} 60%, #0A0A0B 100%)`;
  }

  const borderColor = isOneOfOne ? '#FFD700'
    : isMojo ? '#C066D4'
    : isGoldVinyl ? '#C9A84C'
    : (p.run !== undefined && p.run <= 25) ? p.hex
    : '#1a1a1a';

  const nameSize  = size === 'sm' ? 11 : size === 'lg' ? 20 : 14;
  const teamSize  = size === 'sm' ? 34 : size === 'lg' ? 72 : 50;
  const numSize   = size === 'sm' ? 8  : size === 'lg' ? 12 : 10;

  const cardFace = (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '5/7',
        borderRadius: 6,
        overflow: 'hidden',
        background: faceBg,
        border: `2px solid ${borderColor}`,
        boxShadow: '0 10px 22px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}
      className={isOneOfOne ? 'rainbow-border' : isMojo ? 'mojo-gradient' : undefined}
    >
      {/* Faded team monogram */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
        fontSize: teamSize * 2.2, fontWeight: 800,
        color: 'rgba(255,255,255,0.06)',
        letterSpacing: -4, lineHeight: 1, userSelect: 'none',
      }}>{team.short}</div>

      {/* Rookie stamp */}
      {card.rookie && (
        <div style={{
          position: 'absolute',
          top: size === 'sm' ? 5 : 8,
          left: size === 'sm' ? 5 : 8,
          fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
          fontWeight: 800,
          fontSize: size === 'sm' ? 8 : 10,
          color: '#FFD700',
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid #FFD700',
          borderRadius: 2,
          padding: '1px 4px',
          letterSpacing: 1,
        }}>RC</div>
      )}

      {/* Card number */}
      <div style={{
        position: 'absolute',
        top: size === 'sm' ? 5 : 8,
        right: size === 'sm' ? 5 : 8,
        fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
        fontWeight: 700,
        fontSize: numSize,
        color: 'rgba(255,255,255,0.75)',
        letterSpacing: 1,
      }}>#{card.num}</div>

      {/* Team hero */}
      <div style={{
        position: 'absolute', top: '42%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
        fontWeight: 800, fontSize: teamSize, color: '#fff',
        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
        letterSpacing: 2, lineHeight: 1,
      }}>{team.short}</div>

      {/* Nameplate */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: size === 'sm' ? '6px 8px 8px' : '10px 12px 12px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 55%, transparent 100%)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: nameSize, color: '#fff',
          textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.1,
          textShadow: '0 1px 3px rgba(0,0,0,0.9)',
        }}>{card.player}</div>
        {size !== 'sm' && (
          <div style={{
            fontFamily: 'var(--font-body), Inter, sans-serif', fontSize: 9,
            color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase',
            letterSpacing: 1, marginTop: 2,
          }}>{card.set.replace('2024 ', "'24 ")} · {p.name}</div>
        )}
      </div>

      {/* Holographic sweep */}
      {(isPremium || card.parallel === 'silver') && (
        <div className="holo-sweep" style={card.parallel === 'silver' ? { opacity: 0.6 } : undefined} />
      )}

      {/* Serial stamp */}
      {card.serial && (
        <div style={{
          position: 'absolute',
          bottom: size === 'sm' ? 32 : 52,
          right: size === 'sm' ? 5 : 9,
          fontFamily: 'var(--font-display), Barlow Condensed, sans-serif',
          fontWeight: 700,
          fontSize: size === 'sm' ? 9 : 11,
          color: p.hex,
          background: 'rgba(0,0,0,0.65)',
          padding: '1px 5px',
          borderRadius: 2,
          letterSpacing: 0.5,
          textShadow: `0 0 6px ${p.hex}66`,
        }}>{card.serial}</div>
      )}

      {/* Top-edge light reflection */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '18%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );

  if (!scanned) return cardFace;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        position: 'absolute', bottom: -4, left: '10%', right: '10%',
        height: 18, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 70%)',
        filter: 'blur(4px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'relative', zIndex: 1,
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
        transformOrigin: 'center bottom',
      }}>
        {cardFace}
      </div>
    </div>
  );
}
