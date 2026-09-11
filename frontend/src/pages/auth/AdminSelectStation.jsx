import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Check,
  ArrowRight,
  MapPinned,
} from 'lucide-react';

import SearchBar from '@/components/common/SearchBar';
import Button from '@/components/common/Button';
import Badge, { statusToTone } from '@/components/common/Badge';
import AdminOTPModal from '@/components/auth/AdminOTPModal';

import { getCityById } from '@/data/cities';
import { generateCityData } from '@/data/cityDataGenerator';
import { useApp } from '@/hooks/useApp';
import { ROLES, ROUTES } from '@/constants';


// ============================================================
// BACKEND
// ============================================================

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

const API_PREFIX = RAW_API_URL.endsWith('/api')
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/+$/, '')}/api`;


// ============================================================
// CITY NAME NORMALIZATION
// ============================================================

function normalizeCityName(cityName) {
  if (!cityName) {
    return '';
  }

  return cityName
    .replace(/\s+Metro$/i, '')
    .trim();
}


// ============================================================
// STATUS
// ============================================================

function getStationStatus(station) {
  const rawStatus = String(
    station.status ??
    station.status_label ??
    'LOW'
  ).toUpperCase();

  if (rawStatus === 'CRITICAL' || rawStatus === 'HIGH') {
    return {
      key: 'critical',
      label:
        station.status_label ??
        station.status ??
        'High',
    };
  }

  if (rawStatus === 'MODERATE' || rawStatus === 'MEDIUM') {
    return {
      key: 'warning',
      label:
        station.status_label ??
        station.status ??
        'Moderate',
    };
  }

  return {
    key: 'success',
    label:
      station.status_label ??
      station.status ??
      'Low',
  };
}


// ============================================================
// COMPONENT
// ============================================================

export default function AdminSelectStation() {

  const navigate = useNavigate();

  const location = useLocation();

  const {
    setRole,
    setCityId,
    setStation,
    setEmployeeId,
    setEmployeeRole,
  } = useApp();


  // ==========================================================
  // CITY SELECTED IN PREVIOUS ADMIN STEP
  // ==========================================================

  const cityId = location.state?.cityId;

  const city = cityId
    ? getCityById(cityId)
    : null;


  // ==========================================================
  // STATE
  // ==========================================================

  const [stations, setStations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [query, setQuery] = useState('');

  const [selected, setSelected] = useState(null);

  const [verifyOpen, setVerifyOpen] = useState(false);


  // ==========================================================
  // LOAD REAL STATIONS FROM FASTAPI
  // ==========================================================

  useEffect(() => {

    let cancelled = false;


    async function loadStations() {
      if (!cityId || !city) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setStations([]);
      setSelected(null);

      const backendCity = normalizeCityName(city.name);
      const url = `${API_PREFIX}/stations?city=${encodeURIComponent(backendCity)}&city_id=${encodeURIComponent(cityId)}`;

      console.log('Admin Select Station - city:', city.name, 'backend city:', backendCity, 'url:', url);

      let validStations = [];

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          const backendStations = Array.isArray(result)
            ? result
            : Array.isArray(result?.stations)
            ? result.stations
            : [];

          const normalizedStations = backendStations.map((station) => {
            const status = getStationStatus(station);
            return {
              id: station.station_id ?? station.stationId ?? station.id,
              name: station.station_name ?? station.stationName ?? station.name ?? 'Unknown Station',
              line: station.line_name ?? station.lineName ?? station.line ?? station.metro_line_id ?? 'Unknown Line',
              lineColor: station.line_color ?? station.lineColor ?? '#2f5df0',
              status: status.key,
              statusLabel: status.label,
              raw: station,
            };
          });

          validStations = normalizedStations.filter((station) => station.id && station.name);
        }
      } catch (err) {
        console.warn('Admin Select Station backend fetch warning:', err);
      }

      // Fallback to local station generator if backend response is empty or failed
      if (validStations.length === 0) {
        console.log('Admin Select Station - using authentic local station master fallback for city:', cityId);
        const cityData = generateCityData(cityId);
        if (cityData && Array.isArray(cityData.stations)) {
          validStations = cityData.stations.map((s) => ({
            id: s.id,
            name: s.name,
            line: s.line,
            lineColor: s.lineColor || '#2f5df0',
            status: s.status === 'critical' ? 'critical' : s.status === 'warning' ? 'warning' : 'success',
            statusLabel: s.statusLabel || 'Normal Flow',
            raw: s,
          }));
        }
      }

      if (!cancelled) {
        if (validStations.length > 0) {
          setStations(validStations);
          setError('');
        } else {
          setError('Unable to load stations. Please make sure FastAPI is running or select another city.');
        }
        setLoading(false);
      }
    }


    loadStations();


    return () => {
      cancelled = true;
    };

  }, [cityId, city]);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const filtered = useMemo(() => {

    const search =
      query.trim().toLowerCase();


    if (!search) {
      return stations;
    }


    return stations.filter(
      (station) =>
        station.name
          .toLowerCase()
          .includes(search)

        ||

        station.id
          .toLowerCase()
          .includes(search)

        ||

        station.line
          .toLowerCase()
          .includes(search)
    );

  }, [stations, query]);


  // ==========================================================
  // SELECTED STATION
  // ==========================================================

  const selectedStation =
    stations.find(
      (station) =>
        station.id === selected
    );


  // ==========================================================
  // VERIFICATION SUCCESS
  // ==========================================================

  const handleVerified = (
    _verifiedCityId,
    employeeId,
    employeeRole
  ) => {

    if (!selectedStation) {

      toast.error(
        'Please select a metro station first.'
      );

      return;
    }


    setRole(ROLES.ADMIN);

    setCityId(cityId);


    // Store the REAL backend station ID
    // and REAL station name.
    setStation({

      id: selectedStation.id,

      name: selectedStation.name,

      line: selectedStation.line,

    });


    setEmployeeId(employeeId);

    setEmployeeRole(employeeRole);


    toast.success(
      `Welcome, verified for ${selectedStation.name}.`
    );


    navigate(
      ROUTES.ADMIN.DASHBOARD
    );

  };


  // ==========================================================
  // INVALID CITY
  // ==========================================================

  if (!cityId || !city) {

    return (

      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app-gradient px-4 text-center">

        <p className="text-sm text-slate-500">
          Please select a metro city first.
        </p>


        <Button
          onClick={() =>
            navigate(
              ROUTES.ADMIN_SELECT_CITY
            )
          }
        >
          Select Metro City
        </Button>

      </div>

    );

  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (

    <div className="min-h-screen bg-app-gradient px-4 py-12">


      {/* ======================================================
          BACK BUTTON
      ====================================================== */}

      <button
        onClick={() =>
          navigate(
            ROUTES.ADMIN_SELECT_CITY
          )
        }
        className="absolute left-4 top-4 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white/60 focus-ring sm:left-6 sm:top-6"
      >

        <ArrowLeft className="h-4 w-4" />

        Back

      </button>


      <motion.div
        initial={{
          opacity: 0,
          y: 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className="mx-auto max-w-5xl"
      >


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 text-center">

          <p className="text-sm font-medium text-brand-600">
            Administrator Setup — Step 2 of 3
          </p>


          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Select Metro Station
          </h1>


          <p className="mt-2 text-sm text-slate-500">

            Choose the station you'll be managing on{' '}

            <span className="font-semibold text-slate-700">
              {city.name}
            </span>

          </p>

        </div>


        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="mx-auto mb-8 max-w-md">

          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search Metro Station or ID…"
          />

        </div>


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (

          <div className="flex min-h-[300px] items-center justify-center">

            <p className="text-sm text-slate-500">
              Loading real metro stations...
            </p>

          </div>

        )}


        {/* ==================================================
            ERROR
        ================================================== */}

        {!loading && error && (

          <div className="rounded-2xl bg-red-50 p-6 text-center text-red-600">

            {error}

          </div>

        )}


        {/* ==================================================
            STATIONS
        ================================================== */}

        {!loading &&
          !error &&
          filtered.length > 0 && (

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {filtered.map(
                (station, i) => {

                  const isSelected =
                    selected === station.id;


                  return (

                    <motion.button
                      key={station.id}
                      initial={{
                        opacity: 0,
                        y: 14,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.25,
                        delay: i * 0.02,
                      }}
                      whileHover={{
                        y: -4,
                      }}
                      onClick={() =>
                        setSelected(
                          station.id
                        )
                      }
                      className={`relative overflow-hidden rounded-2xl glass-panel p-5 text-left transition-shadow focus-ring ${
                        isSelected
                          ? 'ring-2 ring-brand-500 shadow-premium'
                          : 'hover:shadow-premium'
                      }`}
                    >


                      {/* SELECTED ICON */}

                      {isSelected && (

                        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">

                          <Check className="h-3.5 w-3.5" />

                        </span>

                      )}


                      {/* LOCATION ICON */}

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-brand-700 text-white shadow-md">

                        <MapPin className="h-5 w-5" />

                      </div>


                      {/* STATION NAME */}

                      <h3 className="mt-4 font-display text-base font-bold text-slate-900">

                        {station.name}

                      </h3>


                      {/* STATION ID */}

                      <p className="mt-1 text-xs font-medium text-slate-400">

                        Station ID: {station.id}

                      </p>


                      {/* LINE */}

                      <p
                        className="mt-1 text-xs"
                        style={{
                          color:
                            station.lineColor,
                        }}
                      >

                        {station.line}

                      </p>


                      {/* STATUS */}

                      <div className="mt-3">

                        <Badge
                          tone={statusToTone(
                            station.status
                          )}
                        >

                          {station.statusLabel}

                        </Badge>

                      </div>

                    </motion.button>

                  );

                }
              )}

            </div>

          )}


        {/* ==================================================
            NO RESULTS
        ================================================== */}

        {!loading &&
          !error &&
          filtered.length === 0 && (

            <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400">

              <MapPinned className="h-8 w-8" />

              <p>
                No metro station matches "{query}".
              </p>

            </div>

          )}


        {/* ==================================================
            CONTINUE
        ================================================== */}

        <div className="sticky bottom-6 z-10 mt-10 flex justify-center">

          <Button
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            disabled={!selected}
            onClick={() =>
              setVerifyOpen(true)
            }
            className="shadow-2xl"
          >
            Continue
          </Button>

        </div>


      </motion.div>


      {/* ======================================================
          OTP
      ====================================================== */}

      <AdminOTPModal
        isOpen={verifyOpen}
        onClose={() =>
          setVerifyOpen(false)
        }
        onVerified={handleVerified}
        title="Employee Verification"
        subtitle={
          selectedStation
            ? `Confirm your assignment to ${selectedStation.name}`
            : 'Confirm your assignment'
        }
      />

    </div>

  );

}