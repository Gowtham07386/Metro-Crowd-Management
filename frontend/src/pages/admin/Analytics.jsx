import { useEffect, useState } from 'react';
import {
  Activity,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';

import Card, {
  CardHeader,
} from '@/components/common/Card';

import Badge, {
  statusToTone,
} from '@/components/common/Badge';

import {
  FlowAreaChart,
  RidershipBarChart,
  DonutChart,
} from '@/components/charts/ChartKit';

import { useApp } from '@/hooks/useApp';
import { generateCityData, updateCityData, getLineColor } from '@/data/cityDataGenerator';


const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

const API_PREFIX = RAW_API_URL.endsWith('/api')
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/+$/, '')}/api`;


// ============================================================
// ANALYTICS PAGE
// ============================================================

export default function Analytics() {

  // ----------------------------------------------------------
  // CITY
  // ----------------------------------------------------------

  const { city } = useApp();


  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');


  // ==========================================================
  // CITY NAME
  // ==========================================================

  const cityName =
    city?.name
      ?.replace(/\s+Metro$/i, '')
      ?.trim() || 'Hyderabad';


  // ==========================================================
  // LOAD ANALYTICS FROM BACKEND
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadAnalytics = async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      setError('');

      const currentCityId = city?.id || String(cityName).toLowerCase();
      if (isSilent) {
        updateCityData(currentCityId);
      }

      let analyticsResult = null;

      // 1. Try FastAPI endpoints (/admin/analytics/{city_id} or /traffic-analysis)
      try {
        const primaryUrl = `${API_PREFIX}/admin/analytics/${encodeURIComponent(currentCityId)}`;
        let response = await fetch(primaryUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          const fallbackUrl = `${API_PREFIX}/traffic-analysis?city=${encodeURIComponent(cityName)}`;
          response = await fetch(fallbackUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
        }

        if (response.ok) {
          analyticsResult = await response.json();
        }
      } catch (err) {
        console.warn('Analytics backend fetch warning:', err);
      }

      // 2. Fallback to local station master data if backend is unreachable or returns empty
      if (!analyticsResult || !analyticsResult.stations || analyticsResult.stations.length === 0) {
        const cityData = updateCityData(currentCityId) || generateCityData(currentCityId);
        if (cityData && Array.isArray(cityData.stations)) {
          const localStations = cityData.stations.map((s) => {
            const occ = s.occupancy || 50;
            const next30 = Math.min(98, Math.max(15, Math.round(occ * (occ >= 65 ? 1.06 : 0.96))));
            const entryCount = s.currentCrowd || 850;
            const exitCount = Math.round(entryCount * 0.85);
            return {
              id: s.id,
              name: s.name,
              line: s.line,
              lineColor: s.lineColor,
              entryCount,
              exitCount,
              netFlow: entryCount - exitCount,
              predictedOccupancy: occ,
              next30MinOccupancy: next30,
              predictedPeople: entryCount,
              waitingTime: s.waitingTime || 3.5,
              status: occ >= 75 ? 'critical' : occ >= 40 ? 'warning' : 'success',
              statusLabel: occ >= 75 ? `Heavy Crowd (${occ}%)` : occ >= 40 ? `Moderate (${occ}%)` : `Normal Flow (${occ}%)`,
            };
          });

          const sortedByInflow = [...localStations].sort((a, b) => b.entryCount - a.entryCount);
          const sortedByOccupancy = [...localStations].sort((a, b) => b.predictedOccupancy - a.predictedOccupancy);
          const totalInflow = localStations.reduce((sum, s) => sum + s.entryCount, 0);
          const totalOutflow = localStations.reduce((sum, s) => sum + s.exitCount, 0);
          const netFlow = totalInflow - totalOutflow;

          analyticsResult = {
            cityId: currentCityId,
            cityName: city?.name || cityName,
            totalStations: localStations.length,
            summary: {
              totalInflow,
              totalOutflow,
              netFlow,
              totalEntries: totalInflow,
              totalExits: totalOutflow,
              avgOccupancy: Math.round(localStations.reduce((sum, s) => sum + s.predictedOccupancy, 0) / (localStations.length || 1)),
              avgNext30MinOccupancy: Math.round(localStations.reduce((sum, s) => sum + s.next30MinOccupancy, 0) / (localStations.length || 1)),
              highCrowdStations: localStations.filter(s => s.predictedOccupancy >= 75).length,
              mediumCrowdStations: localStations.filter(s => s.predictedOccupancy >= 40 && s.predictedOccupancy < 75).length,
              lowCrowdStations: localStations.filter(s => s.predictedOccupancy < 40).length,
              busiestStation: sortedByInflow[0]?.name || 'Central Station',
              peakStation: sortedByOccupancy[0]?.name || 'Central Station',
            },
            stations: localStations,
            peakStation: sortedByOccupancy[0] || {},
            busiestStation: sortedByInflow[0] || {},
          };
        }
      }

      if (!cancelled) {
        if (analyticsResult) setReport(analyticsResult);
        else setError(`Unable to load analytics data for ${cityName}.`);
        setLoading(false);
      }
    };

    if (cityName) {
      loadAnalytics(false);
    }

    // 5-minute polling interval
    const timer = setInterval(() => {
      if (cityName) loadAnalytics(true);
    }, 300000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [cityName, city?.name, city?.id]);


  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {

    return (

      <div className="space-y-6">

        <div>

          <h1 className="font-display text-2xl font-bold text-slate-900">
            Analytics
          </h1>

          <p className="text-sm text-slate-500">
            Passenger flow, crowd trends, and station analysis.
          </p>

        </div>


        <Card>

          <div className="flex min-h-[300px] items-center justify-center">

            <p className="text-slate-400">
              Loading analytics...
            </p>

          </div>

        </Card>

      </div>

    );

  }


  // ==========================================================
  // ERROR SCREEN
  // ==========================================================

  if (error) {

    return (

      <div className="space-y-6">

        <div>

          <h1 className="font-display text-2xl font-bold text-slate-900">
            Analytics
          </h1>

          <p className="text-sm text-slate-500">
            Passenger flow, crowd trends, and station analysis.
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


  // ==========================================================
  // SAFETY CHECK
  // ==========================================================

  if (!report) {
    return null;
  }


  // ==========================================================
  // BACKEND DATA
  // ==========================================================

  const summary =
    report.summary || {};


  const stations =
    Array.isArray(report.stations)
      ? report.stations
      : [];

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


  const totalStations =
    report.totalStations ||
    stations.length;


  const peakStation =
    report.peakStation ||
    stations[0] ||
    {};


  const busiestStation =
    report.busiestStation ||
    stations[0] ||
    {};


  // ==========================================================
  // TOP 8 BY INFLOW
  // ==========================================================

  const topInflowStations =
    [...stations]
      .sort(
        (a, b) =>
          Number(b.entryCount || b.current_crowd || b.currentCrowd || 0) -
          Number(a.entryCount || a.current_crowd || a.currentCrowd || 0)
      )
      .slice(0, 8);


  // ==========================================================
  // TOP 8 BY PREDICTED OCCUPANCY
  // ==========================================================

  const topOccupancyStations =
    [...stations]
      .sort(
        (a, b) =>
          Number(b.predictedOccupancy || b.occupancy || 0) -
          Number(a.predictedOccupancy || a.occupancy || 0)
      )
      .slice(0, 8);


  // ==========================================================
  // PASSENGER FLOW CHART DATA
  // ==========================================================

  const passengerFlowData =
    topInflowStations.map((station) => {
      const entries = Number(station.entryCount || station.current_crowd || station.currentCrowd || 850);
      const exits = Number(station.exitCount || Math.round(entries * 0.85));
      return {
        station: station.name,
        entries,
        exits,
      };
    });


  // ==========================================================
  // OCCUPANCY CHART DATA
  // ==========================================================

  const occupancyData =
    topOccupancyStations.map((station) => ({

      station: station.name,

      occupancy:
        Number(
          station.predictedOccupancy || station.occupancy || 50
        ),

    }));


  // ==========================================================
  // LINE DISTRIBUTION
  // ==========================================================

  const lineTotals = {};

  stations.forEach((station) => {
    const rawLine = station.line || 'Unknown Line';
    // Split interchange multi-lines (e.g., "Red Line-Pink Line" or "Red Line-Yellow Line-Violet Line")
    const lineParts = rawLine.split(/[-/]/).map((p) => p.trim()).filter(Boolean);

    lineParts.forEach((part) => {
      let cleanLine = part;
      if (['Red', 'Blue', 'Yellow', 'Green', 'Pink', 'Violet', 'Magenta', 'Grey', 'Aqua', 'Orange', 'Purple'].includes(cleanLine)) {
        cleanLine += ' Line';
      }
      if (!lineTotals[cleanLine]) {
        lineTotals[cleanLine] = 0;
      }
      const flow = Number(
        station.entryCount || station.current_crowd || station.currentCrowd || 850
      );
      lineTotals[cleanLine] += Math.round(flow / lineParts.length);
    });
  });

  const lineDistribution = Object.entries(lineTotals)
    .map(([name, value]) => {
      const matchingLine = city?.lines?.find(
        (l) => l.name === name || name.includes(l.name) || l.name.includes(name.split('-')[0])
      );
      const color = matchingLine?.color || getLineColor(name);
      return {
        name,
        value,
        color,
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);


  // ==========================================================
  // AVERAGE PREDICTED OCCUPANCY
  // ==========================================================

  const averagePredicted =
    stations.length > 0
      ? stations.reduce(
          (sum, station) =>
            sum +
            Number(
              station.predictedOccupancy || station.occupancy || 50
            ),
          0
        ) / stations.length
      : 60.25;


  // ==========================================================
  // AVERAGE NEXT 30 MIN OCCUPANCY & CROWD CLASSIFICATIONS
  // ==========================================================

  const averageNext30Min =
    summary.avgNext30MinOccupancy ??
    (stations.length > 0
      ? stations.reduce((sum, station) => {
          const occ = Number(station.predictedOccupancy || station.occupancy || 50);
          const n30 = station.next30MinOccupancy ?? Math.min(98, Math.max(15, Math.round(occ * (occ >= 65 ? 1.06 : 0.96))));
          return sum + Number(n30);
        }, 0) / stations.length
      : 55.4);

  const highCrowdStationsCount =
    summary.highCrowdStations ??
    stations.filter((s) => Number(s.predictedOccupancy || s.occupancy || 0) >= 75).length;

  const mediumCrowdStationsCount =
    summary.mediumCrowdStations ??
    stations.filter((s) => {
      const occ = Number(s.predictedOccupancy || s.occupancy || 0);
      return occ >= 40 && occ < 75;
    }).length;

  const lowCrowdStationsCount =
    summary.lowCrowdStations ??
    stations.filter((s) => Number(s.predictedOccupancy || s.occupancy || 0) < 40).length;



  // ==========================================================
  // OPERATIONAL ALERTS
  // ==========================================================

  const activeAlerts =
    stations.filter(
      (station) =>
        station.serviceAlertActive === true ||
        station.platformCongestion === true ||
        station.gateClosureRecommended === true
    );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="space-y-6">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>

        <h1 className="font-display text-2xl font-bold text-slate-900">
          Analytics
        </h1>

        <p className="text-sm text-slate-500">
          Passenger flow, crowd trends, and station analysis for{' '}
          {report.city || city?.name || 'Hyderabad'}.
        </p>

      </div>


      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">


        {/* INFLOW */}

        <Card>

          <div className="flex items-center gap-3">

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

          <div className="flex items-center gap-3">

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

          <div className="flex items-center gap-3">

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


        {/* OCCUPANCY */}

        <Card delay={0.15}>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">

              <Activity className="h-5 w-5" />

            </div>


            <div>

              <p className="text-xs text-slate-400">
                Avg Predicted Occupancy
              </p>

              <p className="font-display text-2xl font-bold text-slate-900">

                {averagePredicted.toFixed(2)}%

              </p>

            </div>

          </div>

        </Card>

      </div>


      {/* ======================================================
          FLOW + LINE DISTRIBUTION
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">


        <Card className="lg:col-span-2">

          <CardHeader
            title="Passenger Flow by Station"
            subtitle="Top stations by passenger inflow"
          />


          {passengerFlowData.length > 0 ? (

            <FlowAreaChart
              data={passengerFlowData}
              xKey="station"
              series={[
                {
                  key: 'entries',
                  label: 'Entries',
                  color: '#2f5df0',
                },
                {
                  key: 'exits',
                  label: 'Exits',
                  color: '#f98407',
                },
              ]}
            />

          ) : (

            <div className="p-8 text-center text-slate-400">
              No passenger flow data available.
            </div>

          )}

        </Card>


        <Card>

          <CardHeader
            title="Ridership by Line"
            subtitle="Passenger inflow by metro line"
          />


          {lineDistribution.length > 0 ? (

            <DonutChart
              data={lineDistribution}
            />

          ) : (

            <div className="p-8 text-center text-slate-400">
              No line data available.
            </div>

          )}

        </Card>

      </div>


      {/* ======================================================
          OCCUPANCY + CROWD DISTRIBUTION
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">


        {/* OCCUPANCY */}

        <Card>

          <CardHeader
            title="Station Occupancy Comparison"
            subtitle="Top stations by predicted occupancy"
          />


          {occupancyData.length > 0 ? (

            <RidershipBarChart
              data={occupancyData}
              xKey="station"
              yKey="occupancy"
              color="#7c5cff"
            />

          ) : (

            <div className="p-8 text-center text-slate-400">
              No occupancy data available.
            </div>

          )}

        </Card>


        {/* CROWD DISTRIBUTION */}

        <Card>

          <CardHeader
            title="Crowd Distribution"
            subtitle="Predicted crowd classification"
          />


          <div className="space-y-4">


            <div className="rounded-xl bg-red-50 p-5">
              <p className="text-sm text-slate-500">
                High Crowd Stations
              </p>
              <p className="mt-1 text-3xl font-bold text-red-600">
                {highCrowdStationsCount}
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-5">
              <p className="text-sm text-slate-500">
                Moderate Crowd Stations
              </p>
              <p className="mt-1 text-3xl font-bold text-orange-600">
                {mediumCrowdStationsCount}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-5">
              <p className="text-sm text-slate-500">
                Low Crowd Stations
              </p>
              <p className="mt-1 text-3xl font-bold text-green-600">
                {lowCrowdStationsCount}
              </p>
            </div>

          </div>

        </Card>

      </div>


      {/* ======================================================
          KEY ANALYTICS
      ====================================================== */}

      <Card>

        <CardHeader
          title="Key Analytics"
          subtitle="Important network-level observations"
        />


        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">


          {/* PEAK STATION */}

          <div className="rounded-xl bg-red-50 p-5">

            <p className="text-xs font-medium text-slate-400">
              Peak Predicted Station
            </p>

            <p className="mt-1 font-display text-lg font-bold text-slate-900">
              {peakStation.name || 'N/A'}
            </p>

            <p className="mt-1 text-sm text-slate-500">

              Predicted occupancy:{' '}

              <span className="font-semibold">

                {Number(
                  peakStation.predictedOccupancy || 0
                ).toFixed(2)}
                %

              </span>

            </p>

          </div>


          {/* BUSIEST STATION */}

          <div className="rounded-xl bg-blue-50 p-5">

            <p className="text-xs font-medium text-slate-400">
              Busiest Station
            </p>

            <p className="mt-1 font-display text-lg font-bold text-slate-900">
              {busiestStation.name || 'N/A'}
            </p>

            <p className="mt-1 text-sm text-slate-500">

              Passenger inflow:{' '}

              <span className="font-semibold">

                {Number(
                  busiestStation.entryCount || 0
                ).toLocaleString('en-IN')}

              </span>

            </p>

          </div>


          {/* NEXT 30 MIN */}

          <div className="rounded-xl bg-violet-50 p-5">

            <p className="text-xs font-medium text-slate-400">
              Average Next 30 Min Occupancy
            </p>

            <p className="mt-1 font-display text-2xl font-bold text-slate-900">

              {averageNext30Min.toFixed(2)}%

            </p>

            <p className="mt-1 text-sm text-slate-500">

              Across {totalStations} stations

            </p>

          </div>

        </div>

      </Card>


      {/* ======================================================
          OPERATIONAL ALERTS
      ====================================================== */}

      {activeAlerts.length > 0 && (

        <Card>

          <CardHeader
            title="Operational Analytics Alerts"
            subtitle="Stations requiring attention"
          />


          <div className="space-y-3">

            {activeAlerts.map((station) => (

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

                    {station.serviceAlertActive
                      ? 'Service alert is currently active.'
                      : station.platformCongestion
                      ? 'Platform congestion detected.'
                      : 'Operational attention recommended.'}

                  </p>

                </div>

              </div>

            ))}

          </div>

        </Card>

      )}


      {/* ======================================================
          STATION TABLE
      ====================================================== */}

      <Card>

        <CardHeader
          title="Station Analytics"
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

                    <p className="font-medium text-slate-800">
                      {station.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {station.id}
                    </p>

                  </td>


                  <td className="px-4 py-3 text-slate-600">
                    {station.line || 'N/A'}
                  </td>


                  <td className="px-4 py-3 font-medium">

                    {Number(
                      station.entryCount || 0
                    ).toLocaleString('en-IN')}

                  </td>


                  <td className="px-4 py-3 font-medium">

                    {Number(
                      station.exitCount || 0
                    ).toLocaleString('en-IN')}

                  </td>


                  <td className="px-4 py-3 font-medium">

                    {Number(
                      station.netFlow || 0
                    ).toLocaleString('en-IN')}

                  </td>


                  <td className="px-4 py-3 font-medium">

                    {Number(
                      station.predictedOccupancy || 0
                    ).toFixed(2)}
                    %

                  </td>


                  <td className="px-4 py-3 font-medium">
                    {Number(
                      station.next30MinOccupancy ??
                      Math.min(98, Math.max(15, Math.round(Number(station.predictedOccupancy || station.occupancy || 50) * (Number(station.predictedOccupancy || station.occupancy || 50) >= 65 ? 1.06 : 0.96))))
                    ).toFixed(2)}
                    %
                  </td>


                  <td className="px-4 py-3">

                    <Badge
                      tone={statusToTone(
                        station.status || station.statusLabel || station.predictedOccupancy || 'smooth'
                      )}
                    >

                      {station.statusLabel ||
                        (station.status ? station.status.charAt(0).toUpperCase() + station.status.slice(1) : 'Smooth')}

                    </Badge>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </Card>

    </div>

  );

}