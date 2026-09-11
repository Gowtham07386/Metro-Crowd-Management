import { useState, useEffect } from "react";
import { useApp } from "@/hooks/useApp";
import { generateCityData, updateCityData } from "@/data/cityDataGenerator";

/** Returns the full generated dataset for the currently selected city, refreshed every 5 minutes. */
export function useCityData() {
  const { cityId } = useApp();
  const [data, setData] = useState(() => (cityId ? generateCityData(cityId) : null));

  useEffect(() => {
    if (!cityId) {
      setData(null);
      return;
    }

    setData(generateCityData(cityId));

    // Refresh dataset every 5 minutes (300,000 ms)
    const timer = setInterval(() => {
      setData(updateCityData(cityId));
    }, 300000);

    return () => clearInterval(timer);
  }, [cityId]);

  return data;
}

