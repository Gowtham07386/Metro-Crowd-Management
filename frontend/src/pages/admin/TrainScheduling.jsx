import { Sparkles } from 'lucide-react';
import Card, { CardHeader } from '@/components/common/Card';
import Table from '@/components/common/Table';
import Badge, { statusToTone } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import ProgressBar from '@/components/charts/ProgressBar';
import { useCityData } from '@/hooks/useCityData';
import { useApp } from '@/hooks/useApp';
import { toast } from 'react-toastify';

export default function TrainScheduling() {
  const { city } = useApp();
  const data = useCityData();
  if (!data) return null;

  const { trains } = data;
  const running = trains.filter((t) => t.status === 'Running').length;
  const delayed = trains.filter((t) => t.status === 'Delayed').length;
  const maintenance = trains.filter((t) => t.status === 'Maintenance').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Train Scheduling</h1>
        <p className="text-sm text-slate-500">Frequency, platform assignment, and fleet status.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Running</p>
          <p className="font-display text-2xl font-bold text-success">{running}</p>
        </Card>
        <Card delay={0.05}>
          <p className="text-sm text-slate-500">Delayed</p>
          <p className="font-display text-2xl font-bold text-danger">{delayed}</p>
        </Card>
        <Card delay={0.1}>
          <p className="text-sm text-slate-500">Under maintenance</p>
          <p className="font-display text-2xl font-bold text-slate-500">{maintenance}</p>
        </Card>
      </div>

      <Card className="border-brand-100 bg-gradient-to-br from-brand-600 to-violet-600 text-white">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">AI Scheduling Suggestion</p>
            <p className="mt-1 text-sm text-brand-100">
              Increase frequency on {city.lines[0]?.name} to {data.aiPrediction.suggestedFrequency} during
              peak hours to reduce platform congestion by an estimated 18%.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="glass" onClick={() => toast.success('Suggestion applied to schedule.')}>
                Apply suggestion
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Line Frequency" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {city.lines.map((line) => {
            const lineTrains = trains.filter((t) => t.line === line.name);
            const avgFreq = lineTrains.reduce((s, t) => s + t.frequencyMin, 0) / (lineTrains.length || 1);
            return (
              <div key={line.name}>
                <ProgressBar label={`${line.name} — every ${avgFreq.toFixed(1)} min`} value={Math.min(100, Math.round((6 / avgFreq) * 100))} />
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title="Fleet Status" subtitle={`${trains.length} trains across the network`} />
        <Table
          columns={[
            { key: 'id', header: 'Train' },
            { key: 'line', header: 'Line' },
            { key: 'status', header: 'Status', render: (r) => <Badge tone={statusToTone(r.status)}>{r.status}</Badge> },
            { key: 'currentStation', header: 'Current Station' },
            { key: 'platform', header: 'Platform' },
            { key: 'frequencyMin', header: 'Frequency', render: (r) => `${r.frequencyMin} min` },
          ]}
          data={trains}
        />
      </Card>
    </div>
  );
}
