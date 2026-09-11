import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, Bell, Sun, Moon, Globe, ShieldQuestion, Info, LogOut } from 'lucide-react';
import Card, { CardHeader } from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/hooks/useApp';
import { useTheme } from '@/hooks/useTheme';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ROUTES, APP_NAME, APP_TAGLINE } from '@/constants';

const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Bengali', 'Marathi'];

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-slate-600">{label}</span>
      <span
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </span>
    </label>
  );
}

/** Shared settings content for both the User and Administrator Settings pages. */
export default function SettingsPanel() {
  const { user, changePassword, logout } = useAuth();
  const { resetSelection } = useApp();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [notifPrefs, setNotifPrefs] = useLocalStorage('metroflow_notif_prefs', {
    emergency: true,
    delays: true,
    overcrowding: true,
    weeklyDigest: false,
  });
  const [privacy, setPrivacy] = useLocalStorage('metroflow_privacy_prefs', {
    shareUsageData: true,
    showProfileToOperators: true,
  });
  const [language, setLanguage] = useLocalStorage('metroflow_language', 'English');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);

  const updateNotif = (key) => setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  const updatePrivacy = (key) => setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }
    setIsChangingPw(true);
    try {
      await changePassword(pwForm);
      toast.success('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.message || 'Unable to change password.');
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleLogout = () => {
    logout();
    resetSelection();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Change Password" subtitle="Update the password for your account" action={<Lock className="h-5 w-5 text-slate-400" />} />
        <form onSubmit={handleChangePassword} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Current password"
            type="password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
          />
          <Input
            label="New password"
            type="password"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
          />
          <Input
            label="Confirm new password"
            type="password"
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          />
          {pwError && <p className="sm:col-span-3 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{pwError}</p>}
          <div className="sm:col-span-3">
            <Button type="submit" isLoading={isChangingPw}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Notifications" subtitle="Choose which alerts you want to receive" action={<Bell className="h-5 w-5 text-slate-400" />} />
        <div className="divide-y divide-slate-100">
          <Toggle checked={notifPrefs.emergency} onChange={() => updateNotif('emergency')} label="Emergency notifications" />
          <Toggle checked={notifPrefs.delays} onChange={() => updateNotif('delays')} label="Delay notifications" />
          <Toggle checked={notifPrefs.overcrowding} onChange={() => updateNotif('overcrowding')} label="Overcrowding alerts" />
          <Toggle checked={notifPrefs.weeklyDigest} onChange={() => updateNotif('weeklyDigest')} label="Weekly summary digest" />
        </div>
      </Card>

      <Card>
        <CardHeader title="Appearance" subtitle="Choose how MetroFlow looks on this device" />
        <div className="flex gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
              theme === 'light' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'
            }`}
          >
            <Sun className="h-4 w-4" /> Light Mode
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
              theme === 'dark' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'
            }`}
          >
            <Moon className="h-4 w-4" /> Dark Mode
          </button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Language" subtitle="Interface language" action={<Globe className="h-5 w-5 text-slate-400" />} />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm focus-ring"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </Card>

      <Card>
        <CardHeader title="Privacy Settings" action={<ShieldQuestion className="h-5 w-5 text-slate-400" />} />
        <div className="divide-y divide-slate-100">
          <Toggle checked={privacy.shareUsageData} onChange={() => updatePrivacy('shareUsageData')} label="Share anonymized usage data to improve MetroFlow" />
          <Toggle checked={privacy.showProfileToOperators} onChange={() => updatePrivacy('showProfileToOperators')} label="Show my profile to station operators" />
        </div>
      </Card>

      <Card>
        <CardHeader title="About MetroFlow" action={<Info className="h-5 w-5 text-slate-400" />} />
        <p className="text-sm text-slate-600">
          {APP_NAME} — {APP_TAGLINE}. Signed in as <span className="font-medium text-slate-800">{user?.email}</span>.
        </p>
        <p className="mt-1 text-xs text-slate-400">Version 1.0.0 (demo build)</p>
      </Card>

      <div className="flex justify-end">
        <Button variant="danger" icon={LogOut} onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
