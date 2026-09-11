import SettingsPanel from '@/components/common/SettingsPanel';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your account, notifications, and preferences.</p>
      </div>
      <SettingsPanel />
    </div>
  );
}
