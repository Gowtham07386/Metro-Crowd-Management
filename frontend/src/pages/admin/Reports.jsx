import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

import Card, { CardHeader } from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { useApp } from '@/hooks/useApp';
import { generateCityData, updateCityData } from '@/data/cityDataGenerator';

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

const API_PREFIX = RAW_API_URL.endsWith('/api')
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/+$/, '')}/api`;

export default function Reports() {
  const { city } = useApp();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadTrafficAnalysis(isSilent = false) {
      if (!isSilent) setLoading(true);
      setError('');

      const rawCityName = city?.name || 'Hyderabad';
      const cityName = rawCityName.replace(/\s+Metro$/i, '').trim();
      const currentCityId = city?.id || String(cityName).toLowerCase();

      // Trigger fluctuation for local station dataset on 5-min polling
      if (isSilent) {
        updateCityData(currentCityId);
      }

      let reportData = null;

      // 1. Try FastAPI backend endpoints (/admin/analytics/{city_id}, /admin/reports/{city_id}, /traffic-analysis)
      try {
        const primaryUrl = `${API_PREFIX}/admin/analytics/${encodeURIComponent(currentCityId)}`;
        let response = await fetch(primaryUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          const fallbackUrl = `${API_PREFIX}/admin/reports/${encodeURIComponent(currentCityId)}`;
          response = await fetch(fallbackUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
        }

        if (!response.ok) {
          const fallbackUrl2 = `${API_PREFIX}/traffic-analysis?city=${encodeURIComponent(cityName)}`;
          response = await fetch(fallbackUrl2, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
        }

        if (response.ok) {
          reportData = await response.json();
        }
      } catch (err) {
        console.warn('Reports backend fetch warning:', err);
      }

      // 2. Fallback to local station master data generator
      if (!reportData || !reportData.stations || reportData.stations.length === 0) {
        const cityData = updateCityData(currentCityId) || generateCityData(currentCityId);
        if (cityData && Array.isArray(cityData.stations)) {
          const stations = cityData.stations.map((s) => {
            const entryCount = s.entryCount || s.currentCrowd || 850;
            const exitCount = s.exitCount || Math.round(entryCount * 0.85);
            const netFlow = s.netFlow ?? (entryCount - exitCount);
            return {
              id: s.id,
              name: s.name,
              line: s.line,
              lineColor: s.lineColor,
              entryCount,
              exitCount,
              netFlow,
              predictedOccupancy: s.occupancy || 50,
              next30MinOccupancy: Math.min(98, Math.round((s.occupancy || 50) * 1.1)),
              waitingTime: s.waitingTime || 3.5,
              status: s.occupancy >= 65 ? 'high' : s.occupancy >= 40 ? 'moderate' : 'low',
              statusLabel: s.occupancy >= 65 ? `Heavy Crowd (${s.occupancy}%)` : s.occupancy >= 40 ? `Moderate (${s.occupancy}%)` : `Normal Flow (${s.occupancy}%)`,
            };
          });

          const sortedByInflow = [...stations].sort((a, b) => b.entryCount - a.entryCount);
          const sortedByOccupancy = [...stations].sort((a, b) => b.predictedOccupancy - a.predictedOccupancy);

          const totalInflow = stations.reduce((sum, s) => sum + s.entryCount, 0);
          const totalOutflow = stations.reduce((sum, s) => sum + s.exitCount, 0);
          const netFlow = totalInflow - totalOutflow;
          const avgNext30 = Math.round(stations.reduce((sum, s) => sum + s.next30MinOccupancy, 0) / (stations.length || 1));

          const highCrowdCount = stations.filter((s) => s.predictedOccupancy >= 65).length;
          const mediumCrowdCount = stations.filter((s) => s.predictedOccupancy >= 40 && s.predictedOccupancy < 65).length;
          const lowCrowdCount = Math.max(0, stations.length - highCrowdCount - mediumCrowdCount);

          reportData = {
            city: rawCityName,
            cityId: currentCityId,
            totalStations: stations.length,
            summary: {
              totalInflow,
              totalOutflow,
              netFlow,
              totalEntries: totalInflow,
              totalExits: totalOutflow,
              highCrowdStations: highCrowdCount,
              mediumCrowdStations: mediumCrowdCount,
              lowCrowdStations: lowCrowdCount,
              averageNext30MinOccupancy: avgNext30,
              avgOccupancy: Math.round(stations.reduce((sum, s) => sum + s.predictedOccupancy, 0) / (stations.length || 1)),
              busiestStation: sortedByInflow[0]?.name || 'Central Station',
            },
            stations,
            peakStation: sortedByOccupancy[0] || {},
            busiestStation: sortedByInflow[0] || {},
          };
        }
      }

      if (!cancelled) {
        if (reportData) setReport(reportData);
        else setError(`Unable to load traffic analysis for ${rawCityName}.`);
        setLoading(false);
      }
    }

    loadTrafficAnalysis(false);

    // 5-minute interval timer (300,000 ms) to refresh crowd, peak stations, inflow, outflow, net flow, and avg occupancy
    const timer = setInterval(() => {
      loadTrafficAnalysis(true);
    }, 300000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [city?.name, city?.id]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Traffic Analysis Reports
          </h1>

          <p className="text-sm text-slate-500">
            Passenger traffic and operational analysis for{' '}
            {city?.name || 'Hyderabad'}.
          </p>
        </div>

        <Card>
          <div className="py-10 text-center text-slate-500">
            Loading traffic analysis...
          </div>
        </Card>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Traffic Analysis Reports
          </h1>

          <p className="text-sm text-slate-500">
            Passenger traffic and operational analysis for{' '}
            {city?.name || 'Hyderabad'}.
          </p>
        </div>

        <Card>
          <div className="rounded-xl bg-red-50 p-6 text-red-600">
            {error}
          </div>
        </Card>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const summary = report.summary || {};
  const stations = report.stations || [];

  const displayTotalInflow = Number(
    summary.totalInflow ??
    summary.totalEntries ??
    summary.total_inflow ??
    (stations.length > 0 ? stations.reduce((sum, s) => sum + Number(s.entryCount || s.currentCrowd || 0), 0) : 485200)
  );

  const displayTotalOutflow = Number(
    summary.totalOutflow ??
    summary.totalExits ??
    summary.total_outflow ??
    (stations.length > 0 ? stations.reduce((sum, s) => sum + Number(s.exitCount || Math.round((s.entryCount || s.currentCrowd || 0) * 0.85)), 0) : 412400)
  );

  const displayNetFlow = Number(
    summary.netFlow ??
    summary.net_flow ??
    (displayTotalInflow - displayTotalOutflow)
  );

  const displayAvgNext30 = Number(
    summary.averageNext30MinOccupancy ??
    summary.avgOccupancy ??
    (stations.length > 0 ? Math.round(stations.reduce((sum, s) => sum + Number(s.next30MinOccupancy || s.predictedOccupancy || s.occupancy || 50), 0) / stations.length) : 55.4)
  );

  const displayHighCrowd = Number(
    summary.highCrowdStations ??
    summary.high_crowd_stations ??
    stations.filter((s) => Number(s.predictedOccupancy || s.occupancy || 0) >= 65 || s.status === 'high' || s.status === 'critical').length
  );

  const displayMediumCrowd = Number(
    summary.mediumCrowdStations ??
    summary.medium_crowd_stations ??
    stations.filter((s) => (Number(s.predictedOccupancy || s.occupancy || 0) >= 40 && Number(s.predictedOccupancy || s.occupancy || 0) < 65) || s.status === 'moderate' || s.status === 'warning').length
  );

  const displayLowCrowd = Number(
    summary.lowCrowdStations ??
    summary.low_crowd_stations ??
    Math.max(0, stations.length - displayHighCrowd - displayMediumCrowd)
  );

  const peakStation = report.peakStation || stations[0] || {};
  const busiestStation = report.busiestStation || stations[0] || {};

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Traffic Analysis Reports
        </h1>

        <p className="text-sm text-slate-500">
          Passenger traffic and operational analysis for{' '}
          {report.city || city?.name || 'Hyderabad'}.
        </p>
      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* INFLOW */}

        <Card>
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Total Passenger Inflow
              </p>

              <p className="font-display text-2xl font-bold text-slate-900">
                {displayTotalInflow.toLocaleString('en-IN')}
              </p>
            </div>

          </div>
        </Card>


        {/* OUTFLOW */}

        <Card delay={0.05}>
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
              <TrendingDown className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Total Passenger Outflow
              </p>

              <p className="font-display text-2xl font-bold text-slate-900">
                {displayTotalOutflow.toLocaleString('en-IN')}
              </p>
            </div>

          </div>
        </Card>


        {/* NET FLOW */}

        <Card delay={0.1}>
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-600">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Net Passenger Flow
              </p>

              <p className="font-display text-2xl font-bold text-slate-900">
                {displayNetFlow.toLocaleString('en-IN')}
              </p>
            </div>

          </div>
        </Card>


        {/* NEXT 30 MIN OCCUPANCY */}

        <Card delay={0.15}>
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
              <Activity className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Avg Next 30 Min Occupancy
              </p>

              <p className="font-display text-2xl font-bold text-slate-900">
                {displayAvgNext30.toFixed(2)}%
              </p>
            </div>

          </div>
        </Card>

      </div>


      {/* =====================================================
          STATION HIGHLIGHTS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* PEAK STATION */}

        <Card>
          <CardHeader
            title="Peak Crowd Station"
            subtitle="Station with the highest predicted occupancy"
          />

          <div className="rounded-xl bg-red-50 p-5">

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-display text-lg font-bold text-slate-900">
                    {peakStation.name || 'N/A'}
                  </p>

                  <p className="text-sm text-slate-500">
                    {peakStation.line || 'N/A'}
                  </p>
                </div>

              </div>

              <Badge
                tone={
                  peakStation.status === 'high'
                    ? 'danger'
                    : peakStation.status === 'moderate'
                    ? 'warning'
                    : 'success'
                }
              >
                {peakStation.statusLabel || 'Unknown'}
              </Badge>

            </div>


            <div className="mt-5 grid grid-cols-2 gap-4">

              <div>
                <p className="text-xs text-slate-400">
                  Predicted Occupancy
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {Number(
                    peakStation.predictedOccupancy || 0
                  ).toFixed(2)}
                  %
                </p>
              </div>


              <div>
                <p className="text-xs text-slate-400">
                  Next 30 Min
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {Number(
                    peakStation.next30MinOccupancy || 0
                  ).toFixed(2)}
                  %
                </p>
              </div>

            </div>

          </div>
        </Card>


        {/* BUSIEST STATION */}

        <Card>
          <CardHeader
            title="Busiest Station"
            subtitle="Station with the highest passenger inflow"
          />

          <div className="rounded-xl bg-blue-50 p-5">

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-display text-lg font-bold text-slate-900">
                    {busiestStation.name || 'N/A'}
                  </p>

                  <p className="text-sm text-slate-500">
                    {busiestStation.line || 'N/A'}
                  </p>
                </div>

              </div>

              <Badge tone="info">
                Busiest
              </Badge>

            </div>


            <div className="mt-5 grid grid-cols-2 gap-4">

              <div>
                <p className="text-xs text-slate-400">
                  Passenger Inflow
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {(busiestStation.entryCount || 0).toLocaleString()}
                </p>
              </div>


              <div>
                <p className="text-xs text-slate-400">
                  Net Flow
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {(
                    busiestStation.netFlow ??
                    ((busiestStation.entryCount || busiestStation.currentCrowd || 0) - (busiestStation.exitCount || Math.round((busiestStation.entryCount || busiestStation.currentCrowd || 0) * 0.85)))
                  ).toLocaleString()}
                </p>
              </div>

            </div>

          </div>
        </Card>

      </div>


      {/* =====================================================
          CROWD DISTRIBUTION
      ===================================================== */}

      <Card>

        <CardHeader
          title="Crowd Distribution"
          subtitle="Predicted crowd classification across stations"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl bg-red-50 p-5">
            <p className="text-sm text-slate-500">
              High Crowd Stations
            </p>

            <p className="mt-1 text-3xl font-bold text-red-600">
              {displayHighCrowd}
            </p>
          </div>


          <div className="rounded-xl bg-orange-50 p-5">
            <p className="text-sm text-slate-500">
              Medium Crowd Stations
            </p>

            <p className="mt-1 text-3xl font-bold text-orange-600">
              {displayMediumCrowd}
            </p>
          </div>


          <div className="rounded-xl bg-green-50 p-5">
            <p className="text-sm text-slate-500">
              Low Crowd Stations
            </p>

            <p className="mt-1 text-3xl font-bold text-green-600">
              {displayLowCrowd}
            </p>
          </div>

        </div>

      </Card>


      {/* =====================================================
          STATION TABLE
      ===================================================== */}

      <Card>

        <CardHeader
          title="Station Traffic Analysis"
          subtitle={`${stations.length} stations analyzed`}
        />

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr className="border-b border-slate-200 text-left">

                <th className="px-4 py-3 font-semibold text-slate-500">
                  Station
                </th>

                <th className="px-4 py-3 font-semibold text-slate-500">
                  Line
                </th>

                <th className="px-4 py-3 font-semibold text-slate-500">
                  Inflow
                </th>

                <th className="px-4 py-3 font-semibold text-slate-500">
                  Outflow
                </th>

                <th className="px-4 py-3 font-semibold text-slate-500">
                  Net Flow
                </th>

                <th className="px-4 py-3 font-semibold text-slate-500">
                  Predicted
                </th>

                <th className="px-4 py-3 font-semibold text-slate-500">
                  Next 30 Min
                </th>

                <th className="px-4 py-3 font-semibold text-slate-500">
                  Status
                </th>

              </tr>
            </thead>


            <tbody>

              {stations.map((station) => (

                <tr
                  key={station.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >

                  <td className="px-4 py-3">

                    <div className="flex items-center gap-2">

                      <MapPin className="h-4 w-4 text-slate-400" />

                      <div>

                        <p className="font-medium text-slate-800">
                          {station.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {station.id}
                        </p>

                      </div>

                    </div>

                  </td>


                  <td className="px-4 py-3 text-slate-600">
                    {station.line}
                  </td>


                  <td className="px-4 py-3 font-medium text-slate-700">
                    {(station.entryCount || 0).toLocaleString()}
                  </td>


                  <td className="px-4 py-3 font-medium text-slate-700">
                    {(station.exitCount || 0).toLocaleString()}
                  </td>


                  <td className="px-4 py-3 font-medium text-slate-700">
                    {(
                      station.netFlow ??
                      ((station.entryCount || station.currentCrowd || 0) - (station.exitCount || Math.round((station.entryCount || station.currentCrowd || 0) * 0.85)))
                    ).toLocaleString()}
                  </td>


                  <td className="px-4 py-3 font-medium text-slate-700">
                    {Number(
                      station.predictedOccupancy || 0
                    ).toFixed(2)}
                    %
                  </td>


                  <td className="px-4 py-3 font-medium text-slate-700">
                    {Number(
                      station.next30MinOccupancy || 0
                    ).toFixed(2)}
                    %
                  </td>


                  <td className="px-4 py-3">
                    {(() => {
                      const pct = Math.round(Number(station.predictedOccupancy || station.occupancy || 0));
                      const tone = pct >= 65 ? 'danger' : pct >= 40 ? 'warning' : 'success';
                      const label = pct >= 65 ? `Heavy Crowd (${pct}%)` : pct >= 40 ? `Moderate (${pct}%)` : `Normal Flow (${pct}%)`;
                      const barBg = pct >= 65 ? 'bg-red-500' : pct >= 40 ? 'bg-amber-500' : 'bg-emerald-500';

                      return (
                        <div className="flex items-center gap-2">
                          <Badge tone={tone}>
                            {label}
                          </Badge>
                          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full ${barBg}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </Card>


      {/* =====================================================
          OPERATIONAL ALERTS
      ===================================================== */}

      {stations.some(
        (station) => station.serviceAlertActive
      ) && (

        <Card>

          <CardHeader
            title="Operational Alerts"
            subtitle="Stations requiring attention"
          />

          <div className="space-y-3">

            {stations
              .filter(
                (station) =>
                  station.serviceAlertActive
              )
              .map((station) => (

                <div
                  key={station.id}
                  className="flex items-center gap-3 rounded-xl bg-orange-50 p-4"
                >

                  <AlertTriangle className="h-5 w-5 text-orange-600" />

                  <div>

                    <p className="font-medium text-slate-800">
                      {station.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      Service alert is currently active.
                    </p>

                  </div>

                </div>

              ))}

          </div>

        </Card>

      )}

    </div>
  );
}