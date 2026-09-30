import { useState } from 'react';
import {
  UserCheck01Icon,
  SecurityCheckIcon,
  UserIcon,
  ViewIcon,
  Cancel01Icon,
  Tick01Icon,
} from '@hugeicons/react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { can, CAP } from '../lib/rbac';
import {
  useAccountModeration, AccountTable, StatCards, SearchField,
  type AgentAccount, type Column,
} from '../features/moderation';

// Server totals: the agents endpoint filters by status only, so "verified" and
// "total listings" (previously summed over the first page) are not offered.
const COUNTS = {
  all: {},
  active: { status: 'active' },
  pending: { status: 'pending' },
  suspended: { status: 'suspended' },
};

export function Agents() {
  const [detail, setDetail] = useState<AgentAccount | null>(null);
  const canSuspend = can(CAP.AGENTS_SUSPEND);
  const list = useAccountModeration('agent', { counts: COUNTS });
  const { counts } = list;

  const changeStatus = async (agent: AgentAccount, change: 'suspend' | 'reinstate') => {
    if (await list.changeStatus(agent, change)) setDetail(null);
  };

  const columns: Column<AgentAccount>[] = [
    {
      header: 'Agent',
      cell: agent => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-clay-sm bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white font-bold text-sm shadow-clay-sm flex-shrink-0">
            {(agent.name || 'A').charAt(0)}
          </div>
          <p className="font-semibold text-text-primary text-sm">{agent.name}</p>
        </div>
      ),
    },
    { header: 'Email', cell: agent => <span className="text-sm text-text-secondary">{agent.email}</span> },
    { header: 'Tier', cell: agent => <StatusBadge status={agent.tier as any} /> },
    { header: 'Listings', cell: agent => <span className="text-sm font-semibold text-text-primary">{agent.listingsCount}</span> },
    { header: 'Status', cell: agent => <StatusBadge status={agent.status as any} /> },
    {
      header: 'Verified',
      cell: agent => agent.isVerified
        ? <span className="flex items-center gap-1 text-status-success text-xs font-semibold"><Tick01Icon className="w-3.5 h-3.5" /> KYC</span>
        : <span className="text-xs text-text-tertiary">Pending</span>,
    },
    {
      header: 'Actions',
      headerClassName: 'text-right pr-5',
      className: 'text-right pr-4',
      cell: agent => (
        <button onClick={() => setDetail(agent)} className="w-7 h-7 inline-flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors" title="View">
          <ViewIcon className="w-3.5 h-3.5 text-text-secondary" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <StatCards cards={[
        { label: 'Total Agents', value: counts.all, icon: <UserCheck01Icon className="w-5 h-5 text-burnt-brown" />, bg: 'bg-burnt-brown-pale' },
        { label: 'Active', value: counts.active, icon: <SecurityCheckIcon className="w-5 h-5 text-status-success" />, bg: 'bg-status-success/10' },
        { label: 'Pending Review', value: counts.pending, icon: <SecurityCheckIcon className="w-5 h-5 text-mustard" />, bg: 'bg-mustard/10' },
        { label: 'Suspended', value: counts.suspended, icon: <UserIcon className="w-5 h-5 text-status-error" />, bg: 'bg-status-error/10' },
      ]} />

      <ClayCard padding="none">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-clay-border">
          <h3 className="font-bold text-text-primary text-sm">All Agents</h3>
          <SearchField className="w-56" value={list.search} onChange={list.setSearch} placeholder="Search agents..." />
        </div>
        <AccountTable list={list} columns={columns} noun="agents" />
      </ClayCard>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Agent Profile"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDetail(null)}>Close</Button>
            {/* SECURITY-FIX (AD-H3): suspend/activate hidden without agents.suspend. */}
            {canSuspend && (detail?.status === 'active'
              ? <Button variant="danger" size="sm" onClick={() => detail && changeStatus(detail, 'suspend')} icon={<Cancel01Icon className="w-3.5 h-3.5" />}>Suspend Agent</Button>
              : <Button variant="success" size="sm" onClick={() => detail && changeStatus(detail, 'reinstate')}>Activate Agent</Button>)}
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-clay-border">
              <div className="w-14 h-14 rounded-clay-sm bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white text-2xl font-bold shadow-clay">
                {(detail.name || 'A').charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-text-primary text-lg">{detail.name}</h3>
                <div className="flex gap-2 mt-1">
                  <StatusBadge status={detail.status as any} />
                  <StatusBadge status={detail.tier as any} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Email', value: detail.email },
                { label: 'Phone', value: detail.phone },
                { label: 'Listings', value: String(detail.listingsCount) },
                { label: 'Tier', value: detail.tier },
                { label: 'KYC Status', value: detail.isVerified ? 'Verified' : 'Pending' },
                { label: 'Joined', value: detail.joinDate || '—' },
                { label: 'Reward Points', value: String(detail.rewardPoints) },
                { label: 'Extra Slots', value: String(detail.purchasedSlots) },
                { label: 'Bank Name', value: detail.bankName || '—' },
                { label: 'Account Name', value: detail.accountName || '—' },
                { label: 'Account Number', value: detail.accountNumber || '—' },
                { label: 'Subaccount', value: detail.subaccountCode ? (
                  <span className="flex items-center gap-1 text-status-success text-xs font-semibold">Active {detail.subaccountCode.slice(-6)}</span>
                ) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-clay-border-light rounded-clay-sm px-3 py-2">
                  <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
