import { HeartPulse, ShieldAlert, Siren, PackageSearch, Phone } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { toast } from "react-toastify";

const SERVICES = [
  { icon: HeartPulse, title: "Medical", desc: "On-station first aid and ambulance dispatch.", phone: "102", tone: "from-rose-500 to-rose-700" },
  { icon: ShieldAlert, title: "Security", desc: "Metro security personnel for any on-premise concern.", phone: "1800-111-911", tone: "from-amber-500 to-orange-600" },
  { icon: Siren, title: "Police", desc: "Nearest police assistance for emergencies.", phone: "100", tone: "from-blue-600 to-brand-700" },
  { icon: PackageSearch, title: "Lost & Found", desc: "Report or track lost belongings across the network.", phone: "1800-222-100", tone: "from-violet-500 to-violet-700" },
];

export default function EmergencyHelp() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Emergency Help</h1>
        <p className="text-sm text-slate-500">Reach the right team quickly — available across the network 24/7.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <Card key={s.title} hover>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.tone} text-white`}>
              <s.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{s.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-slate-700">{s.phone}</span>
              <Button size="sm" variant="danger" icon={Phone} onClick={() => toast.info(`Connecting you to ${s.title}…`)}>
                Call now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
