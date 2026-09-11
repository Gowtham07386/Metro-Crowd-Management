import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Camera, Pencil, Save, X, Mail, Phone, ShieldCheck, CalendarDays, BadgeCheck } from 'lucide-react';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/formatters';

function formatDateJoined(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

/**
 * Shared profile card for both User and Administrator profile pages.
 * `accountType` is the display label ("User" / "Administrator");
 * `extraFields` lets the Admin page inject Employee ID etc. without this
 * component needing to know about roles.
 */
export default function ProfileCard({ accountType, extraFields = [] }) {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', profileImage: user?.profileImage || null });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const startEditing = () => {
    setForm({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', profileImage: user?.profileImage || null });
    setIsEditing(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, profileImage: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateProfile(form);
      toast.success('Profile updated.');
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          {(isEditing ? form.profileImage : user?.profileImage) ? (
            <img
              src={isEditing ? form.profileImage : user.profileImage}
              alt=""
              className="h-20 w-20 rounded-2xl object-cover shadow-md"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 text-2xl font-bold text-white shadow-md">
              {getInitials(user?.name)}
            </div>
          )}
          {isEditing && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-md hover:bg-brand-700 focus-ring"
                aria-label="Change profile picture"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </>
          )}
        </div>

        <div className="flex-1">
          {isEditing ? (
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
          ) : (
            <h2 className="font-display text-xl font-bold text-slate-900">{user?.name}</h2>
          )}
          <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
        </div>

        {!isEditing ? (
          <Button variant="secondary" icon={Pencil} onClick={startEditing}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" icon={X} onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button icon={Save} isLoading={isSaving} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
        <FieldRow icon={Phone} label="Phone Number">
          {isEditing ? (
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 90000 00000" />
          ) : (
            <p className="text-sm font-medium text-slate-800">{user?.phone || '—'}</p>
          )}
        </FieldRow>

        <FieldRow icon={Mail} label="Email">
          {isEditing ? (
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@metroflow.app" />
          ) : (
            <p className="text-sm font-medium text-slate-800">{user?.email}</p>
          )}
        </FieldRow>

        <FieldRow icon={ShieldCheck} label="Account Type">
          <p className="text-sm font-medium text-slate-800">{accountType}</p>
        </FieldRow>

        <FieldRow icon={CalendarDays} label="Date Joined">
          <p className="text-sm font-medium text-slate-800">{formatDateJoined(user?.dateJoined)}</p>
        </FieldRow>

        {extraFields.map((f) => (
          <FieldRow key={f.label} icon={f.icon || BadgeCheck} label={f.label}>
            <p className="text-sm font-medium text-slate-800">{f.value || '—'}</p>
          </FieldRow>
        ))}
      </div>
    </Card>
  );
}

function FieldRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}
