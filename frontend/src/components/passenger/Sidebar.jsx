import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Route as RouteIcon, Users, MapPinned, Sparkles, LifeBuoy, Info, LogOut, TrainFront, X,
} from 'lucide-react';
import { ROUTES, APP_NAME } from '@/constants';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/hooks/useApp';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Dashboard', to: ROUTES.PASSENGER.DASHBOARD, icon: LayoutDashboard },
  { label: 'Journey Planner', to: ROUTES.PASSENGER.JOURNEY_PLANNER, icon: RouteIcon },
  { label: 'Live Crowd', to: ROUTES.PASSENGER.LIVE_CROWD, icon: Users },
  { label: 'Metro Map', to: ROUTES.PASSENGER.METRO_MAP, icon: MapPinned },
  { label: 'AI Suggestions', to: ROUTES.PASSENGER.AI_SUGGESTIONS, icon: Sparkles },
  { label: 'Emergency Help', to: ROUTES.PASSENGER.EMERGENCY_HELP, icon: LifeBuoy },
  { label: 'About Metro', to: ROUTES.PASSENGER.ABOUT, icon: Info },
];

export default function PassengerSidebar({ isMobileOpen, onCloseMobile }) {
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
      {isMobileOpen && <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/70 bg-white/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-md shadow-brand-600/30">
              <TrainFront className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-none text-slate-900">{APP_NAME}</p>
              <p className="mt-0.5 text-[11px] leading-none text-slate-400">Passenger</p>
            </div>
          </div>
          <button onClick={onCloseMobile} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Close menu">
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
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/25'
                    : 'text-slate-600 hover:bg-slate-100'
                )
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger/10 focus-ring"
          >
            <LogOut className="h-4.5 w-4.5" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
