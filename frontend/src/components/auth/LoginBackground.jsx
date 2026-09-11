import { motion } from 'framer-motion';

/**
 * Purely decorative, full-screen background for the Login page: gradient
 * sky, city skyline, elevated track with an animated moving train, route
 * lines, and floating glow orbs. No interactive elements live here.
 */
export default function LoginBackground() {
  const buildings = [
    { x: 0, w: 60, h: 140 }, { x: 65, w: 40, h: 100 }, { x: 110, w: 55, h: 175 },
    { x: 170, w: 45, h: 90 }, { x: 220, w: 65, h: 150 }, { x: 290, w: 40, h: 115 },
    { x: 335, w: 60, h: 190 }, { x: 400, w: 45, h: 100 }, { x: 450, w: 55, h: 160 },
    { x: 510, w: 40, h: 95 }, { x: 555, w: 60, h: 170 }, { x: 620, w: 45, h: 120 },
    { x: 670, w: 55, h: 155 }, { x: 730, w: 40, h: 100 }, { x: 775, w: 65, h: 180 },
    { x: 845, w: 45, h: 110 }, { x: 895, w: 55, h: 165 }, { x: 955, w: 45, h: 95 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden bg-hero-gradient">
      {/* Aurora gradient blobs */}
      <motion.div
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-400/30 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 top-1/4 h-[28rem] w-[28rem] rounded-full bg-violet-500/30 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="bg-mesh-dots absolute inset-0 opacity-[0.08]" />

      {/* Floating light particles */}
      {[...Array(16)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 90}%`,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            opacity: 0.4,
          }}
          animate={{ opacity: [0.15, 0.85, 0.15], scale: [1, 1.6, 1] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      {/* City skyline + elevated track + train, anchored to the bottom */}
      <svg viewBox="0 0 1000 260" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[46%] w-full sm:h-[52%]">
        {/* skyline */}
        <g opacity="0.5">
          {buildings.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={260 - b.h} width={b.w} height={b.h} fill="#ffffff" fillOpacity="0.08" />
              {Array.from({ length: Math.floor(b.h / 22) }).map((_, r) => (
                <rect key={r} x={b.x + 8} y={260 - b.h + 12 + r * 22} width={6} height={8} fill="#ffd98a" fillOpacity={(i + r) % 3 === 0 ? 0.8 : 0.15} />
              ))}
            </g>
          ))}
        </g>

        {/* elevated guideway */}
        <rect x="0" y="196" width="1000" height="10" fill="#0b1338" fillOpacity="0.5" />
        <line x1="0" y1="201" x2="1000" y2="201" stroke="#5586fc" strokeWidth="2" strokeDasharray="14 10" opacity="0.7" />
        {Array.from({ length: 34 }).map((_, i) => (
          <rect key={i} x={i * 30} y="206" width="6" height="26" fill="#0b1338" fillOpacity="0.45" />
        ))}

        {/* stations along the track */}
        {[90, 320, 560, 800].map((x, i) => (
          <g key={x}>
            <rect x={x - 26} y="170" width="52" height="26" rx="6" fill="#ffffff" fillOpacity="0.14" stroke="#ffffff" strokeOpacity="0.3" />
            <motion.circle
              cx={x}
              cy="183"
              r="4"
              fill="#ffbe4d"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          </g>
        ))}

        {/* animated moving train */}
        <motion.g
          animate={{ x: [-140, 1140] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        >
          <rect x="0" y="176" width="120" height="24" rx="8" fill="url(#trainGradient)" />
          {[16, 44, 72, 100].map((wx) => (
            <rect key={wx} x={wx} y="182" width="16" height="10" rx="2" fill="#0b1338" fillOpacity="0.6" />
          ))}
          <circle cx="18" cy="200" r="5" fill="#0b1338" />
          <circle cx="102" cy="200" r="5" fill="#0b1338" />
          <rect x="-6" y="184" width="8" height="8" rx="4" fill="#ffbe4d" />
        </motion.g>

        <defs>
          <linearGradient id="trainGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5586fc" />
            <stop offset="50%" stopColor="#7c5cff" />
            <stop offset="100%" stopColor="#2f5df0" />
          </linearGradient>
        </defs>
      </svg>

      {/* subtle vignette so the popup stays readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-slate-950/40" />
    </div>
  );
}
