import { useState } from "react";
import Card, { CardHeader } from "@/components/common/Card";
import MetroLineDiagram from "@/components/passenger/MetroLineDiagram";
import StationDetailModal from "@/components/passenger/StationDetailModal";
import { useCityData } from "@/hooks/useCityData";
import { useApp } from "@/hooks/useApp";

export default function MetroMap() {
  const { city } = useApp();
  const data = useCityData();
  const [activeStation, setActiveStation] = useState(null);

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Interactive Metro Map</h1>
        <p className="text-sm text-slate-500">Tap any station on the {city?.name} network for live details.</p>
      </div>

      <Card>
        <CardHeader title="Network Schematic" subtitle="Colored ring shows live crowd status" />
        <MetroLineDiagram lines={city.lines} stations={data.stations} onStationClick={setActiveStation} />
      </Card>

      <StationDetailModal station={activeStation} isOpen={Boolean(activeStation)} onClose={() => setActiveStation(null)} />
    </div>
  );
}
