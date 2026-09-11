import { useEffect, useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import Card, { CardHeader } from '@/components/common/Card';
import SearchBar from '@/components/common/SearchBar';
import Table from '@/components/common/Table';
import Badge, { statusToTone } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import { useCityData } from '@/hooks/useCityData';
import { getInitials } from '@/utils/formatters';
import InviteUserModal from '@/components/modals/InviteUserModal';

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

const API_PREFIX = RAW_API_URL.endsWith('/api')
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/+$/, '')}/api`;

const ROLE_FILTERS = ['All', 'Passenger', 'Operator', 'Administrator'];
const PAGE_SIZE = 6;

export default function UserManagement() {
  const data = useCityData();
  const [usersList, setUsersList] = useState([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Load DB users from backend & merge with city generator fallback
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch(`${API_PREFIX}/admin/users`);
        if (res.ok) {
          const dbUsers = await res.json();
          if (Array.isArray(dbUsers) && dbUsers.length > 0) {
            setUsersList(dbUsers);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend fetch users warning:', err);
      }

      if (data && Array.isArray(data.users)) {
        setUsersList(data.users);
      }
    }

    loadUsers();
  }, [data]);

  const handleUserInvited = (newUser) => {
    setUsersList((prev) => [newUser, ...prev]);
  };

  const filtered = useMemo(() => {
    return usersList.filter((u) => {
      const nameMatch = u.name ? u.name.toLowerCase().includes(query.toLowerCase()) : false;
      const emailMatch = u.email ? u.email.toLowerCase().includes(query.toLowerCase()) : false;
      const matchesQuery = nameMatch || emailMatch;
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [usersList, query, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">Passengers, operators, and administrators on this network.</p>
        </div>
        <Button icon={UserPlus} onClick={() => setIsInviteOpen(true)}>
          Invite user
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={query}
          onChange={(v) => { setQuery(v); setPage(1); }}
          placeholder="Search by name or email…"
          className="sm:w-80"
        />
        <div className="flex gap-2 overflow-x-auto">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-colors focus-ring ${
                roleFilter === r ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader title="All Users" subtitle={`${filtered.length} of ${usersList.length} shown`} />
        <Table
          columns={[
            {
              key: 'name',
              header: 'User',
              render: (u) => (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 text-xs font-bold text-white">
                    {getInitials(u.name)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
              ),
            },
            { key: 'role', header: 'Role', render: (u) => <Badge tone="info">{u.role}</Badge> },
            { key: 'status', header: 'Status', render: (u) => <Badge tone={statusToTone(u.status || 'Active')}>{u.status || 'Active'}</Badge> },
            {
              key: 'actions',
              header: 'Actions',
              render: (u) => (
                <Button size="sm" variant="secondary" onClick={() => toast.info(`Opening ${u.name}'s account…`)}>
                  Manage
                </Button>
              ),
            },
          ]}
          data={paged}
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onUserInvited={handleUserInvited}
      />
    </div>
  );
}
