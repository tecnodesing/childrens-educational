import { motion } from 'framer-motion';

export type TDMood = 'feliz' | 'hablando' | 'pensando' | 'fiesta' | 'durmiendo' | 'triste';

export default function TDRobot({
  mood = 'feliz',
  size = 96,
  animate = true,
}: {
  mood?: TDMood;
  size?: number;
  animate?: boolean;
}) {
  const eyes = {
    feliz: { l: 'M34 48 q6 -7 12 0', r: 'M74 48 q6 -7 12 0' },
    hablando: { l: 'M34 48 q6 -5 12 0', r: 'M74 48 q6 -5 12 0' },
    pensando: { l: 'M36 50 l8 -3', r: 'M76 47 l8 3' },
    fiesta: { l: 'M34 48 q6 -8 12 0', r: 'M74 48 q6 -8 12 0' },
    durmiendo: { l: 'M34 50 q6 4 12 0', r: 'M74 50 q6 4 12 0' },
    triste: { l: 'M35 46 q6 3 10 0', r: 'M75 46 q6 3 10 0' },
  }[mood];

  const mouth = {
    feliz: 'M50 72 Q60 80 70 72',
    hablando: 'M54 73 Q60 79 66 73 Q60 76 54 73',
    pensando: 'M52 74 Q60 71 68 74',
    fiesta: 'M48 70 Q60 84 72 70 Q60 76 48 70',
    durmiendo: 'M55 74 q5 2 10 0',
    triste: 'M52 76 Q60 70 68 76',
  }[mood];

  const body = (
    <svg viewBox="0 0 120 130" width={size} height={(size * 130) / 120} className="overflow-visible">
      <defs>
        <linearGradient id="tdBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38D1F5" />
          <stop offset="100%" stopColor="#0090C1" />
        </linearGradient>
        <linearGradient id="tdBelly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0F7FF" />
          <stop offset="100%" stopColor="#B5EAFB" />
        </linearGradient>
      </defs>
      {/* antena */}
      <line x1="60" y1="18" x2="60" y2="6" stroke="#0077A3" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="5" r="5" fill={mood === 'fiesta' ? '#FACC15' : '#FF6B9D'}>
        {animate && (
          <animate attributeName="r" values="5;7;5" dur="1.2s" repeatCount="indefinite" />
        )}
      </circle>
      {/* orejas */}
      <rect x="14" y="48" width="10" height="22" rx="5" fill="#0077A3" />
      <rect x="96" y="48" width="10" height="22" rx="5" fill="#0077A3" />
      {/* cabeza */}
      <rect x="20" y="18" width="80" height="64" rx="26" fill="url(#tdBody)" stroke="#E8FAFF" strokeWidth="3" />
      {/* visor */}
      <rect x="28" y="34" width="64" height="34" rx="16" fill="#06283D" opacity="0.92" />
      {/* ojos */}
      <path d={eyes.l} stroke="#7DF9FF" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d={eyes.r} stroke="#7DF9FF" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {mood === 'fiesta' && (
        <>
          <circle cx="40" cy="42" r="2.4" fill="#FDE047" />
          <circle cx="80" cy="42" r="2.4" fill="#FDE047" />
        </>
      )}
      {/* boca */}
      <path d={mouth} stroke="#06283D" strokeWidth="3.5" fill={mood === 'fiesta' ? '#FF6B9D' : 'none'} strokeLinecap="round" />
      {/* mejillas */}
      <ellipse cx="34" cy="62" rx="5" ry="3.4" fill="#FF8FB3" opacity="0.8" />
      <ellipse cx="86" cy="62" rx="5" ry="3.4" fill="#FF8FB3" opacity="0.8" />
      {/* cuerpo */}
      <rect x="32" y="86" width="56" height="34" rx="16" fill="url(#tdBody)" stroke="#E8FAFF" strokeWidth="3" />
      <rect x="44" y="94" width="32" height="18" rx="9" fill="url(#tdBelly)" />
      <text x="60" y="108" textAnchor="middle" fontSize="12" fontWeight="900" fill="#0077A3" fontFamily="Nunito, sans-serif">
        TD
      </text>
      {/* brazos */}
      <rect x="18" y="92" width="10" height="20" rx="5" fill="#00A9D6" />
      <rect x="92" y="92" width="10" height="20" rx="5" fill="#00A9D6" />
      {mood === 'fiesta' && (
        <>
          <text x="12" y="30" fontSize="16">🎉</text>
          <text x="96" y="28" fontSize="16">⭐</text>
        </>
      )}
      {mood === 'pensando' && (
        <text x="92" y="18" fontSize="18">💭</text>
      )}
    </svg>
  );

  if (!animate) return body;
  return (
    <motion.div
      animate={mood === 'hablando' ? { y: [0, -3, 0], rotate: [0, -1.5, 1.5, 0] } : { y: [0, -5, 0] }}
      transition={{ duration: mood === 'hablando' ? 0.7 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
      className="origin-bottom"
    >
      {body}
    </motion.div>
  );
}
