import { useState } from 'react';
import { MapPin, Menu } from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';
import ProfileDropdown from '@/components/common/ProfileDropdown';
import StationPickerModal from '@/components/modals/StationPickerModal';
import { useApp } from '@/hooks/useApp';
import { ROUTES } from '@/constants';

export default function AdminNavbar({ onOpenMobileMenu }) {
  const { city, station } = useApp();
  const [changeStationOpen, setChangeStationOpen] = useState(false);
  const [query, setQuery] = useState('');

  const label = station?.name || city?.name;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl px-4 lg:px-6">
        <button onClick={onOpenMobileMenu} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => setChangeStationOpen(true)}
          className="hidden items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-100 focus-ring sm:flex"
        >
          <MapPin className="h-3.5 w-3.5" />
          {label}
        </button>

        <div className="hidden flex-1 max-w-md md:block">
          <SearchBar value={query} onChange={setQuery} placeholder="Search stations, trains, reports…" />
        </div>
        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setChangeStationOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-brand-600 focus-ring sm:hidden"
            aria-label="Change station"
          >
            <MapPin className="h-4 w-4" />
          </button>

          <ProfileDropdown
            profileTo={ROUTES.ADMIN.PROFILE}
            settingsTo={ROUTES.ADMIN.SETTINGS}
            avatarGradient="from-slate-800 to-brand-700"
          />
        </div>
      </header>

      <StationPickerModal isOpen={changeStationOpen} onClose={() => setChangeStationOpen(false)} />
    </>
  );
}
