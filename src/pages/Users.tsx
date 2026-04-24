import { useState, useEffect } from 'react';
import { Search, Users as UsersIcon, GraduationCap, Home, Building2, UserX, UserCheck, Eye } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { User } from '../types';
import { clsx } from 'clsx';
import { adminApi } from '../api/admin';

type TabKey = 'all' | 'tenant' | 'agent_landlord' | 'company';

const roleLabel: Record<string, string> = {
  tenant: 'Tenant', agent: 'Agent', landlord: 'Landlord',
  company_admin: 'Company Admin', sub_agent: 'Sub-Agent',
};
const roleIcon: Record<string, React.ReactNode> = {
  tenant: <GraduationCap className="w-3.5 h-3.5" />,
  agent: <Home className="w-3.5 h-3.5" />,
  landlord: <Home className="w-3.5 h-3.5" />,
  company_admin: <Building2 className="w-3.5 h-3.5" />,
  sub_agent: <Home className="w-3.5 h-3.5" />,
};

export function Users() {
  const [tab, setTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [suspendConfirm, setSuspendConfirm] = useState<User | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [tab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab === 'tenant') params.set('role', 'student');
      else if (tab === 'agent_landlord') params.set('role', 'agent,landlord');
      else if (tab === 'company') params.set('role', 'company_admin');

      const response = await adminApi.users.list(`?${params.toString()}`);
      if (response.success && response.data?.users) {
        const formattedUsers = response.data.users.map((u: any) => ({
          id: u._id || u.id,
          name: u.fullName || u.name || '',
          email: u.email,
          phone: u.phone || '',
          role: u.role === 'student' ? 'tenant' : u.role,
          status: u.status,
          verificationStatus: u.verificationStatus,
          university: u.university || '',
          joinDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
          listings: u.listings ?? 0,
          bookings: u.bookings ?? 0,
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (user: User) => {
    try {
      if (user.status === 'suspended') {
        await adminApi.users.unsuspend(user.id);
      } else {
        await adminApi.users.suspend(user.id);
      }
      await fetchUsers();
      setSuspendConfirm(null);
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'all' ? true
      : tab === 'tenant' ? u.role === 'tenant'
      : tab === 'agent_landlord' ? (u.role === 'agent' || u.role === 'landlord')
      : u.role === 'company_admin';
    return matchSearch && matchTab;
  });

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'all',           label: 'All Users',      icon: <UsersIcon className="w-3.5 h-3.5" />,     count: users.length },
    { key: 'tenant',        label: 'Tenants',        icon: <GraduationCap className="w-3.5 h-3.5" />, count: users.filter(u => u.role === 'tenant').length },
    { key: 'agent_landlord',label: 'Agents',         icon: <Home className="w-3.5 h-3.5" />,          count: users.filter(u => u.role === 'agent' || u.role === 'landlord').length },
    { key: 'company',       label: 'Company Admins', icon: <Building2 className="w-3.5 h-3.5" />,     count: users.filter(u => u.role === 'company_admin').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Summary Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',   value: users.length,                                        icon: <UsersIcon className="w-5 h-5 text-burnt-brown" />,    bg: 'bg-burnt-brown-pale' },
          { label: 'Tenants',       value: users.filter(u => u.role === 'tenant').length,       icon: <GraduationCap className="w-5 h-5 text-mustard" />,    bg: 'bg-mustard/10' },
          { label: 'Agents',        value: users.filter(u => u.role === 'agent' || u.role === 'landlord').length, icon: <Home className="w-5 h-5 text-burnt-brown-light" />, bg: 'bg-burnt-brown-pale' },
          { label: 'Suspended',     value: users.filter(u => u.status === 'suspended').length,  icon: <UserX className="w-5 h-5 text-status-error" />,       bg: 'bg-status-error/10' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-clay border border-clay-border shadow-clay p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-clay-sm flex items-center justify-center shadow-clay-sm flex-shrink-0 ${s.bg}`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{s.value}</div>
              <div className="text-xs text-text-tertiary">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs + Search ───────────────────────────────── */}
      <ClayCard padding="sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Tabs */}
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
          {/* Search */}
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-clay-border-light border border-clay-border rounded-pill text-sm placeholder:text-text-tertiary outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/20 transition-all"
            />
          </div>
        </div>
      </ClayCard>

      {/* ── Users Table ─────────────────────────────────── */}
      <ClayCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full clay-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verification</th>
                <th>University / Entity</th>
                <th>Activity</th>
                <th>Joined</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-mustard border-t-transparent rounded-full animate-spin" />
                      <span className="text-text-tertiary">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <p className="text-text-tertiary">No users found</p>
                  </td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-pill bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-clay-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary text-sm">{user.name}</p>
                        <p className="text-xs text-text-tertiary">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary">
                      {roleIcon[user.role]} {roleLabel[user.role]}
                    </span>
                  </td>
                  <td><StatusBadge status={user.status as any} /></td>
                  <td><StatusBadge status={user.verificationStatus as any} /></td>
                  <td><span className="text-sm text-text-secondary truncate max-w-[160px] block">{user.university || '—'}</span></td>
                  <td>
                    <span className="text-sm text-text-secondary">
                      {user.role === 'tenant' ? `${user.bookings ?? 0} booking${user.bookings !== 1 ? 's' : ''}`
                        : `${user.listings ?? 0} listing${user.listings !== 1 ? 's' : ''}`}
                    </span>
                  </td>
                  <td><span className="text-xs text-text-tertiary">{user.joinDate}</span></td>
                  <td className="text-right pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setDetailUser(user)}
                        className="w-7 h-7 flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors"
                        title="View profile"
                      >
                        <Eye className="w-3.5 h-3.5 text-text-secondary" />
                      </button>
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
                          ? <UserCheck className="w-3.5 h-3.5" />
                          : <UserX className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-clay-border bg-off-white rounded-b-clay">
          <p className="text-xs text-text-tertiary">Showing {filtered.length} of {users.length} users</p>
        </div>
      </ClayCard>

      {/* ── User Detail Modal ────────────────────────────── */}
      <Modal open={!!detailUser} onClose={() => setDetailUser(null)} title="User Profile" size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDetailUser(null)}>Close</Button>
            {detailUser?.status !== 'suspended'
              ? <Button variant="danger" size="sm" onClick={() => { setSuspendConfirm(detailUser); setDetailUser(null); }}>Suspend User</Button>
              : <Button variant="success" size="sm" onClick={() => alert('Unsuspend mocked')}>Unsuspend</Button>
            }
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
                { label: 'Role',         value: roleLabel[detailUser.role] },
                { label: 'Joined',       value: detailUser.joinDate },
                { label: 'University',   value: detailUser.university || 'N/A' },
                { label: 'Bookings',     value: `${detailUser.bookings ?? 0}` },
                { label: 'Listings',     value: `${detailUser.listings ?? 0}` },
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
