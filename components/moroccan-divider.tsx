"use client"
import React from 'react'

export default function MoroccanDivider({ className }: { className?: string }) {
  return (
    <div className={className ?? 'w-full'}>
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby="morocco-divider-title morocco-divider-desc"
        className="w-full h-[64px] md:h-[80px] block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="morocco-divider-title">Moroccan Zellij decorative divider</title>
        <desc id="morocco-divider-desc">A repeating, geometric zellij-inspired decorative line in Moroccan colors.</desc>

        <defs>
          <pattern id="tile" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="#F7E7C4" />
            <rect x="4" y="4" width="72" height="72" rx="6" ry="6" fill="#F7E7C4" stroke="#1F3A70" strokeWidth="2" />
            <g transform="translate(40,40)">
              <polygon points="0,-18 5,-6 18,-6 8,2 12,16 0,8 -12,16 -8,2 -18,-6 -5,-6" fill="#C1272D" />
              <circle r="6" fill="#00A3A3" />
            </g>
            <polygon points="8,40 16,32 24,40 16,48" fill="#006233" opacity="0.95" />
            <polygon points="56,40 64,32 72,40 64,48" fill="#006233" opacity="0.95" />
            <polygon points="8,8 16,0 24,8 16,16" fill="#00A3A3" opacity="0.9" />
            <polygon points="56,8 64,0 72,8 64,16" fill="#00A3A3" opacity="0.9" />
            <rect x="0" y="38" width="80" height="4" fill="#1F3A70" opacity="0.12" />
          </pattern>

          <linearGradient id="glow" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.06" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <rect x="0" y="8" width="1200" height="64" fill="url(#tile)" />
        <rect x="0" y="8" width="1200" height="6" fill="url(#glow)" />
        <rect x="0" y="66" width="1200" height="6" fill="url(#glow)" />
        <rect x="0" y="6" width="1200" height="2" fill="#1F3A70" opacity="0.08" />
        <rect x="0" y="72" width="1200" height="2" fill="#1F3A70" opacity="0.08" />
      </svg>
    </div>
  )
}
