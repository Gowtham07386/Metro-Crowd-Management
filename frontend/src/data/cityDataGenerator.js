import { seededRandom } from '@/utils/formatters';
import { occupancyToStatus } from '@/constants';
import { getCityById } from '@/data/cities';
import { stationMasterData } from '@/data/stationMasterData';

const LINE_COLOR_MAP = {
  'Red': '#f04438',
  'Red Line': '#f04438',
  'Blue': '#2f5df0',
  'Blue Line': '#2f5df0',
  'Blue Line Branch': '#2563eb',
  'Blue Vaishali Branch': '#2563eb',
  'Green': '#17b26a',
  'Green Line': '#17b26a',
  'Green Kirti Nagar Branch': '#059669',
  'Purple': '#7c5cff',
  'Yellow': '#f7c948',
  'Yellow Line': '#f7c948',
  'Pink': '#f472b6',
  'Pink Line': '#f472b6',
  'Violet': '#a855f7',
  'Violet Line': '#a855f7',
  'Magenta': '#ec4899',
  'Magenta Line': '#ec4899',
  'Orange': '#f98407',
  'Aqua': '#06b6d4',
  'Grey': '#64748b',
  'Grey Line': '#64748b',
  'Dark Red': '#991b1b',
  'Light Blue': '#38bdf8',
  'Line 1': '#2f5df0',
  'Line 2': '#17b26a',
  'Line 2A': '#f7c948',
  'Line 3': '#7c5cff',
  'Line 4': '#f7c948',
  'Line 5': '#f472b6',
  'Line 6': '#f98407',
  'Line 7': '#f04438',
  'Airport Express': '#f98407',
  'Rapid Metro': '#3b82f6',
  'Western Metro Line': '#f98407',
  'Central Metro Line': '#7c5cff',
  'Harbour Metro Line': '#17b26a',
  'Thane Metro Line': '#ea580c',
  'Red Dotted Corridor': '#ef4444',
  'Light Blue Corridor': '#38bdf8',
  'N-S Corridor (Elevated)': '#2f5df0',
  'N-S Corridor (Underground)': '#f04438',
  'E-W Corridor': '#991b1b',
  'Kochi Metro': '#f04438',
  'Operational': '#f04438',
  'Under Construction': '#f04438',
  'Proposed Metro - Under Construction': '#b91c1c',
  'Proposed': '#2f5df0',
  'Proposed Metro': '#eab308',
  'Proposed Metro Extension': '#f97316',
  'Proposed Metro - Extension': '#f59e0b',
  'Proposed Metro - Extension 2': '#06b6d4',
  'Proposed Metro - Extension 3': '#6366f1',
};

export function getLineColor(lineName) {
  if (!lineName) return '#2f5df0';
  if (LINE_COLOR_MAP[lineName]) return LINE_COLOR_MAP[lineName];
  const firstPart = (lineName || '').split('-')[0].trim();
  if (LINE_COLOR_MAP[firstPart]) return LINE_COLOR_MAP[firstPart];

  const lower = lineName.toLowerCase();
  if (lower.includes('red')) return '#f04438';
  if (lower.includes('yellow')) return '#f7c948';
  if (lower.includes('blue')) return lower.includes('light') ? '#38bdf8' : '#2f5df0';
  if (lower.includes('green')) return '#17b26a';
  if (lower.includes('purple')) return '#7c5cff';
  if (lower.includes('pink')) return '#f472b6';
  if (lower.includes('violet')) return '#a855f7';
  if (lower.includes('magenta')) return '#ec4899';
  if (lower.includes('orange')) return '#f98407';
  if (lower.includes('aqua')) return '#06b6d4';
  if (lower.includes('grey') || lower.includes('gray')) return '#64748b';
  return '#2f5df0';
}


const cache = new Map();

/**
 * Generates an authentic city dataset using real station master data from station_master.csv.
 * Cached per city so repeated calls return consistent objects across pages.
 */
export function generateCityData(cityId) {
  if (!cityId) return null;
  const normalizedId = cityId.toLowerCase();
  const masterStations = stationMasterData[normalizedId] || [];

  if (cache.has(normalizedId)) {
    const cached = cache.get(normalizedId);
    if (cached && cached.stations && cached.stations.length === masterStations.length) {
      return cached;
    }
    cache.delete(normalizedId);
  }

  const city = getCityById(normalizedId);
  if (!city) return null;

  const rand = seededRandom(normalizedId);

  const stations = masterStations.map((st, i) => {
    const occupancy = Math.round(20 + rand() * 75);
    const status = occupancyToStatus(occupancy);
    const waitingTime = Number((1.5 + rand() * 8.5).toFixed(1));
    const currentCrowd = Math.round((occupancy / 100) * 1800);
    const lineColor = getLineColor(st.line);

    return {
      id: st.id,
      name: st.name,
      line: st.line,
      lineColor,
      occupancy,
      currentCrowd,
      waitingTime,
      status: status.key,
      statusLabel: status.label,
      statusColor: status.color,
      peakHours: i % 2 === 0 ? '08:00 – 10:00' : '17:30 – 19:30',
      lineIndex: 0,
      positionInLine: i,
    };
  });

  const totalTrainsCount = city.totalTrains || 30;
  const trains = Array.from({ length: totalTrainsCount }).map((_, i) => {
    const line = city.lines[i % city.lines.length];
    const load = Math.round(300 + rand() * 1300);
    const capacity = 1800;
    const statusRoll = rand();
    const status = statusRoll > 0.88 ? 'Delayed' : statusRoll > 0.82 ? 'Maintenance' : 'Running';
    const lineStations = stations.filter((s) => s.line.includes(line.name) || line.name.includes(s.line.split('-')[0]));
    const currentIdx = Math.floor(rand() * (lineStations.length || 1));
    const nextIdx = (currentIdx + 1) % (lineStations.length || 1);
    const current = lineStations[currentIdx]?.name || stations[0]?.name || `${line.name} Terminal`;
    const next = lineStations[nextIdx]?.name || stations[stations.length - 1]?.name || `${line.name} Terminal`;

    return {
      id: `${normalizedId.toUpperCase()}-TRN-${String(i + 1).padStart(3, '0')}`,
      line: line.name,
      lineColor: line.color,
      status,
      currentStation: current,
      nextStation: next,
      load: status === 'Maintenance' ? 0 : load,
      capacity,
      delayMin: status === 'Delayed' ? Math.round(3 + rand() * 8) : 0,
      platform: `P${(i % 2) + 1}`,
      frequencyMin: Math.round(4 + rand() * 4),
    };
  });

  const hourlyFlow = [
    '05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00',
    '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00',
  ].map((hour, i) => {
    const shapeAM = Math.exp(-Math.pow(i - 3, 2) / 6);
    const shapePM = Math.exp(-Math.pow(i - 13, 2) / 8);
    const base = (shapeAM * 0.6 + shapePM * 0.75 + 0.08) * (city.dailyPassengers / 11);
    const noise = 0.85 + rand() * 0.3;
    const entries = Math.round(base * noise);
    const exits = Math.round(base * (0.7 + rand() * 0.5));
    return { hour, entries, exits };
  });

  const weekly = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
    const weekendBoost = i >= 5 ? 0.75 : 1;
    const noise = 0.9 + rand() * 0.2;
    return { day, riders: Math.round(city.dailyPassengers * weekendBoost * noise) };
  });

  const monthly = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month) => {
    const noise = 0.92 + rand() * 0.18;
    return { month, riders: Number(((city.dailyPassengers * 28 * noise) / 1_000_000).toFixed(1)) };
  });

  const riskStations = [...stations]
    .sort((a, b) => b.occupancy - a.occupancy)
    .slice(0, 8)
    .map((s) => ({
      ...s,
      risk: s.occupancy >= 85 ? 'Critical' : s.occupancy >= 65 ? 'High' : s.occupancy >= 40 ? 'Medium' : 'Low',
    }));

  const alerts = riskStations
    .filter((s) => s.occupancy >= 65)
    .slice(0, 5)
    .map((s, i) => ({
      id: `${normalizedId}-alert-${i + 1}`,
      severity: s.occupancy >= 85 ? 'critical' : 'warning',
      title: `${s.occupancy >= 85 ? 'Peak Overcrowding' : 'High Demand Alert'} — ${s.name}`,
      message: `${s.name} is currently at ${s.occupancy}% crowd capacity on the ${s.line} with an estimated wait time of ${s.waitingTime} mins.`,
      station: s.name,
      time: new Date(Date.now() - i * 5 * 60000).toISOString(),
      read: i > 0,
    }));

  const aiPrediction = {
    peakStation: riskStations[0]?.name || stations[0]?.name || 'Central Station',
    futureCrowd: hourlyFlow.map((h) => ({
      hour: h.hour,
      predicted: Math.round(h.entries * (1.05 + rand() * 0.15)),
    })),
    suggestedFrequency: `${Math.max(3, Math.round(6 - rand() * 2))} min`,
    confidence: Math.round(78 + rand() * 18),
    congestionTrend: rand() > 0.5 ? 'rising' : 'stable',
  };

  const users = [
    { id: `${normalizedId}-usr-1`, name: 'Ananya Sharma', role: 'Passenger', email: 'ananya.sharma@example.com', status: 'Active' },
    { id: `${normalizedId}-usr-2`, name: 'Rohit Verma', role: 'Passenger', email: 'rohit.verma@example.com', status: 'Active' },
    { id: `${normalizedId}-usr-3`, name: 'Fatima Sheikh', role: 'Operator', email: 'fatima.sheikh@example.com', status: 'Active' },
    { id: `${normalizedId}-usr-4`, name: 'Karthik Iyer', role: 'Operator', email: 'karthik.iyer@example.com', status: 'Suspended' },
    { id: `${normalizedId}-usr-5`, name: 'Priya Nair', role: 'Administrator', email: 'priya.nair@example.com', status: 'Active' },
    { id: `${normalizedId}-usr-6`, name: 'Arjun Mehta', role: 'Administrator', email: 'arjun.mehta@example.com', status: 'Active' },
  ];

  const data = {
    city,
    stations,
    trains,
    hourlyFlow,
    weekly,
    monthly,
    riskStations,
    alerts,
    aiPrediction,
    users,
  };

  cache.set(normalizedId, data);
  return data;
}

export function updateCityData(cityId) {
  if (!cityId) return null;
  const normalizedId = cityId.toLowerCase();
  const current = cache.get(normalizedId);
  if (!current) return generateCityData(cityId);

  // Fluctuate occupancies by +/- 2 to 5 %
  const updatedStations = current.stations.map((st) => {
    const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
    const newOccupancy = Math.max(15, Math.min(98, st.occupancy + delta));
    const status = occupancyToStatus(newOccupancy);
    const waitingTime = Number((Math.max(1.0, (newOccupancy / 100) * 8.5)).toFixed(1));
    const currentCrowd = Math.round((newOccupancy / 100) * 1800);

    return {
      ...st,
      occupancy: newOccupancy,
      status: status.key,
      statusLabel: status.label,
      statusColor: status.color,
      waitingTime,
      currentCrowd,
    };
  });

  const updatedRisk = [...updatedStations]
    .sort((a, b) => b.occupancy - a.occupancy)
    .slice(0, 8)
    .map((s) => ({
      ...s,
      risk: s.occupancy >= 85 ? 'Critical' : s.occupancy >= 65 ? 'High' : s.occupancy >= 40 ? 'Medium' : 'Low',
    }));

  const updatedAlerts = updatedRisk
    .filter((s) => s.occupancy >= 65)
    .slice(0, 5)
    .map((s, i) => ({
      id: `${normalizedId}-alert-${Date.now()}-${i + 1}`,
      severity: s.occupancy >= 85 ? 'critical' : 'warning',
      title: `${s.occupancy >= 85 ? 'Peak Overcrowding' : 'High Demand Alert'} — ${s.name}`,
      message: `${s.name} is currently at ${s.occupancy}% crowd capacity on the ${s.line} with an estimated wait time of ${s.waitingTime} mins.`,
      station: s.name,
      time: new Date().toISOString(),
      read: false,
    }));

  const updatedData = {
    ...current,
    stations: updatedStations,
    riskStations: updatedRisk,
    alerts: updatedAlerts,
  };

  cache.set(normalizedId, updatedData);
  return updatedData;
}

export function clearCityDataCache() {
  cache.clear();
}

