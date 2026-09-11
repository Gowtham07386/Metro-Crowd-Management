import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search…", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-9 text-sm placeholder:text-slate-400 focus-ring"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Clear search">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

