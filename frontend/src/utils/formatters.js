export function formatNumber(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatCompactNumber(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatLakh(value) {
  if (value === null || value === undefined) return "—";
  return `${(value / 100000).toFixed(1)} Lakh`;
}

export function formatPercent(value) {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value)}%`;
}

export function formatDateTime(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

export function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/** Small deterministic pseudo-random generator so per-city mock data is stable across renders. */
export function seededRandom(seed) {
  let value = 0;
  for (let i = 0; i < seed.length; i++) {
    value = (value * 31 + seed.charCodeAt(i)) % 233280;
  }
  return function next() {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}
