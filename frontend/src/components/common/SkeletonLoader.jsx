import { cn } from "@/utils/cn";

export default function SkeletonLoader({ className, rows }) {
  if (rows) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded-md bg-slate-200/70" />
        ))}
      </div>
    );
  }
  return <div className={cn("animate-pulse rounded-md bg-slate-200/70", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-4 h-4 w-24 animate-pulse rounded bg-slate-200/70" />
      <div className="h-8 w-32 animate-pulse rounded bg-slate-200/70" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200/70" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
      <div className="glass-panel h-72 animate-pulse rounded-2xl" />
    </div>
  );
}
