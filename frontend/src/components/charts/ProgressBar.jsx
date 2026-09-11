import { cn } from "@/utils/cn";

const TONE_BAR = { success: "bg-success", warning: "bg-warning", danger: "bg-danger", brand: "bg-gradient-to-r from-brand-600 to-violet-500" };

export default function ProgressBar({ label, value, tone = "brand", suffix = "%" }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="text-slate-400">{value}{suffix}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full transition-all duration-700", TONE_BAR[tone])} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}
