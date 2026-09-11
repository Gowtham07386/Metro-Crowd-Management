import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title = "Nothing here yet", description = "There is no data to show right now.", action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <div>
        <p className="font-medium text-slate-700">{title}</p>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}
