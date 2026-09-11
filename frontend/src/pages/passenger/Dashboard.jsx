import { Users, MapPin, Activity, Clock, TrainFront } from 'lucide-react';
import Card, { CardHeader } from '@/components/common/Card';
import Badge, { statusToTone } from '@/components/common/Badge';
import CountUp from '@/components/common/CountUp';
import { useCityData } from '@/hooks/useCityData';
import { useApp } from '@/hooks/useApp';

export default function PassengerDashboard() {
  const { city } = useApp();
  const data = useCityData();
  if (!data) return null;

  const { stations, riskStations } = data;
  const avgOccupancy = Math.round(stations.reduce((s, st) => s + st.occupancy, 0) / stations.length);
  const nearestStation = stations[0];
  const avgWait = Math.round(stations.reduce((s, st) => s + st.waitingTime, 0) / stations.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          Welcome to <span className="text-gradient">{city?.name}</span>
        </h1>
        <p className="text-sm text-slate-500">Here&apos;s the current status of your metro network.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card hover delay={0}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Current crowd</p>
              <p className="font-display text-xl font-bold text-slate-900">
                <CountUp value={avgOccupancy} formatter={(v) => `${Math.round(v)}%`} />
              </p>
            </div>
          </div>
        </Card>
        <Card hover delay={0.05}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Nearest station</p>
              <p className="font-display text-base font-bold text-slate-900">{nearestStation?.name}</p>
            </div>
          </div>
        </Card>
        <Card hover delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-success to-emerald-700 text-white">
              <TrainFront className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Metro status</p>
              <p className="font-display text-base font-bold text-slate-900">All lines running</p>
            </div>
          </div>
        </Card>
        <Card hover delay={0.15}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-signal-500 to-signal-700 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Avg. waiting time</p>
              <p className="font-display text-xl font-bold text-slate-900">
                <CountUp value={avgWait} formatter={(v) => `${Math.round(v)} min`} />
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Operational Lines" subtitle={`${city?.lines.length} lines serving ${city?.name}`} />
          <div className="space-y-3">
            {city?.lines.map((line) => (
              <div key={line.name} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: line.color }} />
                  <span className="text-sm font-medium text-slate-700">{line.name}</span>
                </div>
                <Badge tone="success" dot>Operational</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Busiest Right Now" subtitle="Top 4 stations by crowd" />
          <div className="space-y-3">
            {riskStations.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-sm text-slate-600">{s.name}</span>
                </div>
                <Badge tone={statusToTone(s.status)}>{s.occupancy}%</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
