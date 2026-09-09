import { useState } from 'react';

export default function Logo({ size = 56, withText = false }: { size?: number; withText?: boolean }) {
  const [showFallback, setShowFallback] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center overflow-visible drop-shadow-lg"
        style={{ width: size, height: size }}
        aria-label="Aprende Jugando - logo TD"
      >
        {!showFallback ? (
          <img
            src="/logo.svg"
            alt="Aprende Jugando con TD"
            width={size}
            height={size}
            className="block object-contain"
            onError={() => setShowFallback(true)}
            style={{ width: size, height: size }}
          />
        ) : null}

        {showFallback ? (
          <svg viewBox="0 0 120 120" width={size} height={size} className="overflow-visible">
            <defs>
              <radialGradient id="tdBubble" cx="35%" cy="30%" r="80%">
                <stop offset="0%" stopColor="#22C8EF" />
                <stop offset="55%" stopColor="#00A9D6" />
                <stop offset="100%" stopColor="#0083B3" />
              </radialGradient>
              <filter id="tdSoft" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0369a1" floodOpacity="0.35" />
              </filter>
            </defs>
            <g filter="url(#tdSoft)">
              <circle cx="62" cy="60" r="52" fill="url(#tdBubble)" />
              <circle cx="62" cy="60" r="52" fill="none" stroke="#7BDCF2" strokeWidth="1.5" opacity="0.6" />
              <path d="M14 66 Q2 60 10 50 Q16 44 22 48 L30 58 L24 70 Q18 72 14 66 Z" fill="#00A9D6" />
              <path d="M14 66 Q2 60 10 50" fill="none" stroke="#7BDCF2" strokeWidth="1.5" opacity="0.7" />
              <ellipse cx="44" cy="30" rx="18" ry="9" fill="white" opacity="0.22" transform="rotate(-18 44 30)" />
            </g>
            <g fill="none" stroke="#BDEFFB" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
              <path d="M28 34 H62" />
              <path d="M45 34 V92 Q45 96 49 96" />
              <path d="M58 30 H72 Q102 30 102 62 Q102 94 72 94 H58" />
            </g>
            <g fill="#FFFFFF" opacity="0.16">
              <path d="M28 34 H62 V40 H28 Z" />
            </g>
          </svg>
        ) : null}
      </div>
      {withText && (
        <div className="leading-tight">
          <div className="font-display text-xl font-black tracking-tight text-sky-950">
            Aprende <span className="text-sky-500">Jugando</span>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600/70">con TD</div>
        </div>
      )}
    </div>
  );
}
