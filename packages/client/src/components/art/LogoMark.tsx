/**
 * DeckForge logo mark — three cards fanned in a hand, with a flame spark.
 * Fully inline SVG, no external assets. Works at any size.
 */
import { type ReactElement } from 'react'

type LogoMarkProps = {
  size?: number
}

export default function LogoMark({ size = 40 }: LogoMarkProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DeckForge logo"
    >
      {/* ── Cards fan from pivot at (24, 50) ── */}

      {/* Back-left card — sky blue */}
      <g transform="translate(24, 50) rotate(-22)">
        <rect x="-11" y="-36" width="22" height="30" rx="3.5"
          fill="#6BADE0" stroke="#2A1810" strokeWidth="2.2" strokeLinejoin="round" />
      </g>

      {/* Back-right card — coral */}
      <g transform="translate(24, 50) rotate(22)">
        <rect x="-11" y="-36" width="22" height="30" rx="3.5"
          fill="#E8654A" stroke="#2A1810" strokeWidth="2.2" strokeLinejoin="round" />
      </g>

      {/* Front center card — cream */}
      <g transform="translate(24, 50) rotate(0)">
        <rect x="-11" y="-36" width="22" height="30" rx="3.5"
          fill="#FFFCF5" stroke="#2A1810" strokeWidth="2.2" strokeLinejoin="round" />
        {/* Star pip */}
        <text
          x="0" y="-17"
          textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fill="#F0A500"
          stroke="#2A1810" strokeWidth="0.6" paintOrder="stroke"
        >
          ★
        </text>
      </g>

      {/* ── Flame spark above center card ── */}
      {/* Outer flame */}
      <path
        d="M24 16 C21 11 19 7 24 2 C29 7 27 11 24 16 Z"
        fill="#F0A500" stroke="#2A1810" strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Inner flame highlight */}
      <path
        d="M24 14 C22.5 11 22 9 24 5 C26 9 25.5 11 24 14 Z"
        fill="#FFD166"
      />
    </svg>
  )
}
