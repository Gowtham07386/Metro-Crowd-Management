import { TrainFront } from 'lucide-react';
import Button from '@/components/common/Button';
import { APP_NAME } from '@/constants';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Contact Us', href: '#contact' },
];

function scrollToSection(href) {
  const el = document.querySelector(href);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LandingNavbar({ onSignInClick, onSignUpClick, isAuthenticated = false, ctaLabel = 'Continue' }) {
  return (
    <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur">
          <TrainFront className="h-5 w-5" />
        </div>
        <span className="font-display text-lg font-bold text-white">{APP_NAME}</span>
      </div>

      <nav className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            onClick={() => scrollToSection(link.href)}
            className="text-sm font-medium text-white/80 transition-colors hover:text-white focus-ring rounded"
          >
            {link.label}
          </button>
        ))}
      </nav>

      {isAuthenticated ? (
        <Button variant="glass" onClick={onSignInClick} className="shrink-0">
          {ctaLabel}
        </Button>
      ) : (
        <div className="flex shrink-0 items-center gap-2.5">
          <Button variant="glass" onClick={onSignInClick} size="sm" className="sm:px-4 sm:py-2.5 sm:text-sm">
            Sign In
          </Button>
          <Button variant="primary" onClick={onSignUpClick} size="sm" className="sm:px-4 sm:py-2.5 sm:text-sm">
            Sign Up
          </Button>
        </div>
      )}
    </header>
  );
}
