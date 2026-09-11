import { motion } from 'framer-motion';
import { CROWD_STATUS } from '@/constants';

function isStationOnLine(station, line) {
  if (!station || !station.line || !line || !line.name) return false;
  const target = line.name.trim().toLowerCase();
  const stLine = station.line.trim().toLowerCase();

  if (stLine === target) return true;

  const targetBase = target.replace(/\s+line$/i, '').trim();
  const stBase = stLine.replace(/\s+line$/i, '').trim();
  if (stBase === targetBase) return true;

  const parts = stLine.split(/[-/;]/).map((s) => s.trim());
  if (parts.includes(target) || parts.includes(targetBase)) return true;

  if (target === 'blue line') {
    return parts.some((sl) => sl === 'blue line' || (sl.includes('blue') && !sl.includes('branch')));
  }

  if (target === 'blue line branch') {
    return parts.some((sl) => sl.includes('branch') || sl.includes('vaishali') || sl === 'blue line branch');
  }

  return stLine.includes(target);
}

/**
 * Renders each metro line as a horizontal schematic track with station
 * nodes, in the style of a real transit map. Clicking a station calls
 * onStationClick(station). Colored ring around white node circle reflects live crowd status.
 */
export default function MetroLineDiagram({ lines, stations, onStationClick }) {
  if (!lines || !stations) return null;

  return (
    <div className="space-y-10">
      {lines.map((line) => {
        const lineStations = stations.filter((s) => isStationOnLine(s, line));
        if (lineStations.length === 0) return null;
        const width = Math.max(700, lineStations.length * 115);

        return (
          <div key={line.name} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-4 w-4 rounded-full shadow-sm" style={{ background: line.color }} />
                <p className="font-display text-base font-bold text-slate-800 dark:text-slate-100">{line.name}</p>
              </div>
              <span className="rounded-full bg-slate-200/60 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {lineStations.length} Stations
              </span>
            </div>
            <div className="overflow-x-auto pb-3">
              <svg width={width} height={120} className="block">
                {/* Metro Line Track */}
                <line x1={40} y1={55} x2={width - 40} y2={55} stroke={line.color} strokeWidth={6} strokeLinecap="round" opacity={0.9} />

                {/* Station Nodes */}
                {lineStations.map((station, i) => {
                  const x = 40 + (i * (width - 80)) / Math.max(1, lineStations.length - 1);
                  const statusKey = (station.status || '').toUpperCase();
                  const status = CROWD_STATUS[statusKey] || CROWD_STATUS.GREEN;

                  return (
                    <g key={station.id || i} onClick={() => onStationClick && onStationClick(station)} className="group cursor-pointer">
                      <title>{`${station.name} (${station.line}) — Crowd: ${station.occupancy || 0}%`}</title>
                      {/* Live Crowd Status Outer Ring */}
                      <motion.circle
                        cx={x}
                        cy={55}
                        r={10}
                        fill="#ffffff"
                        stroke={status.color}
                        strokeWidth={4.5}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: Math.min(0.8, 0.02 * i), type: 'spring', stiffness: 260, damping: 16 }}
                      />
                      {/* Inner Line Color Dot */}
                      <circle cx={x} cy={55} r={3.5} fill={line.color} />
                      {/* Station Name Label */}
                      <text
                        x={x}
                        y={82}
                        textAnchor="middle"
                        className="fill-slate-600 font-medium transition-colors group-hover:fill-slate-900 dark:fill-slate-400 dark:group-hover:fill-white"
                        style={{ fontSize: 10 }}
                      >
                        {station.name.length > 15 ? `${station.name.slice(0, 14)}…` : station.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
