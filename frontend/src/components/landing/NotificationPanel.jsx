import { useState } from 'react';
import { Info, X, Radio } from 'lucide-react';
import Card, { CardHeader } from '@/components/common/Card';

const NOTIFICATIONS = [
  { id: 1, message: 'Platform 2 maintenance at Hyderabad Metro.', time: '5 min ago' },
  { id: 2, message: 'Delhi Metro Blue Line delayed by 8 minutes.', time: '18 min ago' },
  { id: 3, message: 'Chennai Metro running additional trains during peak hours.', time: '32 min ago' },
  { id: 4, message: 'Bengaluru Metro Green Line operating normally.', time: '1 hr ago' },
  { id: 5, message: 'Mumbai Metro maintenance scheduled tonight.', time: '2 hr ago' },
];

/** Dismissals only last for the current browser session, per spec. */
export default function NotificationPanel() {
  const [dismissedIds, setDismissedIds] = useState([]);
  const visible = NOTIFICATIONS.filter((n) => !dismissedIds.includes(n.id));

  return (
    <Card animate={false} className="h-full">
      <CardHeader
        title="Latest Metro Updates"
        action={
          <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <Radio className="h-3 w-3" /> Live
          </span>
        }
      />
      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">You&apos;re all caught up.</p>
      ) : (
        <ul className="space-y-2.5">
          {visible.map((n) => (
            <li key={n.id} className="flex items-start gap-2.5 rounded-xl border border-slate-100 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{n.time}</p>
              </div>
              <button
                onClick={() => setDismissedIds((prev) => [...prev, n.id])}
                className="shrink-0 rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500 focus-ring"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
