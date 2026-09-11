import { useEffect, useMemo, useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import Modal from '@/components/common/Modal';
import SearchBar from '@/components/common/SearchBar';
import Badge, { statusToTone } from '@/components/common/Badge';
import { useApp } from '@/hooks/useApp';
import { generateCityData } from '@/data/cityDataGenerator';

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

const API_PREFIX = RAW_API_URL.endsWith('/api')
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/+$/, '')}/api`;

export default function StationPickerModal({ isOpen, onClose }) {
  const { city, station, setStation } = useApp();

  const [stations, setStations] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /*
   * Convert frontend city names such as:
   *
   * Chennai Metro -> Chennai
   * Hyderabad Metro -> Hyderabad
   *
   * because the backend /stations endpoint expects
   * the actual city name.
   */
  const backendCityName = useMemo(() => {
    if (!city?.name) return '';

    return city.name
      .trim()
      .replace(/\s+Metro$/i, '');
  }, [city?.name]);

  useEffect(() => {
    if (!isOpen || !backendCityName) {
      return;
    }

    const controller = new AbortController();

    async function loadStations() {
      setLoading(true);
      setError('');
      setStations([]);
      setQuery('');

      let validStations = [];

      try {
        const url = `${API_PREFIX}/stations?city=${encodeURIComponent(backendCityName)}&city_id=${encodeURIComponent(city?.id || '')}`;
        console.log('Loading real stations from:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        if (response.ok) {
          const result = await response.json();
          const rawStations = Array.isArray(result)
            ? result
            : Array.isArray(result?.stations)
            ? result.stations
            : [];

          const normalizedStations = rawStations.map((s) => {
            const stationId = s.station_id ?? s.stationId ?? s.id;
            const stationName = s.station_name ?? s.stationName ?? s.name;
            const line = s.line ?? s.line_name ?? s.lineName ?? '';
            const prediction = Number(s.prediction ?? s.predicted_occupancy ?? s.next_30min_occupancy_pct ?? s.occupancy ?? 0);

            let status = 'LOW';
            let statusLabel = 'Low';

            if (prediction >= 70) {
              status = 'HIGH';
              statusLabel = 'High';
            } else if (prediction >= 45) {
              status = 'MODERATE';
              statusLabel = 'Moderate';
            }

            let lineColor = s.line_color || s.lineColor || '#64748b';

            return {
              id: String(stationId ?? ''),
              name: String(stationName ?? ''),
              line: String(line),
              lineColor,
              prediction,
              occupancy: prediction,
              status,
              statusLabel,
            };
          }).filter((s) => s.id && s.name);

          validStations = Array.from(new Map(normalizedStations.map((s) => [s.id, s])).values());
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('StationPickerModal fetch warning:', err);
      }

      // Local fallback
      if (validStations.length === 0 && city?.id) {
        console.log('StationPickerModal - using local station fallback for city:', city.id);
        const cityData = generateCityData(city.id);
        if (cityData && Array.isArray(cityData.stations)) {
          validStations = cityData.stations.map((s) => ({
            id: String(s.id),
            name: String(s.name),
            line: String(s.line),
            lineColor: s.lineColor || '#64748b',
            prediction: s.occupancy || 40,
            occupancy: s.occupancy || 40,
            status: s.status === 'critical' ? 'HIGH' : s.status === 'warning' ? 'MODERATE' : 'LOW',
            statusLabel: s.statusLabel || 'Low',
          }));
        }
      }

      setStations(validStations);
      if (validStations.length === 0) {
        setError(`No stations available for ${backendCityName}.`);
      }
      setLoading(false);
    }

    loadStations();

    return () => {
      controller.abort();
    };
  }, [isOpen, backendCityName]);

  /*
   * Search by:
   * - station name
   * - station ID
   * - metro line
   */
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return stations;
    }

    return stations.filter(
      (s) =>
        s.name.toLowerCase().includes(search) ||
        s.id.toLowerCase().includes(search) ||
        s.line.toLowerCase().includes(search)
    );
  }, [stations, query]);

  const handleSelect = (selectedStation) => {
    setStation({
      id: selectedStation.id,
      name: selectedStation.name,
      line: selectedStation.line,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Switch Metro Station"
      subtitle={
        city
          ? `Choose a station within ${city.name}`
          : undefined
      }
    >
      <div className="mb-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search stations..."
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-10 text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading real {backendCityName} Metro stations...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

          <p className="mt-2 text-xs text-red-500">
            Requested:
            <br />
            <span className="font-mono">
              /stations?city=
              {backendCityName}
            </span>
          </p>
        </div>
      )}

      {/* Stations */}
      {!loading && !error && (
        <>
          <div className="mb-2 text-xs text-slate-400">
            {stations.length} real station
            {stations.length === 1 ? '' : 's'} available
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {filtered.map((s) => {
              const isSelected =
                station?.id === s.id;

              return (
                <button
                  key={s.id}
                  onClick={() =>
                    handleSelect(s)
                  }
                  className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors focus-ring ${
                    isSelected
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}
                >
                  {/* Icon */}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-brand-700 text-white">
                    <MapPin className="h-4 w-4" />
                  </span>

                  {/* Station details */}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {s.name}
                    </span>

                    <span
                      className="block truncate text-xs"
                      style={{
                        color: s.lineColor,
                      }}
                    >
                      {s.line || 'Metro Line'}
                    </span>

                    <span className="block truncate text-[10px] text-slate-400">
                      {s.id}
                    </span>
                  </span>

                  {/* Status */}
                  <Badge
                    tone={statusToTone(
                      s.status
                    )}
                  >
                    {s.statusLabel}
                  </Badge>

                  {/* Selected */}
                  {isSelected && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}

            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">
                No station matches "{query}".
              </p>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}