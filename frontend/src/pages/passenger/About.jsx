import { TrainFront, Building2, Route as RouteIcon, Users } from "lucide-react";
import Card from "@/components/common/Card";
import { useApp } from "@/hooks/useApp";
import { formatLakh } from "@/utils/formatters";

export default function About() {
  const { city } = useApp();
  if (!city) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">About {city.name}</h1>
        <p className="text-sm text-slate-500">Network overview for {city.state}.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card hover>
          <Building2 className="h-6 w-6 text-brand-600" />
          <p className="mt-3 font-display text-2xl font-bold text-slate-900">{city.stations}</p>
          <p className="text-sm text-slate-500">Stations across the network</p>
        </Card>
        <Card hover delay={0.05}>
          <RouteIcon className="h-6 w-6 text-violet-600" />
          <p className="mt-3 font-display text-2xl font-bold text-slate-900">{city.linesCount}</p>
          <p className="text-sm text-slate-500">Operational metro lines</p>
        </Card>
        <Card hover delay={0.1}>
          <Users className="h-6 w-6 text-signal-600" />
          <p className="mt-3 font-display text-2xl font-bold text-slate-900">{formatLakh(city.dailyPassengers)}</p>
          <p className="text-sm text-slate-500">Daily passengers</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white">
            <TrainFront className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">Our Lines</h3>
            <div className="mt-3 space-y-2.5">
              {city.lines.map((line) => (
                <div key={line.name} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <span className="h-3 w-3 rounded-full" style={{ background: line.color }} />
                  {line.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
