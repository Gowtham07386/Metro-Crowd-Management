import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X, Sparkles } from 'lucide-react';
import { useCityData } from '@/hooks/useCityData';
import { useApp } from '@/hooks/useApp';
import { getStations } from '@/services/metroflowApi';

const ROTATION_INTERVAL_MS = 10000; // Trigger alert message every 10 seconds
const DISPLAY_DURATION_MS = 7500;   // Show popup for 7.5s, then smooth exit

/**
 * Periodically surfaces high-crowd station alerts every 10 seconds as animated toasts,
 * matching current live occupancy, line, waiting time, and AI recommendations.
 * Updates candidates every 5 minutes from live FastAPI backend or city dataset.
 */
export default function HighCrowdAlert() {
  const { cityId } = useApp();
  const fallbackCityData = useCityData();
  const [stationAlert, setStationAlert] = useState(null);
  const [liveStations, setLiveStations] = useState([]);
  const indexRef = useRef(0);

  const selectedCityId = (cityId || 'delhi').toLowerCase();

  // Load live stations from backend every 5 minutes (300,000 ms)
  useEffect(() => {
    let cancelled = false;

    const fetchLiveStations = async () => {
      try {
        const response = await getStations(selectedCityId);
        if (cancelled) return;
        let loaded = [];
        if (Array.isArray(response)) {
          loaded = response;
        } else if (response && Array.isArray(response.stations)) {
          loaded = response.stations;
        }
        if (loaded.length > 0) {
          setLiveStations(loaded);
        }
      } catch (err) {
        if (!cancelled && fallbackCityData?.stations) {
          setLiveStations(fallbackCityData.stations);
        }
      }
    };

    fetchLiveStations();
    const pollTimer = setInterval(fetchLiveStations, 300000); // 5 minutes

    return () => {
      cancelled = true;
      clearInterval(pollTimer);
    };
  }, [selectedCityId, fallbackCityData]);

  // Candidate pool from live stations or fallback generator
  const activeStations = liveStations.length > 0 ? liveStations : (fallbackCityData?.stations || []);

  const triggerNextAlert = useCallback(() => {
    if (activeStations.length === 0) return;

    // Filter stations with high/busy crowd (>= 65% occupancy) or top 3 busiest
    let candidates = activeStations.filter((s) => Number(s.occupancy || 0) >= 65);
    if (candidates.length === 0) {
      candidates = [...activeStations].sort((a, b) => (b.occupancy || 0) - (a.occupancy || 0)).slice(0, 3);
    }
    if (candidates.length === 0) return;

    const pick = candidates[indexRef.current % candidates.length];
    indexRef.current += 1;
    setStationAlert(pick);

    // Auto dismiss before next 10-second tick
    setTimeout(() => {
      setStationAlert(null);
    }, DISPLAY_DURATION_MS);
  }, [activeStations]);

  // Rotate alert every 10 seconds
  useEffect(() => {
    const initialTimer = setTimeout(triggerNextAlert, 2000);
    const intervalTimer = setInterval(triggerNextAlert, ROTATION_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [triggerNextAlert]);

  if (!stationAlert) return null;

  const stationName = stationAlert.name || 'Station';
  const occupancy = Number(stationAlert.occupancy || 0);
  const waitingTime = stationAlert.waitingTime ?? stationAlert.waiting_time ?? Math.round((occupancy / 100) * 8.5);
  const line = stationAlert.line || 'Metro Line';

  const alternate = activeStations.find(
    (s) => s.line === line && s.id !== stationAlert.id && Number(s.occupancy || 0) < 50
  );

  return createPortal(
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] w-full max-w-sm">
      <AnimatePresence>
        {stationAlert && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="pointer-events-auto overflow-hidden rounded-2xl border border-danger/20 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-2 bg-gradient-to-r from-danger to-rose-500 px-4 py-2.5 text-white">
              <AlertTriangle className="h-4 w-4 animate-pulse" />
              <p className="text-sm font-semibold">High Crowd Alert</p>
              <button
                onClick={() => setStationAlert(null)}
                className="ml-auto rounded p-0.5 hover:bg-white/20"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-display text-base font-bold text-slate-900 dark:text-white">{stationName}</p>
                <span className="text-xs font-medium text-slate-400">{line}</span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Current occupancy</p>
                  <p className="font-semibold text-danger">{occupancy}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Expected waiting</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{waitingTime} min</p>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-1.5 rounded-xl bg-brand-50 p-2.5 text-xs text-brand-700 dark:bg-brand-950/30 dark:text-brand-300">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  AI Recommendation:{' '}
                  {alternate ? (
                    <>Use <span className="font-semibold">{alternate.name}</span> instead</>
                  ) : (
                    'Travel after 30 minutes to avoid peak crowd'
                  )}
                  .
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
