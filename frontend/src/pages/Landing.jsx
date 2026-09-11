import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Gauge, BrainCircuit, TrainFront } from 'lucide-react';
import LoginBackground from '@/components/auth/LoginBackground';
import LandingNavbar from '@/components/landing/LandingNavbar';
import DashboardPreview from '@/components/landing/DashboardPreview';
import NotificationPanel from '@/components/landing/NotificationPanel';
import FeaturesSection from '@/components/landing/FeaturesSection';
import StatsSection from '@/components/landing/StatsSection';
import ContactSection from '@/components/landing/ContactSection';
import AuthShell from '@/components/auth/AuthShell';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME, ROUTES } from '@/constants';

const HIGHLIGHTS = [
  { icon: Gauge, text: 'Real-time crowd density across every platform' },
  { icon: BrainCircuit, text: 'AI-driven demand forecasting and scheduling' },
  { icon: ShieldCheck, text: 'Faster incident response with live alerts' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  const openAuth = (view) => {
    if (isAuthenticated) {
      navigate(ROUTES.SELECT_ROLE);
      return;
    }
    setAuthView(view);
    setAuthOpen(true);
  };

  const handleSignedIn = () => {
    setAuthOpen(false);
    navigate(ROUTES.SELECT_ROLE);
  };

  return (
    <div className="relative">
      {/* ===== Hero ===== */}
      <section id="home" className="relative min-h-screen overflow-hidden">
        <LoginBackground />

        <div className="relative z-10 flex min-h-screen flex-col">
          <LandingNavbar
            onSignInClick={() => openAuth('login')}
            onSignUpClick={() => openAuth('register')}
            isAuthenticated={isAuthenticated}
            ctaLabel="Continue"
          />

          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="font-display text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
                Smarter Metro. Safer Passengers.
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-lg font-medium text-brand-100">
                {APP_NAME} — AI-Powered Metro Crowd Management &amp; Smart Scheduling Platform
              </p>
              <p className="mx-auto mt-4 max-w-xl text-sm text-white/70">
                Monitor passenger flow, predict crowd congestion, optimize train scheduling, and receive
                real-time operational insights across metro networks through an intelligent AI-powered
                platform.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button size="lg" onClick={() => openAuth('login')} className="shadow-2xl">
                  {isAuthenticated ? 'Continue to MetroFlow' : 'Get Started'}
                </Button>
                <Button
                  size="lg"
                  variant="glass"
                  onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                {HIGHLIGHTS.map((h) => (
                  <div key={h.text} className="flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-3 text-left backdrop-blur">
                    <h.icon className="h-4 w-4 shrink-0 text-signal-400" />
                    <span className="text-xs text-white/85">{h.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Dashboard preview + live notifications ===== */}
      <section className="bg-app-gradient px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <DashboardPreview />
          <div className="lg:sticky lg:top-8 lg:self-start">
            <NotificationPanel />
          </div>
        </div>
      </section>

      {/* ===== About ===== */}
      <section id="about" className="scroll-mt-20 bg-white px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">About MetroFlow</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Built for modern metro operations
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            MetroFlow is an AI-powered operations platform that gives metro authorities a single console
            for crowd management, train scheduling, and network analytics. Passengers get live crowd
            visibility and smarter journey planning, while operations teams get real-time monitoring,
            predictive congestion alerts, and data-driven scheduling recommendations — all tuned per
            metro city.
          </p>
        </div>
      </section>

      {/* ===== Features ===== */}
      <FeaturesSection />

      {/* ===== Statistics ===== */}
      <StatsSection />

      {/* ===== Contact ===== */}
      <ContactSection />

      {/* ===== Footer ===== */}
      <footer className="bg-hero-gradient px-5 py-10 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <TrainFront className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold">{APP_NAME}</span>
          </div>
          <p className="text-xs text-brand-300">
            © {new Date().getFullYear()} {APP_NAME}. All data shown on this page is illustrative.
          </p>
        </div>
      </footer>

      {/* ===== Sign In / Sign Up overlay ===== */}
      <AnimatePresence>
        {authOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-md"
            onClick={(e) => e.target === e.currentTarget && setAuthOpen(false)}
          >
            <AuthShell view={authView} onViewChange={setAuthView} onSignedIn={handleSignedIn} onClose={() => setAuthOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
