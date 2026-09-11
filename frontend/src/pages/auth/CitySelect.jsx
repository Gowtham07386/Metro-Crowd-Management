import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrainFront, Check, ArrowRight, MapPinned } from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';
import Button from '@/components/common/Button';
import { cities } from '@/data/cities';
import { useApp } from '@/hooks/useApp';
import { formatLakh } from '@/utils/formatters';
import { ROLES, ROUTES } from '@/constants';

export default function CitySelect() {
  const { role, setCityId } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(
    () => cities.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.state.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const handleContinue = () => {
    if (!selected) return;
    setCityId(selected);
    const dest = role === ROLES.ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.PASSENGER.DASHBOARD;
    navigate(dest);
  };

  return (
    <div className="min-h-screen bg-app-gradient px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Select Metro City</h1>
          <p className="mt-2 text-sm text-slate-500">Choose the metro city you want to explore.</p>
        </div>

        <div className="mx-auto mb-8 max-w-md">
          <SearchBar value={query} onChange={setQuery} placeholder="Search Metro City…" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((city, i) => {
            const isSelected = selected === city.id;
            return (
              <motion.button
                key={city.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                whileHover={{ y: -4 }}
                onClick={() => setSelected(city.id)}
                className={`relative overflow-hidden rounded-2xl glass-panel p-5 text-left transition-shadow focus-ring ${
                  isSelected ? 'ring-2 ring-brand-500 shadow-premium' : 'hover:shadow-premium'
                }`}
              >
                {isSelected && (
                  <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-md">
                  <TrainFront className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{city.name}</h3>
                <p className="text-xs text-slate-400">{city.state}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 py-2">
                    <p className="text-sm font-bold text-slate-800">{city.stations}</p>
                    <p className="text-[10px] text-slate-400">Stations</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 py-2">
                    <p className="text-sm font-bold text-slate-800">{city.linesCount}</p>
                    <p className="text-[10px] text-slate-400">Lines</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 py-2">
                    <p className="text-sm font-bold text-slate-800">{formatLakh(city.dailyPassengers)}</p>
                    <p className="text-[10px] text-slate-400">Daily</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400">
            <MapPinned className="h-8 w-8" />
            <p>No metro city matches &quot;{query}&quot;.</p>
          </div>
        )}

        <div className="sticky bottom-6 z-10 mt-10 flex justify-center">
          <Button size="lg" icon={ArrowRight} iconPosition="right" disabled={!selected} onClick={handleContinue} className="shadow-2xl">
            Continue
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
