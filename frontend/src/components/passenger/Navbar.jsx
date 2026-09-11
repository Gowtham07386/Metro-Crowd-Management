import { useState } from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';
import ProfileDropdown from '@/components/common/ProfileDropdown';
import ChangeCityModal from '@/components/modals/ChangeCityModal';
import { useApp } from '@/hooks/useApp';
import { ROUTES } from '@/constants';

export default function PassengerNavbar({ onOpenMobileMenu }) {
  const { city } = useApp();
  const [changeCityOpen, setChangeCityOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl px-4 lg:px-6">
        <button onClick={onOpenMobileMenu} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => setChangeCityOpen(true)}
          className="hidden items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-100 focus-ring sm:flex"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {city?.name}
        </button>

        <div className="hidden flex-1 max-w-md md:block">
          <SearchBar value={query} onChange={setQuery} placeholder="Search stations, routes…" />
        </div>
        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setChangeCityOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-brand-600 focus-ring sm:hidden"
            aria-label="Change city"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <ProfileDropdown profileTo={ROUTES.PASSENGER.PROFILE} settingsTo={ROUTES.PASSENGER.SETTINGS} />
        </div>
      </header>

      <ChangeCityModal isOpen={changeCityOpen} onClose={() => setChangeCityOpen(false)} />
    </>
  );
}
