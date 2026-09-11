import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey || p.name} className="flex items-center gap-1.5 text-slate-500">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          {p.name}: <span className="font-medium text-slate-700">{Number(p.value).toLocaleString('en-IN')}</span>
        </p>
      ))}
    </div>
  );
}

export function FlowAreaChart({ data, xKey, series, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} className="text-slate-400" tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} className="text-slate-400" tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} fill={`url(#fill-${s.key})`} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ForecastLineChart({ data, xKey, height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="fill-predicted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c5cff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7c5cff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} className="text-slate-400" tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} className="text-slate-400" tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="predicted" name="Predicted riders" stroke="#7c5cff" strokeWidth={2.5} fill="url(#fill-predicted)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RidershipBarChart({ data, xKey, yKey, height = 280, color = '#2f5df0' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} className="text-slate-400" tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} className="text-slate-400" tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({ data, xKey, series, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} className="text-slate-400" tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} className="text-slate-400" tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.5} dot={{ r: 3 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data = [], height = 210, colors }) {
  const palette = colors || ['#2f5df0', '#7c5cff', '#f98407', '#17b26a', '#f04438', '#f7c948', '#ec4899', '#a855f7', '#06b6d4', '#64748b'];

  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={3}
            >
              {data.map((entry, i) => (
                <Cell key={entry.name || i} fill={entry.color || palette[i % palette.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {total > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-medium text-slate-400">Total Inflow</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              {total >= 100000 ? `${(total / 100000).toFixed(1)}L` : total.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>

      <div className="w-full max-h-40 overflow-y-auto pr-1 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        {data.map((entry, i) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
          const color = entry.color || palette[i % palette.length];
          return (
            <div key={entry.name || i} className="flex items-center justify-between gap-1.5 truncate py-0.5">
              <div className="flex items-center gap-1.5 truncate">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <span className="truncate text-slate-600 font-medium dark:text-slate-300" title={entry.name}>
                  {entry.name}
                </span>
              </div>
              <span className="shrink-0 text-slate-400 font-semibold text-[11px]">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
