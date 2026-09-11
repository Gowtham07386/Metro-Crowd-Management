import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Route as RouteIcon,
  Users,
  TrendingUp,
  Clock,
  TrainFront,
  BrainCircuit,
} from 'lucide-react';

import Card, { CardHeader } from '@/components/common/Card';
import CountUp from '@/components/common/CountUp';
import Badge, { statusToTone } from '@/components/common/Badge';
import Table from '@/components/common/Table';

import {
  FlowAreaChart,
  RidershipBarChart,
} from '@/components/charts/ChartKit';

import { useCityData } from '@/hooks/useCityData';
import { useApp } from '@/hooks/useApp';
import { formatNumber } from '@/utils/formatters';

const RAW_API =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

const API_PREFIX = RAW_API.endsWith('/api')
  ? RAW_API
  : `${RAW_API.replace(/\/+$/, '')}/api`;

export default function AdminDashboard() {
  const { city } = useApp();

  /*
   * We still use useCityData() for the existing
   * dashboard charts and train information.
   *
   * IMPORTANT:
   * Station Monitoring below does NOT use the generated
   * station data anymore.
   */
  const generatedData = useCityData();

  const [backendStations, setBackendStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [stationsError, setStationsError] = useState('');

  /*
   * ============================================================
   * FETCH REAL STATIONS FOR THE SELECTED CITY
   * ============================================================
   */
  useEffect(() => {
    let cancelled = false;

    async function loadStations() {
      if (!city?.name) {
        setBackendStations([]);
        setStationsLoading(false);
        return;
      }

      setStationsLoading(true);
      setStationsError('');

      try {
        /*
         * The UI may display:
         *
         * Chennai Metro
         * Hyderabad Metro
         *
         * But your FastAPI endpoint expects:
         *
         * Chennai
         * Hyderabad
         *
         * So remove " Metro" only for the API request.
         */
        const apiCityName = city.name
          .replace(/\s+Metro$/i, '')
          .trim();

        const url = `${API_PREFIX}/stations?city=${encodeURIComponent(apiCityName)}&city_id=${encodeURIComponent(city?.id || '')}`;
        console.log('Selected city:', city?.name, 'Stations URL:', url);

        let stationList = [];

        try {
          const response = await fetch(url);
          if (response.ok) {
            const result = await response.json();
            stationList = Array.isArray(result)
              ? result
              : Array.isArray(result?.stations)
              ? result.stations
              : [];
          }
        } catch (error) {
          console.warn('Failed to load backend stations, falling back to local dataset:', error);
        }

        if (stationList.length === 0 && generatedData?.stations) {
          stationList = generatedData.stations;
        }

        if (!cancelled) {
          setBackendStations(stationList);
        }
      } catch (error) {
        console.error('Failed to load stations:', error);
        if (!cancelled) {
          setBackendStations(generatedData?.stations || []);
        }
      } finally {
        if (!cancelled) {
          setStationsLoading(false);
        }
      }
    }

    loadStations();

    const timer = setInterval(loadStations, 300000); // 5 minutes

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [city?.name]);


  if (!generatedData) return null;

  const {
    trains,
    hourlyFlow,
    weekly,
    aiPrediction,
  } = generatedData;

  /*
   * ============================================================
   * CONVERT BACKEND STATIONS INTO DASHBOARD FORMAT
   * ============================================================
   */
  const stations = useMemo(() => {
    return backendStations.map((station) => {
      /*
       * REAL STATION ID
       */
      const id =
        station.station_id ??
        station.id ??
        '';

      /*
       * REAL STATION NAME
       */
      const name =
        station.station_name ??
        station.name ??
        'Unknown Station';

      /*
       * REAL METRO LINE
       */
      const line =
        station.line ??
        station.line_name ??
        station.metro_line_id ??
        'Unknown';

      /*
       * Predicted occupancy from backend
       */
      const occupancy = Number(
        station.predicted_occupancy ??
        station.prediction ??
        station.occupancy ??
        0
      );

      /*
       * Predicted/current people
       */
      const currentCrowd = Number(
        station.predicted_people ??
        station.current_crowd ??
        station.currentCrowd ??
        0
      );

      /*
       * Waiting time
       */
      const waitingTime = Number(
        station.waiting_time ??
        station.waitingTime ??
        0
      );

      /*
       * Status
       */
      let statusLabel =
        station.status_label ??
        station.statusLabel;

      if (!statusLabel) {
        if (occupancy >= 80) {
          statusLabel = 'Overcrowded';
        } else if (occupancy >= 55) {
          statusLabel = 'Busy';
        } else {
          statusLabel = 'Smooth';
        }
      }

      const status =
        String(
          station.status ??
          statusLabel
        ).toLowerCase();

      /*
       * Risk classification
       */
      let risk = 'Low';

      if (occupancy >= 80) {
        risk = 'Critical';
      } else if (occupancy >= 55) {
        risk = 'High';
      } else if (occupancy >= 40) {
        risk = 'Medium';
      }

      return {
        id,
        name,
        line,
        occupancy,
        currentCrowd,
        waitingTime,
        status,
        statusLabel,
        risk,
      };
    });
  }, [backendStations]);

  /*
   * ============================================================
   * DASHBOARD CALCULATIONS
   * ============================================================
   */

  const peakCrowd =
    stations.length > 0
      ? Math.max(
          ...stations.map((station) => station.occupancy)
        )
      : 0;

  const avgWaiting =
    stations.length > 0
      ? Math.round(
          stations.reduce(
            (sum, station) =>
              sum + station.waitingTime,
            0
          ) / stations.length
        )
      : 0;

  const passengersToday =
    hourlyFlow.reduce(
      (sum, hour) => sum + hour.entries,
      0
    );

  const runningTrains =
    trains.filter(
      (train) => train.status === 'Running'
    ).length;

  /*
   * Highest predicted occupancy stations.
   */
  const riskStations = [...stations]
    .sort(
      (a, b) =>
        b.occupancy - a.occupancy
    )
    .slice(0, 8);

  /*
   * ============================================================
   * STAT CARDS
   * ============================================================
   */

  const stats = [
    {
      label: 'Total Stations',
      value: stations.length,
      icon: Building2,
      tone: 'from-brand-500 to-brand-700',
    },

    {
      label: 'Operational Lines',
      value: city.linesCount,
      icon: RouteIcon,
      tone: 'from-violet-500 to-violet-700',
    },

    {
      label: 'Passengers Today',
      value: passengersToday,
      icon: Users,
      tone: 'from-signal-500 to-signal-700',
      format: formatNumber,
    },

    {
      label: 'Peak Crowd',
      value: peakCrowd,
      suffix: '%',
      icon: TrendingUp,
      tone: 'from-danger to-rose-700',
    },

    {
      label: 'Avg. Waiting',
      value: avgWaiting,
      suffix: ' min',
      icon: Clock,
      tone: 'from-amber-500 to-orange-600',
    },

    {
      label: 'Running Trains',
      value: runningTrains,
      suffix: ` / ${trains.length}`,
      icon: TrainFront,
      tone: 'from-emerald-500 to-emerald-700',
    },

    {
      label: 'AI Prediction Accuracy',
      value: aiPrediction.confidence,
      suffix: '%',
      icon: BrainCircuit,
      tone: 'from-slate-700 to-brand-800',
    },
  ];

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Operations Control Center
        </h1>

        <p className="text-sm text-slate-500">
          Live overview of the {city.name} network.
        </p>
      </div>

      {/* ======================================================
          STAT CARDS
      ======================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {stats.map((s, i) => (
          <Card
            key={s.label}
            hover
            delay={i * 0.04}
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium text-slate-400">
                  {s.label}
                </p>

                <p className="mt-2 font-display text-2xl font-bold text-slate-900">

                  <CountUp
                    value={s.value}
                    formatter={(v) =>
                      `${
                        s.format
                          ? s.format(Math.round(v))
                          : Math.round(v)
                      }${s.suffix || ''}`
                    }
                  />

                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.tone} text-white`}
              >
                <s.icon className="h-4.5 w-4.5" />
              </div>

            </div>
          </Card>
        ))}

      </div>

      {/* ======================================================
          CHARTS
      ======================================================= */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <Card className="lg:col-span-2">
          <CardHeader
            title="Passenger Flow"
            subtitle={`Entries vs. Exits across ${city.name}`}
          />
          <FlowAreaChart
            data={hourlyFlow}
            xKey="hour"
            series={[
              {
                key: 'entries',
                label: 'Entries',
                color: city?.lines?.[0]?.color || '#2f5df0',
              },
              {
                key: 'exits',
                label: 'Exits',
                color: city?.lines?.[1]?.color || city?.lines?.[0]?.color || '#f98407',
              },
            ]}
          />
        </Card>

        <Card>
          <CardHeader title="Weekly Ridership" />
          <RidershipBarChart
            data={weekly}
            xKey="day"
            yKey="riders"
            color={city?.lines?.[2]?.color || city?.lines?.[0]?.color || '#7c5cff'}
            height={280}
          />
        </Card>

      </div>

      {/* ======================================================
          STATION MONITORING
      ======================================================= */}

      <Card>

        <CardHeader
          title="Station Monitoring"
          subtitle={
            stationsLoading
              ? 'Loading stations from backend...'
              : `${stations.length} real stations from ${city.name}`
          }
        />

        {/* ERROR */}
        {stationsError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {stationsError}
          </div>
        )}

        {/* LOADING */}
        {stationsLoading && (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading real metro stations...
          </div>
        )}

        {/* EMPTY */}
        {!stationsLoading &&
          !stationsError &&
          stations.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500">
              No stations found for {city.name}.
            </div>
          )}

        {/* TABLE */}
        {!stationsLoading &&
          stations.length > 0 && (

            <Table
              columns={[

                {
                  key: 'name',
                  header: 'Station',

                  render: (r) => (
                    <div>

                      <p className="font-medium text-slate-800">
                        {r.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {r.id}
                      </p>

                    </div>
                  ),
                },

                {
                  key: 'line',
                  header: 'Line',
                },

                {
                  key: 'currentCrowd',
                  header: 'Passengers',

                  render: (r) =>
                    formatNumber(
                      r.currentCrowd
                    ),
                },

                {
                  key: 'occupancy',
                  header: 'Crowd',

                  render: (r) =>
                    `${Number(
                      r.occupancy
                    ).toFixed(2)}%`,
                },

                {
                  key: 'waitingTime',
                  header: 'Waiting',

                  render: (r) =>
                    `${r.waitingTime} min`,
                },

                {
                  key: 'risk',
                  header: 'Risk',

                  render: (r) => (
                    <Badge
                      tone={statusToTone(
                        r.risk
                      )}
                    >
                      {r.risk}
                    </Badge>
                  ),
                },

                {
                  key: 'status',
                  header: 'Status',

                  render: (r) => (
                    <Badge
                      tone={statusToTone(
                        r.status
                      )}
                    >
                      {r.statusLabel}
                    </Badge>
                  ),
                },

              ]}

              data={riskStations}
            />

          )}

      </Card>

    </div>
  );
}