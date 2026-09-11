import { motion } from 'framer-motion';
import { TrainFront } from 'lucide-react';
import { APP_NAME } from '@/constants';

/**
 * Full-screen splash shown once when the app boots, before the Home page
 * is revealed. Purely presentational — App.jsx controls how long it stays
 * mounted and fades it out via AnimatePresence.
 */
export default function SplashScreen() {
  const particles = Array.from({ length: 22 });

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-hero-gradient"
    >
      {/* Ambient glow blobs */}
      <motion.div
        className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, -25, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="bg-mesh-dots absolute inset-0 opacity-[0.08]" />

      {/* Subtle floating particles */}
      {particles.map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${(i * 43) % 100}%`,
            top: `${(i * 61) % 100}%`,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
          }}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [1, 1.7, 1] }}
          transition={{ duration: 2.5 + (i % 4), repeat: Infinity, delay: i * 0.15 }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-white shadow-2xl backdrop-blur"
        >
          <motion.span
            className="absolute inset-0 rounded-3xl border border-white/40"
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <TrainFront className="h-10 w-10" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-6 font-display text-3xl font-extrabold text-white sm:text-4xl"
        >
          {APP_NAME}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-2 text-sm font-medium tracking-wide text-brand-100"
        >
          AI Powered Metro Crowd Management System
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 flex items-center gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-white"
              animate={{ opacity: [0.25, 1, 0.25], y: [0, -5, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
