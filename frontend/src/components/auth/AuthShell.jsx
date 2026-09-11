import { motion, AnimatePresence } from 'framer-motion';
import { TrainFront, Gauge, BrainCircuit, ShieldCheck, X } from 'lucide-react';
import AuthenticationModal from '@/components/auth/AuthenticationModal';
import CreateAccountModal from '@/components/auth/CreateAccountModal';
import { APP_NAME } from '@/constants';

const SIDE_HIGHLIGHTS = [
  { icon: Gauge, text: 'Live crowd density, every platform' },
  { icon: BrainCircuit, text: 'AI-driven congestion forecasting' },
  { icon: ShieldCheck, text: 'Faster, safer incident response' },
];

/**
 * Single professional, full-screen authentication panel — glassmorphism,
 * background blur, split layout. Left: metro illustration + description.
 * Right: Sign In / Sign Up tabs. This is the ONLY authentication surface in
 * the app; Landing and the dedicated /login route both render this same
 * shell so there is never more than one login UI.
 */
export default function AuthShell({ view, onViewChange, onSignedIn, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full max-w-3xl overflow-hidden rounded-3xl border border-white/25 bg-white/10 shadow-2xl backdrop-blur-2xl"
    >
      {/* ===== Left: illustration + description ===== */}
      <div className="relative hidden w-2/5 shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700/60 via-brand-600/50 to-violet-700/50 p-7 md:flex">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-cyan-400/20 blur-2xl" />

        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
            <TrainFront className="h-6 w-6" />
          </div>
          <p className="mt-4 font-display text-lg font-bold text-white">{APP_NAME}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            One account for smarter, safer metro travel — live crowd visibility for passengers, and
            AI-powered monitoring and scheduling for operations teams.
          </p>
        </div>

        {/* Simple metro illustration */}
        <svg viewBox="0 0 220 90" className="relative my-4 h-20 w-full opacity-90">
          <line x1="0" y1="60" x2="220" y2="60" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="8 6" />
          {[24, 74, 124, 174].map((x) => (
            <circle key={x} cx={x} cy="60" r="3.5" fill="#ffbe4d" />
          ))}
          <motion.g animate={{ x: [-40, 200] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
            <rect x="0" y="42" width="46" height="18" rx="6" fill="#ffffff" fillOpacity="0.9" />
            <rect x="6" y="46" width="10" height="7" rx="1.5" fill="#2f5df0" />
            <rect x="20" y="46" width="10" height="7" rx="1.5" fill="#2f5df0" />
            <rect x="34" y="46" width="8" height="7" rx="1.5" fill="#2f5df0" />
          </motion.g>
        </svg>

        <ul className="relative space-y-2.5">
          {SIDE_HIGHLIGHTS.map((h) => (
            <li key={h.text} className="flex items-center gap-2.5 text-xs text-white/85">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                <h.icon className="h-3.5 w-3.5" />
              </span>
              {h.text}
            </li>
          ))}
        </ul>
      </div>

      {/* ===== Right: tabs + forms ===== */}
      <div className="relative w-full min-h-0 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain p-4 sm:p-6 md:w-3/5 md:p-7">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus-ring sm:right-4 sm:top-4"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="mb-5 flex items-center justify-center gap-2 md:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
            <TrainFront className="h-5 w-5" />
          </div>
          <span className="font-display text-base font-bold text-white">{APP_NAME}</span>
        </div>

        <div className="mb-6 flex rounded-2xl bg-white/10 p-1">
          <button
            type="button"
            onClick={() => onViewChange('login')}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors focus-ring ${
              view === 'login' ? 'bg-white text-brand-700 shadow' : 'text-white/75 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => onViewChange('register')}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors focus-ring ${
              view === 'register' ? 'bg-white text-brand-700 shadow' : 'text-white/75 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'login' ? (
            <AuthenticationModal key="login" onSignedIn={onSignedIn} onCreateAccount={() => onViewChange('register')} />
          ) : (
            <CreateAccountModal key="register" onBack={() => onViewChange('login')} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
