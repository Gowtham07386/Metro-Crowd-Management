import EmptyState from "@/components/common/EmptyState";
import { cn } from "@/utils/cn";

export default function Table({ columns, data, emptyMessage = "No records found.", keyField = "id" }) {
  if (!data || data.length === 0) {
    return <EmptyState title="No data" description={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50/80">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr key={row[keyField]} className="transition-colors hover:bg-brand-50/40">
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-slate-700", col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
