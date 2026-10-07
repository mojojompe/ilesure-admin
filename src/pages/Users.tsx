import { useState } from 'react';
import {
  UserMultipleIcon as UsersIcon,
  Book01Icon,
  Home01Icon,
  Building04Icon,
  UserIcon,
  UserCheck01Icon,
  ViewIcon
} from '@hugeicons/react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { clsx } from 'clsx';
import { can, CAP } from '../lib/rbac';
import { useDeepLink } from '../lib/useDeepLink';
import {
  useAccountModeration, AccountTable, StatCards, SearchField,
  type Column, type UserAccount,
} from '../features/moderation';

type TabKey = 'all' | 'tenant' | 'agent_landlord' | 'company';

/** Server-side role filter for each tab (the API accepts a comma-separated list). */
const TAB_ROLE: Record<TabKey, string | undefined> = {
  all: undefined,
  tenant: 'student',
  agent_landlord: 'agent,landlord',
  company: 'company,company_admin',
};

const COUNTS = {
  all: {},
  tenant: { role: TAB_ROLE.tenant },
  agent_landlord: { role: TAB_ROLE.agent_landlord },
  company: { role: TAB_ROLE.company },
  suspended: { status: 'suspended' },
};

const roleLabel: Record<string, string> = {
  tenant: 'Tenant', agent: 'Agent', landlord: 'Landlord',
  company_admin: 'Company Admin', company: 'Company Admin', sub_agent: 'Sub-Agent',
};
const roleIcon: Record<string, React.ReactNode> = {
  tenant: <Book01Icon className="w-3.5 h-3.5" />,
  agent: <Home01Icon className="w-3.5 h-3.5" />,
  landlord: <Home01Icon className="w-3.5 h-3.5" />,
  company_admin: <Building04Icon className="w-3.5 h-3.5" />,
  company: <Building04Icon className="w-3.5 h-3.5" />,
  sub_agent: <Home01Icon className="w-3.5 h-3.5" />,
};

export function Users() {
  const [tab, setTab] = useState<TabKey>('all');
  const [detailUser, setDetailUser] = useState<UserAccount | null>(null);
  const [suspendConfirm, setSuspendConfirm] = useState<UserAccount | null>(null);
  const canSuspend = can(CAP.USERS_SUSPEND);

  const list = useAccountModeration('user', { filters: { role: TAB_ROLE[tab] }, counts: COUNTS });
  const { counts } = list;
  // Admin alert emails link here with ?q=<search>&open=<id> (lib/deepLink.ts).
  useDeepLink({ rows: list.rows, loading: list.loading, getId: (u) => u.id, onOpen: setDetailUser, onQuery: (q) => q && list.setSearch(q) });

  const handleSuspend = async (user: UserAccount) => {
    const ok = await list.changeStatus(user, user.status === 'suspended' ? 'reinstate' : 'suspend');
    if (ok) setSuspendConfirm(null);
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'all', label: 'All Users', icon: <UsersIcon className="w-3.5 h-3.5" />, count: counts.all },
    { key: 'tenant', label: 'Tenants', icon: <Book01Icon className="w-3.5 h-3.5" />, count: counts.tenant },
    { key: 'agent_landlord', label: 'Agents', icon: <Home01Icon className="w-3.5 h-3.5" />, count: counts.agent_landlord },
    { key: 'company', label: 'Company Admins', icon: <Building04Icon className="w-3.5 h-3.5" />, count: counts.company },
  ];

  const columns: Column<UserAccount>[] = [
    {
      header: 'User',
      cell: user => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-pill bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-clay-sm">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-text-primary text-sm">{user.name}</p>
            <p className="text-xs text-text-tertiary">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: user => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary">
          {roleIcon[user.role]} {roleLabel[user.role]}
        </span>
      ),
    },
    { header: 'Status', cell: user => <StatusBadge status={user.status as any} /> },
    { header: 'Verification', cell: user => <StatusBadge status={user.verificationStatus as any} /> },
    { header: 'University / Entity', cell: user => <span className="text-sm text-text-secondary truncate max-w-[160px] block">{user.university || '—'}</span> },
    {
      header: 'Activity',
      cell: user => (
        <span className="text-sm text-text-secondary">
          {user.role === 'tenant' ? `${user.bookings} booking${user.bookings !== 1 ? 's' : ''}`
            : `${user.listings} listing${user.listings !== 1 ? 's' : ''}`}
        </span>
      ),
    },
    { header: 'Joined', cell: user => <span className="text-xs text-text-tertiary">{user.joinDate}</span> },
    {
      header: 'Actions',
      headerClassName: 'text-right pr-5',
      className: 'text-right pr-4',
      cell: user => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setDetailUser(user)}
            className="w-7 h-7 flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors"
            title="View profile"
          >
            <ViewIcon className="w-3.5 h-3.5 text-text-secondary" />
          </button>
          {/* SECURITY-FIX (AD-H3): suspend/unsuspend hidden without users.suspend. */}
          {canSuspend && (
            <button
              onClick={() => setSuspendConfirm(user)}
              className={clsx(
                'w-7 h-7 flex items-center justify-center rounded-clay-sm transition-colors',
                user.status === 'suspended'
                  ? 'bg-status-success/10 hover:bg-status-success/20 text-status-success'
                  : 'bg-status-error/10 hover:bg-status-error/20 text-status-error',
              )}
              title={user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
            >
              {user.status === 'suspended'
                ? <UserCheck01Icon className="w-3.5 h-3.5" />
                : <UserIcon className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <StatCards cards={[
        { label: 'Total Users', value: counts.all, icon: <UsersIcon className="w-5 h-5 text-burnt-brown" />, bg: 'bg-burnt-brown-pale' },
        { label: 'Tenants', value: counts.tenant, icon: <Book01Icon className="w-5 h-5 text-mustard" />, bg: 'bg-mustard/10' },
        { label: 'Agents', value: counts.agent_landlord, icon: <Home01Icon className="w-5 h-5 text-burnt-brown-light" />, bg: 'bg-burnt-brown-pale' },
        { label: 'Suspended', value: counts.suspended, icon: <UserIcon className="w-5 h-5 text-status-error" />, bg: 'bg-status-error/10' },
      ]} />

      {/* ── Tabs + Search ───────────────────────────────── */}
      <ClayCard padding="sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex w-full sm:w-auto overflow-x-auto no-scrollbar gap-1 p-1 bg-clay-border-light rounded-clay-sm">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={clsx(
                  'flex items-center flex-shrink-0 whitespace-nowrap gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[10px] text-[10px] sm:text-xs font-semibold transition-all duration-150',
                  tab === t.key ? 'bg-burnt-brown text-white shadow-clay-sm' : 'text-text-secondary hover:text-text-primary',
                )}
                title={t.label}
              >
                {t.icon}
                <span>{t.label}</span>
                <span className={clsx('rounded-pill px-1.5 text-[9px] sm:text-[10px] font-bold',
                  tab === t.key ? 'bg-white/20 text-white' : 'bg-clay-border text-text-tertiary'
                )}>{t.count}</span>
              </button>
            ))}
          </div>
          <SearchField className="flex-1 w-full sm:w-auto" value={list.search} onChange={list.setSearch} placeholder="Search by name or email..." />
        </div>
      </ClayCard>

      <ClayCard padding="none">
        <AccountTable list={list} columns={columns} noun="users" />
      </ClayCard>

      {/* ── User Detail Modal ────────────────────────────── */}
      <Modal open={!!detailUser} onClose={() => setDetailUser(null)} title="User Profile" size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDetailUser(null)}>Close</Button>
            {canSuspend && (detailUser?.status !== 'suspended'
              ? <Button variant="danger" size="sm" onClick={() => { setSuspendConfirm(detailUser); setDetailUser(null); }}>Suspend User</Button>
              : <Button variant="success" size="sm" onClick={() => { setSuspendConfirm(detailUser); setDetailUser(null); }}>Unsuspend User</Button>
            )}
          </>
        }
      >
        {detailUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-pill bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white text-xl font-bold shadow-clay">
                {detailUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-text-primary text-base">{detailUser.name}</h3>
                <p className="text-sm text-text-tertiary">{detailUser.email} · {detailUser.phone}</p>
                <div className="flex gap-2 mt-1">
                  <StatusBadge status={detailUser.status as any} />
                  <StatusBadge status={detailUser.verificationStatus as any} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Role', value: roleLabel[detailUser.role] },
                { label: 'Joined', value: detailUser.joinDate },
                { label: 'University', value: detailUser.university || 'N/A' },
                { label: 'Bookings', value: `${detailUser.bookings}` },
                { label: 'Listings', value: `${detailUser.listings}` },
                { label: 'Verification', value: detailUser.verificationStatus },
              ].map(({ label, value }) => (
                <div key={label} className="bg-clay-border-light rounded-clay-sm px-3 py-2">
                  <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5 capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Suspend Confirm Modal ────────────────────────── */}
      <Modal open={!!suspendConfirm} onClose={() => setSuspendConfirm(null)} title="Confirm Action" size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setSuspendConfirm(null)}>Cancel</Button>
            <Button variant={suspendConfirm?.status === 'suspended' ? 'success' : 'danger'} size="sm" onClick={() => suspendConfirm && handleSuspend(suspendConfirm)}>
              {suspendConfirm?.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          {suspendConfirm?.status === 'suspended'
            ? `Unsuspend ${suspendConfirm?.name}? They will regain access to the platform.`
            : `Suspend ${suspendConfirm?.name}? They will lose access until reinstated.`}
        </p>
      </Modal>
    </div>
  );
}
