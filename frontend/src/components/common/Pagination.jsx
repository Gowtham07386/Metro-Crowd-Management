import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-between gap-2 pt-4">
      <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 focus-ring">
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>
      <div className="flex items-center gap-1">
        {pages.map((p, i) => (
          <span key={p} className="flex items-center">
            {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-slate-300">…</span>}
            <button onClick={() => onPageChange(p)} className={cn("h-8 w-8 rounded-lg text-sm font-medium focus-ring", p === page ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
              {p}
            </button>
          </span>
        ))}
      </div>
      <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 focus-ring">
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
