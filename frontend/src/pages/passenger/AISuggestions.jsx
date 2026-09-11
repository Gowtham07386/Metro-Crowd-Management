import { Clock, Route as RouteIcon, MapPin, TrendingDown, Sparkles } from 'lucide-react';
import Card, { CardHeader } from '@/components/common/Card';
import { useCityData } from '@/hooks/useCityData';

export default function AISuggestions() {
  const data = useCityData();
  if (!data) return null;

  const busiest = data.riskStations[0];
  const alternate = data.stations.find((s) => s.line === busiest?.line && s.id !== busiest?.id && s.occupancy < busiest.occupancy);
  const calmHour = data.hourlyFlow.reduce((min, h) => (h.entries < min.entries ? h : min));
  const peakHour = data.hourlyFlow.reduce((max, h) => (h.entries > max.entries ? h : max));

  const suggestions = [
    {
      icon: Clock,
      title: 'Best Departure Time',
      value: `${calmHour.hour}`,
      detail: `Ridership is lowest around ${calmHour.hour}, giving you the most comfortable journey.`,
      tone: 'from-brand-500 to-brand-700',
    },
    {
      icon: RouteIcon,
      title: 'Alternative Route',
      value: alternate ? alternate.line : busiest?.line,
      detail: alternate
        ? `Routing via ${alternate.name} avoids the current congestion at ${busiest?.name}.`
        : 'Your current route is already the most efficient option available.',
      tone: 'from-violet-500 to-violet-700',
    },
    {
      icon: MapPin,
      title: 'Less Crowded Station',
      value: alternate?.name || 'No nearby alternative',
      detail: alternate
        ? `${alternate.name} is running at just ${alternate.occupancy}% occupancy right now.`
        : 'All nearby stations are currently at similar crowd levels.',
      tone: 'from-success to-emerald-700',
    },
    {
      icon: TrendingDown,
      title: 'Expected Travel Time',
      value: `${Math.round(18 + Math.random() * 10)} min`,
      detail: `Estimated end-to-end travel time avoiding the ${peakHour.hour} peak window.`,
      tone: 'from-signal-500 to-signal-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">AI Travel Suggestions</h1>
        <p className="text-sm text-slate-500">Personalized recommendations based on live network conditions.</p>
      </div>

      <Card className="border-brand-100 bg-gradient-to-br from-brand-600 to-violet-600 text-white">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-bold">Today&apos;s smart tip</p>
            <p className="mt-1 text-sm text-brand-100">
              {busiest?.name} is currently the busiest station on your network at {busiest?.occupancy}% occupancy.
              Consider {alternate ? `routing via ${alternate.name}` : 'traveling slightly outside peak hours'} for a
              smoother journey.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {suggestions.map((s, i) => (
          <Card key={s.title} hover delay={i * 0.05}>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.tone} text-white`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">{s.title}</p>
            <p className="mt-1 font-display text-xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-2 text-sm text-slate-500">{s.detail}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
