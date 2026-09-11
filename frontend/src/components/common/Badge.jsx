import { cn } from "@/utils/cn";

const TONES = {
  success: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/30",
  warning: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 ring-1 ring-inset ring-amber-600/30",
  danger: "bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 ring-1 ring-inset ring-rose-600/30",
  info: "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 ring-1 ring-inset ring-blue-600/30",
  violet: "bg-violet-500/15 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 ring-1 ring-inset ring-violet-600/30",
  neutral: "bg-slate-500/15 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300 ring-1 ring-inset ring-slate-500/30",
};

export default function Badge({ children, tone = "neutral", dot = false, className }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", TONES[tone] || TONES.neutral, className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function statusToTone(status) {
  if (status === null || status === undefined) return "neutral";

  if (typeof status === 'number') {
    if (status >= 75) return "danger";
    if (status >= 40) return "warning";
    return "success";
  }

  const str = String(status).trim();
  const exactMap = {
    GREEN: "success", YELLOW: "warning", ORANGE: "warning", RED: "danger",
    Low: "success", Medium: "warning", High: "danger", Critical: "danger",
    Running: "success", Delayed: "danger", Maintenance: "neutral",
    Active: "success", Suspended: "danger",
    critical: "danger", warning: "warning", info: "info", success: "success",
    smooth: "success", Smooth: "success",
    moderate: "warning", Moderate: "warning",
    busy: "danger", Busy: "danger",
    crowded: "danger", Crowded: "danger",
    severe: "danger", Severe: "danger",
    low: "success", low_crowd: "success",
    normal: "success", Normal: "success",
  };

  if (exactMap[str]) return exactMap[str];

  const lower = str.toLowerCase();
  
  if (lower.includes("green") || lower.includes("smooth") || lower.includes("normal") || lower.includes("low") || lower.includes("running") || lower.includes("active") || lower.includes("success")) {
    return "success";
  }
  if (lower.includes("yellow") || lower.includes("orange") || lower.includes("medium") || lower.includes("moderate") || lower.includes("warning")) {
    return "warning";
  }
  if (lower.includes("red") || lower.includes("high") || lower.includes("critical") || lower.includes("heavy") || lower.includes("busy") || lower.includes("crowd") || lower.includes("severe") || lower.includes("delay") || lower.includes("suspend") || lower.includes("danger")) {
    return "danger";
  }
  if (lower.includes("maintenance") || lower.includes("info")) {
    return "info";
  }

  return "neutral";
}

