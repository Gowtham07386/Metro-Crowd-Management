import { motion } from 'framer-motion';
import { Users, BrainCircuit, CalendarClock, BarChart3, BellRing, Flame, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { icon: Users, title: 'Crowd Monitoring', text: 'Real-time passenger density across every platform and coach, updated live.' },
  { icon: BrainCircuit, title: 'AI Prediction', text: 'Forecast congestion before it happens using historical and live ridership patterns.' },
  { icon: CalendarClock, title: 'Smart Scheduling', text: 'AI-recommended train frequency and dispatch to match actual demand.' },
  { icon: BarChart3, title: 'Analytics', text: 'Network-wide dashboards covering ridership, punctuality, and station performance.' },
  { icon: BellRing, title: 'Alerts', text: 'Instant notifications for overcrowding, delays, and operational incidents.' },
  { icon: Flame, title: 'Heatmaps', text: 'Visual crowd-density heatmaps across stations, platforms, and peak windows.' },
  { icon: ShieldCheck, title: 'Security', text: 'Faster incident response with live monitoring and verified operator access.' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 bg-app-gradient px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Features</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Everything metro operations need, in one platform
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            From live crowd visibility to AI-driven forecasting, MetroFlow brings every operational
            signal into a single, modern console.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="group relative overflow-hidden rounded-2xl glass-panel p-6 transition-shadow hover:shadow-premium"
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 opacity-10 blur-2xl transition-opacity group-hover:opacity-20" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="relative mt-4 font-display text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-slate-500">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
