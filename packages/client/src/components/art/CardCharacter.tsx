/**
 * DeckForge mascot — a living playing card with big googly eyes,
 * rosy cheeks, chubby arms, and a wide smile.
 * Floats (no legs) for a cleaner, friendlier silhouette.
 * Rubber-hose / 1930s cartoon style, all inline SVG.
 */
import { type ReactElement } from 'react'

interface CardCharacterProps {
  className?: string
}

interface SparkleProps {
  cx: number
  cy: number
  r: number
  color: string
}

export default function CardCharacter({ className }: CardCharacterProps): ReactElement {
  return (
    <svg
      viewBox="0 0 160 172"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DeckForge mascot"
    >
      {/* ── Sparkles ── */}
      <Sparkle cx={20} cy={30} r={5}   color="#F0A500" />
      <Sparkle cx={142} cy={24} r={4}  color="#6BADE0" />
      <Sparkle cx={10}  cy={108} r={3.5} color="#E8654A" />
      <Sparkle cx={152} cy={100} r={4} color="#5BAD72" />
      <Sparkle cx={80}  cy={10}  r={3} color="#FFD166" />

      {/* ── Mini-cards in hands (behind arms) ── */}

      {/* Left hand card */}
      <g transform="translate(15, 95) rotate(-20)">
        <rect x="-9" y="-13" width="18" height="24" rx="3"
          fill="#6BADE0" stroke="#2A1810" strokeWidth="2" />
        <text x="0" y="2" textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fill="#FFFCF5" fontWeight="bold">♠</text>
      </g>

      {/* Right hand card */}
      <g transform="translate(145, 93) rotate(16)">
        <rect x="-9" y="-13" width="18" height="24" rx="3"
          fill="#E8654A" stroke="#2A1810" strokeWidth="2" />
        <text x="0" y="2" textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fill="#FFFCF5" fontWeight="bold">♥</text>
      </g>

      {/* ── Arms — thick rubber-hose curves behind the body ── */}

      {/* Left arm */}
      <path d="M 44 96 C 33 96 22 96 16 92"
        stroke="#2A1810" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Left hand (round nub) */}
      <circle cx="14" cy="91" r="6" fill="#FFFCF5" stroke="#2A1810" strokeWidth="2.2" />

      {/* Right arm */}
      <path d="M 116 96 C 127 96 138 96 144 90"
        stroke="#2A1810" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Right hand (round nub) */}
      <circle cx="146" cy="89" r="6" fill="#FFFCF5" stroke="#2A1810" strokeWidth="2.2" />

      {/* ── Card body shadow (hard offset) ── */}
      <rect x="46" y="30" width="78" height="102" rx="13"
        fill="#2A1810" opacity="0.14" />

      {/* ── Card body ── */}
      <rect x="41" y="25" width="78" height="102" rx="13"
        fill="#FFFCF5" stroke="#2A1810" strokeWidth="3" />

      {/* Card inner frame (classic card detail) */}
      <rect x="46" y="30" width="68" height="92" rx="10"
        stroke="#E8D5A8" strokeWidth="1.5" fill="none" />

      {/* Corner pips */}
      <text x="50" y="43" fontSize="9" fill="#2A1810" fontFamily="Georgia, serif">★</text>
      <g transform="translate(110, 109) rotate(180)">
        <text x="-4" y="4" fontSize="9" fill="#2A1810" fontFamily="Georgia, serif">★</text>
      </g>

      {/* ── Flame crown on top of card ── */}
      <path d="M80 27 C 74 18 70 10 80 2 C 90 10 86 18 80 27 Z"
        fill="#F0A500" stroke="#2A1810" strokeWidth="2" strokeLinejoin="round" />
      <path d="M80 24 C 76 17 75 12 80 6 C 85 12 84 17 80 24 Z"
        fill="#FFD166" />

      {/* ── Eyes — anime style, half-sized ── */}

      {/* Left eye */}
      <ellipse cx="60" cy="67" rx="10.5" ry="12" fill="white" stroke="#2A1810" strokeWidth="2.8" />
      <ellipse cx="60" cy="69" rx="7.5" ry="9" fill="#6BADE0" />
      <ellipse cx="60" cy="70" rx="4.5" ry="6" fill="#1A0F08" />
      <ellipse cx="65" cy="62" rx="3.3" ry="4.2" fill="white" />
      <circle cx="55" cy="73" r="1.5" fill="white" opacity="0.7" />

      {/* Right eye */}
      <ellipse cx="100" cy="67" rx="10.5" ry="12" fill="white" stroke="#2A1810" strokeWidth="2.8" />
      <ellipse cx="100" cy="69" rx="7.5" ry="9" fill="#6BADE0" />
      <ellipse cx="100" cy="70" rx="4.5" ry="6" fill="#1A0F08" />
      <ellipse cx="105" cy="62" rx="3.3" ry="4.2" fill="white" />
      <circle cx="95" cy="73" r="1.5" fill="white" opacity="0.7" />

      {/* ── Eyebrows — arched above ── */}
      <path d="M 46 52 Q 60 44 74 51"
        stroke="#2A1810" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M 86 51 Q 100 44 114 52"
        stroke="#2A1810" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* ── Cheeks ── */}
      <ellipse cx="50" cy="88" rx="9" ry="7" fill="#E8654A" opacity="0.5" />
      <ellipse cx="110" cy="88" rx="9" ry="7" fill="#E8654A" opacity="0.5" />

      {/* ── Wide smile ── */}
      <path d="M 60 106 Q 80 124 100 106"
        stroke="#2A1810" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Smile shine — inner arc gives it a 3D feel */}
      <path d="M 64 107 Q 80 120 96 107"
        stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />

      {/* ── Floating shadow underneath ── */}
      <ellipse cx="80" cy="163" rx="28" ry="5.5"
        fill="#2A1810" opacity="0.1" />
    </svg>
  )
}

/** 4-pointed sparkle cross */
function Sparkle({ cx, cy, r, color }: SparkleProps): ReactElement {
  return (
    <g>
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r}
        stroke={color} strokeWidth={r * 0.55} strokeLinecap="round" />
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy}
        stroke={color} strokeWidth={r * 0.55} strokeLinecap="round" />
      <line x1={cx - r * 0.65} y1={cy - r * 0.65} x2={cx + r * 0.65} y2={cy + r * 0.65}
        stroke={color} strokeWidth={r * 0.3} strokeLinecap="round" />
      <line x1={cx + r * 0.65} y1={cy - r * 0.65} x2={cx - r * 0.65} y2={cy + r * 0.65}
        stroke={color} strokeWidth={r * 0.3} strokeLinecap="round" />
    </g>
  )
}
