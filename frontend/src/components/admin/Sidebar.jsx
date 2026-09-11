import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Radio, Building2, CalendarClock, BrainCircuit, FileBarChart, Users, LogOut, ShieldCheck, X,
} from 'lucide-react';
import { ROUTES, APP_NAME } from '@/constants';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/hooks/useApp';

const NAV_ITEMS = [
  { label: 'Dashboard', to: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
  { label: 'Analytics', to: ROUTES.ADMIN.ANALYTICS, icon: BarChart3 },
  { label: 'Live Monitoring', to: ROUTES.ADMIN.LIVE_MONITORING, icon: Radio },
  { label: 'Station Management', to: ROUTES.ADMIN.STATIONS, icon: Building2 },
  { label: 'Train Scheduling', to: ROUTES.ADMIN.SCHEDULING, icon: CalendarClock },
  { label: 'AI Prediction', to: ROUTES.ADMIN.AI_PREDICTION, icon: BrainCircuit },
  { label: 'Reports', to: ROUTES.ADMIN.REPORTS, icon: FileBarChart },
  { label: 'User Management', to: ROUTES.ADMIN.USERS, icon: Users },
];

export default function AdminSidebar({ isMobileOpen, onCloseMobile }) {
  const { logout } = useAuth();
  const { resetSelection } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    resetSelection();
    navigate(ROUTES.LOGIN);
  };

  return (
    <>
      {isMobileOpen && <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-gradient-to-b from-slate-950 via-brand-950 to-slate-950 text-white transition-transform duration-300 lg:static lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 shadow-md shadow-brand-600/40">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-none">{APP_NAME}</p>
              <p className="mt-0.5 text-[11px] leading-none text-brand-300">Operations Control</p>
            </div>
          </div>
          <button onClick={onCloseMobile} className="rounded-lg p-1 text-brand-200 hover:bg-white/10 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-ring',
                  isActive ? 'bg-white/10 text-white shadow-inner' : 'text-brand-200 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/10 focus-ring">
            <LogOut className="h-4.5 w-4.5" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
