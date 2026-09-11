import { useState } from 'react';
import { ArrowRightLeft, Search, Clock, IndianRupee, LayoutGrid, Users, Sparkles } from 'lucide-react';
import Card, { CardHeader } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge, { statusToTone } from '@/components/common/Badge';
import { useCityData } from '@/hooks/useCityData';

export default function JourneyPlanner() {
  const data = useCityData();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [result, setResult] = useState(null);

  if (!data) return null;
  const stationNames = Array.from(new Set(data.stations.map((s) => s.name))).sort((a, b) => a.localeCompare(b));

  const handleSearch = (e) => {
    e.preventDefault();
    if (!from || !to || from === to) return;

    const fromStation = data.stations.find((s) => s.name === from);
    const toStation = data.stations.find((s) => s.name === to);
    const distanceFactor = 2 + Math.random() * 6;
    const avgCrowd = Math.round(((fromStation?.occupancy || 40) + (toStation?.occupancy || 40)) / 2);

    setResult({
      estimatedTime: Math.round(8 + distanceFactor * 2.4),
      fare: Math.round(15 + distanceFactor * 4),
      platform: `P${Math.ceil(Math.random() * 2)}`,
      coach: avgCrowd > 70 ? 'Coach 1 (less crowded)' : 'Any coach',
      crowd: avgCrowd,
      fromStation,
      toStation,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Journey Planner</h1>
        <p className="text-sm text-slate-500">Plan your trip with real-time crowd and fare estimates.</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm focus-ring"
            >
              <option value="">Select origin station</option>
              {stationNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => { setFrom(to); setTo(from); }}
            className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-brand-600 focus-ring sm:mb-0.5"
            aria-label="Swap stations"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>

          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">To</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm focus-ring"
            >
              <option value="">Select destination station</option>
              {stationNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <Button type="submit" icon={Search} disabled={!from || !to || from === to}>
            Search
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="animate-fade-in">
          <CardHeader
            title={`${result.fromStation?.name} → ${result.toStation?.name}`}
            subtitle="Recommended journey details"
            action={
              <span className="flex items-center gap-1.5 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-600">
                <Sparkles className="h-3 w-3" /> AI optimized
              </span>
            }
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Metric icon={Clock} label="Estimated time" value={`${result.estimatedTime} min`} />
            <Metric icon={IndianRupee} label="Fare" value={`₹${result.fare}`} />
            <Metric icon={LayoutGrid} label="Platform" value={result.platform} />
            <Metric icon={Users} label="Expected crowd" value={`${result.crowd}%`} />
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-400">Recommended coach</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{result.coach}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-slate-400">Crowd status:</span>
            <Badge tone={statusToTone(result.crowd >= 90 ? 'RED' : result.crowd >= 70 ? 'ORANGE' : result.crowd >= 45 ? 'YELLOW' : 'GREEN')}>
              {result.crowd}% occupancy
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-1 font-display text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
