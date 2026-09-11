import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/hooks/useApp';
import { getInitials } from '@/utils/formatters';
import { ROUTES } from '@/constants';

/**
 * Shared "top right" profile menu used by both the passenger and admin
 * navbars. Renders the same trigger button style each navbar already had,
 * plus a dropdown with My Profile / Settings / Logout.
 */
export default function ProfileDropdown({ profileTo, settingsTo, avatarGradient = 'from-brand-500 to-violet-500' }) {
  const { user, logout } = useAuth();
  const { resetSelection } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    resetSelection();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 hover:bg-slate-50 focus-ring"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user?.profileImage ? (
          <img src={user.profileImage} alt="" className="h-7 w-7 rounded-lg object-cover" />
        ) : (
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${avatarGradient} text-xs font-bold text-white`}>
            {getInitials(user?.name)}
          </div>
        )}
        <span className="hidden text-sm font-medium text-slate-700 sm:block">{user?.name?.split(' ')[0] || 'Account'}</span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg animate-fade-in">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
          <div className="p-1.5">
            <Link to={profileTo} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" role="menuitem">
              <User className="h-4 w-4" /> My Profile
            </Link>
            <Link to={settingsTo} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" role="menuitem">
              <SettingsIcon className="h-4 w-4" /> Settings
            </Link>
            <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10" role="menuitem">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
