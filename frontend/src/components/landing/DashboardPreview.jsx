import { Building2, TrainFront, Users, AlertTriangle, BrainCircuit, Activity } from 'lucide-react';
import Card, { CardHeader } from '@/components/common/Card';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';

const KPIS = [
  { label: 'Total Metro Stations', value: '312', icon: Building2, tone: 'from-brand-500 to-brand-700' },
  { label: 'Active Trains', value: '186', icon: TrainFront, tone: 'from-violet-500 to-violet-700' },
  { label: 'Daily Passenger Count', value: '24.6L', icon: Users, tone: 'from-signal-500 to-signal-700' },
  { label: 'Crowded Stations', value: '18', icon: AlertTriangle, tone: 'from-danger to-rose-700' },
  { label: 'AI Prediction Accuracy', value: '94.2%', icon: BrainCircuit, tone: 'from-emerald-500 to-emerald-700' },
  { label: 'Operational Status', value: 'All Systems Normal', icon: Activity, tone: 'from-slate-700 to-brand-800' },
];

// Illustrative sample only — the live, authenticated dashboards use real
// per-city generated data (see src/data/cityDataGenerator.js).
const SAMPLE_STATIONS = [
  { id: 1, name: 'Ameerpet', city: 'Hyderabad Metro', density: '82%', status: 'RED', crowd: 'Crowded', platform: 'Limited' },
  { id: 2, name: 'Rajiv Chowk', city: 'Delhi Metro', density: '76%', status: 'RED', crowd: 'Crowded', platform: 'Limited' },
  { id: 3, name: 'Andheri', city: 'Mumbai Metro', density: '61%', status: 'YELLOW', crowd: 'Moderate', platform: 'Available' },
  { id: 4, name: 'Anna Nagar', city: 'Chennai Metro', density: '48%', status: 'YELLOW', crowd: 'Moderate', platform: 'Available' },
  { id: 5, name: 'MG Road', city: 'Bengaluru Metro', density: '29%', status: 'GREEN', crowd: 'Normal', platform: 'Available' },
  { id: 6, name: 'Esplanade', city: 'Kolkata Metro', density: '33%', status: 'GREEN', crowd: 'Normal', platform: 'Available' },
];

const STATUS_TONE = { GREEN: 'success', YELLOW: 'warning', RED: 'danger' };

export default function DashboardPreview() {
  return (
    <div id="live-preview" className="scroll-mt-20">
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Live Preview</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">Platform at a Glance</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
          A snapshot of what operations teams see across the MetroFlow network — sample data shown, no sign-in required.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KPIS.map((kpi) => (
          <Card key={kpi.label} hover>
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.tone} text-white`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{kpi.label}</p>
                <p className="font-display text-lg font-bold text-slate-900">{kpi.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6" animate={false}>
        <CardHeader title="Metro Station Overview" subtitle="Example stations across the network" />
        <Table
          columns={[
            { key: 'name', header: 'Station Name' },
            { key: 'city', header: 'City' },
            { key: 'density', header: 'Passenger Density' },
            { key: 'crowd', header: 'Crowd Level' },
            { key: 'platform', header: 'Platform Availability' },
            { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.crowd}</Badge> },
          ]}
          data={SAMPLE_STATIONS}
        />
      </Card>
    </div>
  );
}
