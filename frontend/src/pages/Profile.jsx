import { BadgeCheck, Briefcase, MapPin } from 'lucide-react';
import ProfileCard from '@/components/common/ProfileCard';
import { useApp } from '@/hooks/useApp';
import { ROLES, ACCOUNT_TYPE_LABELS } from '@/constants';

export default function Profile() {
  const { role, employeeId, employeeRole, station } = useApp();
  const isAdmin = role === ROLES.ADMIN;
  const accountType = ACCOUNT_TYPE_LABELS[role] || 'User';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500">Your account information{isAdmin ? ' and employee verification details' : ''}.</p>
      </div>

      <ProfileCard
        accountType={accountType}
        extraFields={
          isAdmin
            ? [
                { icon: BadgeCheck, label: 'Employee ID', value: employeeId },
                { icon: Briefcase, label: 'Employee Role', value: employeeRole },
                { icon: MapPin, label: 'Assigned Station', value: station?.name },
              ]
            : []
        }
      />
    </div>
  );
}
