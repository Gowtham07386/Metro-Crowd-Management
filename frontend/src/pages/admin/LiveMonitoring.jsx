import Card, { CardHeader } from "@/components/common/Card";
import Badge, { statusToTone } from "@/components/common/Badge";
import { useCityData } from "@/hooks/useCityData";
import { cn } from "@/utils/cn";

function levelToBg(occupancy) {
  if (occupancy >= 90) return "bg-danger text-white";
  if (occupancy >= 70) return "bg-signal-500 text-white";
  if (occupancy >= 45) return "bg-warning/80 text-white";
  return "bg-success/80 text-white";
}

export default function LiveMonitoring() {
  const data = useCityData();
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Live Monitoring</h1>
          <p className="text-sm text-slate-500">Network-wide crowd heatmap, refreshed in real time.</p>
        </div>
        <Badge tone="success" dot>Live</Badge>
      </div>

      <Card>
        <CardHeader title="Crowd Heatmap" subtitle={`${data.stations.length} stations monitored`} />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {data.stations.map((s) => (
            <div key={s.id} className={cn("flex flex-col justify-between rounded-xl p-3 shadow-sm transition-transform hover:-translate-y-0.5", levelToBg(s.occupancy))}>
              <p className="text-xs font-medium opacity-90 line-clamp-1">{s.name}</p>
              <p className="mt-3 font-display text-xl font-bold">{s.occupancy}%</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <LegendDot color="#17b26a" label="Low (<45%)" />
          <LegendDot color="#f79009" label="Moderate (45-70%)" />
          <LegendDot color="#f98407" label="High (70-90%)" />
          <LegendDot color="#f04438" label="Critical (90%+)" />
        </div>
      </Card>

      <Card>
        <CardHeader title="Active Incidents" subtitle="Trains currently delayed or under maintenance" />
        <div className="space-y-3">
          {data.trains.filter((t) => t.status !== "Running").map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5">
              <div>
                <p className="text-sm font-semibold text-slate-800">{t.id} — {t.line}</p>
                <p className="text-xs text-slate-400">
                  {t.status === "Delayed" ? `Delayed by ${t.delayMin} min near ${t.currentStation}` : `Under maintenance at ${t.currentStation}`}
                </p>
              </div>
              <Badge tone={statusToTone(t.status)}>{t.status}</Badge>
            </div>
          ))}
          {data.trains.every((t) => t.status === "Running") && (
            <p className="py-6 text-center text-sm text-slate-400">All trains running on schedule.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
