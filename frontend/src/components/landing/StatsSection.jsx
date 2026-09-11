import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, TrainFront, Users, BrainCircuit } from 'lucide-react';
import CountUp from '@/components/common/CountUp';

const STATS = [
  { icon: Building2, value: 312, suffix: '', label: 'Metro Stations Covered' },
  { icon: TrainFront, value: 6, suffix: '', label: 'Metro Cities Supported' },
  { icon: Users, value: 24.6, suffix: 'L', label: 'Daily Passengers Tracked', decimals: 1 },
  { icon: BrainCircuit, value: 94.2, suffix: '%', label: 'AI Prediction Accuracy', decimals: 1 },
];

export default function StatsSection() {
  const [inView, setInView] = useState(false);

  return (
    <section className="bg-hero-gradient px-5 py-16 sm:px-8 lg:px-12">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        onViewportEnter={() => setInView(true)}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-200">By The Numbers</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">Trusted at metro scale</h2>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/15 bg-white/5 p-5 text-center backdrop-blur">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                <s.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold text-white sm:text-3xl">
                {inView ? (
                  <CountUp
                    value={s.value}
                    formatter={(v) => (s.decimals ? v.toFixed(s.decimals) : Math.round(v).toLocaleString('en-IN'))}
                  />
                ) : (
                  0
                )}
                {s.suffix}
              </p>
              <p className="mt-1 text-xs text-brand-100">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
