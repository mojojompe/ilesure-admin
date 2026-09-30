import { useState } from 'react';
import {
  Building04Icon,
  UserMultipleIcon,
  Home01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  ViewIcon,
  UserIcon,
  UserCheck01Icon
} from '@hugeicons/react';
import { clsx } from 'clsx';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { adminApi, errorMessage } from '../api/admin';
import { can, CAP } from '../lib/rbac';
import toast from 'react-hot-toast';
import {
  useAccountModeration, AccountTable, StatCards, SearchField,
  type Column, type CompanyAccount,
} from '../features/moderation';

// Server totals. "Total Agents" used to be summed over the first page of companies
// only, so it is replaced by the suspended count.
const COUNTS = {
  all: {},
  verified: { status: 'verified' },
  pending: { status: 'pending' },
  suspended: { status: 'suspended' },
};

export function Companies() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [companyAgents, setCompanyAgents] = useState<Record<string, any[]>>({});
  const [loadingAgents, setLoadingAgents] = useState<Record<string, boolean>>({});
  const [detailCompany, setDetailCompany] = useState<CompanyAccount | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<CompanyAccount | null>(null);

  const canApprove = can(CAP.COMPANIES_APPROVE);
  const canSuspend = can(CAP.COMPANIES_SUSPEND);
  const list = useAccountModeration('company', { counts: COUNTS });
  const { counts } = list;
  // Suspended companies can be reinstated (PUT /companies/:id/unsuspend).
  const canToggle = (company: CompanyAccount) =>
    canSuspend && (company.status !== 'suspended' || list.canReinstate);

  const fetchCompanyAgents = async (companyId: string, force = false) => {
    if (companyAgents[companyId] && !force) return; // already fetched

    setLoadingAgents(prev => ({ ...prev, [companyId]: true }));
    try {
      const response = await adminApi.companies.getAgents(companyId);
      if (response.success && response.data) {
        setCompanyAgents(prev => ({ ...prev, [companyId]: response.data.agents || response.data }));
      }
    } catch (error: any) {
      console.error('Failed to fetch company agents:', error);
      toast.error(errorMessage(error, 'Failed to fetch agents'));
    } finally {
      setLoadingAgents(prev => ({ ...prev, [companyId]: false }));
    }
  };

  const handleExpand = (companyId: string) => {
    if (expandedId === companyId) {
      setExpandedId(null);
    } else {
      setExpandedId(companyId);
      fetchCompanyAgents(companyId);
    }
  };

  const handleApprove = async (company: CompanyAccount) => {
    try {
      await adminApi.companies.approve(company.id);
      toast.success('Company approved successfully');
      await list.refresh();
      setDetailCompany(null);
    } catch (error: any) {
      console.error('Failed to approve company:', error);
      toast.error(errorMessage(error, 'Failed to approve company'));
    }
  };

  const handleStatusChange = async (company: CompanyAccount) => {
    const ok = await list.changeStatus(company, company.status === 'suspended' ? 'reinstate' : 'suspend');
    if (ok) setStatusConfirm(null);
  };

  const confirmStatusChange = (company: CompanyAccount) => {
    setStatusConfirm(company);
    setDetailCompany(null);
  };

  const handleCreate = async () => {
    const name = prompt('Enter new company name:');
    if (!name) return;
    try {
      await adminApi.companies.create({ name });
      toast.success('Company created successfully');
      await list.refresh();
    } catch (error: any) {
      toast.error(errorMessage(error, 'Failed to create company'));
    }
  };

  const handleInvite = async (company: CompanyAccount) => {
    const email = prompt(`Enter email to invite agent to ${company.name}:`);
    if (!email) return;
    try {
      await adminApi.companies.inviteAgent(company.id, email);
      toast.success('Agent invited successfully');
      fetchCompanyAgents(company.id, true);
    } catch (error: any) {
      toast.error(errorMessage(error, 'Failed to invite agent'));
    }
  };

  const countCell = (value: number, icon: React.ReactNode, bg: string) => (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-pill ${bg} flex items-center justify-center`}>{icon}</div>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );

  const columns: Column<CompanyAccount>[] = [
    {
      header: 'Company',
      cell: company => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-clay-sm bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white font-bold text-sm shadow-clay-sm flex-shrink-0">
            {company.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-text-primary text-sm leading-tight">{company.name}</p>
            {company.tradingName && <p className="text-[11px] text-text-tertiary">t/a {company.tradingName}</p>}
          </div>
        </div>
      ),
    },
    { header: 'CAC Number', cell: company => <span className="text-xs font-mono text-text-secondary bg-clay-border-light px-2 py-1 rounded-clay-sm">{company.cacNumber}</span> },
    { header: 'Director', cell: company => <span className="text-sm text-text-secondary">{company.director}</span> },
    { header: 'Tier', cell: company => <StatusBadge status={company.tier as any} /> },
    { header: 'Agents', cell: company => countCell(company.agentsCount, <UserMultipleIcon className="w-3.5 h-3.5 text-mustard" />, 'bg-mustard/10') },
    { header: 'Listings', cell: company => countCell(company.listingsCount, <Home01Icon className="w-3.5 h-3.5 text-burnt-brown" />, 'bg-burnt-brown-pale') },
    { header: 'Status', cell: company => <StatusBadge status={company.status as any} /> },
    { header: 'Joined', cell: company => <span className="text-xs text-text-tertiary">{company.joinDate}</span> },
    {
      header: 'Actions',
      headerClassName: 'text-right pr-5',
      className: 'text-right pr-4',
      cell: company => (
        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
          <button onClick={() => setDetailCompany(company)} className="w-7 h-7 flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors" title="View">
            <ViewIcon className="w-3.5 h-3.5 text-text-secondary" />
          </button>
          <button onClick={() => handleExpand(company.id)} className="w-7 h-7 flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors">
            {expandedId === company.id ? <ArrowUp01Icon className="w-3.5 h-3.5 text-text-secondary" /> : <ArrowDown01Icon className="w-3.5 h-3.5 text-text-secondary" />}
          </button>
          {/* SECURITY-FIX (AD-H3): suspend/reinstate hidden without companies.suspend. */}
          {canToggle(company) && (
            <button
              onClick={() => setStatusConfirm(company)}
              className={clsx(
                'w-7 h-7 flex items-center justify-center rounded-clay-sm transition-colors',
                company.status === 'suspended'
                  ? 'bg-status-success/10 hover:bg-status-success/20 text-status-success'
                  : 'bg-status-error/10 hover:bg-status-error/20 text-status-error',
              )}
              title={company.status === 'suspended' ? 'Reinstate' : 'Suspend'}
            >
              {company.status === 'suspended'
                ? <UserCheck01Icon className="w-3.5 h-3.5" />
                : <UserIcon className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      ),
    },
  ];

  const renderAgents = (company: CompanyAccount) => {
    if (expandedId !== company.id) return null;
    const agents = companyAgents[company.id];
    return (
      <>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">Sub-Agents under {company.name}</p>
          <Button variant="secondary" size="sm" onClick={() => handleInvite(company)}>+ Invite Agent</Button>
        </div>

        {loadingAgents[company.id] ? (
          <div className="flex items-center gap-2 py-4">
            <div className="w-4 h-4 border-2 border-mustard border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-text-tertiary">Loading agents...</span>
          </div>
        ) : agents && agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {agents.slice(0, 4).map((agent: any, i: number) => (
              <div key={agent._id || i} className="bg-white rounded-clay-sm border border-clay-border shadow-clay-sm p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-pill bg-burnt-brown-pale flex items-center justify-center text-burnt-brown font-bold text-xs flex-shrink-0">
                  {(agent.fullName || agent.email || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{agent.fullName || 'Unknown Agent'}</p>
                  <p className="text-xs text-text-tertiary truncate max-w-[150px]">{agent.email}</p>
                </div>
                <StatusBadge status={agent.status || 'verified'} showIcon={false} className="ml-auto text-[10px]" />
              </div>
            ))}
            {agents.length > 4 && (
              <div className="bg-clay-border-light rounded-clay-sm border border-clay-border p-3 flex items-center justify-center text-xs text-text-tertiary font-medium">
                +{agents.length - 4} more agents
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-tertiary py-2">No agents found for this company.</p>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <StatCards cards={[
        { label: 'Total Companies', value: counts.all, icon: <Building04Icon className="w-5 h-5 text-burnt-brown" />, bg: 'bg-burnt-brown-pale' },
        { label: 'Verified', value: counts.verified, icon: <Building04Icon className="w-5 h-5 text-status-success" />, bg: 'bg-status-success/10' },
        { label: 'Pending', value: counts.pending, icon: <Building04Icon className="w-5 h-5 text-mustard" />, bg: 'bg-mustard/10' },
        { label: 'Suspended', value: counts.suspended, icon: <Building04Icon className="w-5 h-5 text-status-error" />, bg: 'bg-status-error/10' },
      ]} />

      <ClayCard padding="none">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-clay-border">
          <h3 className="font-bold text-text-primary text-sm">Registered Companies</h3>
          <div className="flex items-center gap-2">
            <SearchField className="w-56" value={list.search} onChange={list.setSearch} placeholder="Search name or CAC..." />
            <Button variant="primary" size="sm" onClick={handleCreate}>+ Add Company</Button>
          </div>
        </div>
        <AccountTable
          list={list}
          columns={columns}
          noun="companies"
          onRowClick={company => handleExpand(company.id)}
          renderExpanded={renderAgents}
        />
      </ClayCard>

      {/* ── Company Detail Modal ─────────────────────────── */}
      <Modal open={!!detailCompany} onClose={() => setDetailCompany(null)} title="Company Profile" size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDetailCompany(null)}>Close</Button>
            {/* SECURITY-FIX (AD-H3): approve/suspend gated on company capabilities. */}
            {detailCompany?.status === 'pending' && canApprove && <Button variant="success" size="sm" onClick={() => detailCompany && handleApprove(detailCompany)}>Approve Company</Button>}
            {detailCompany && canToggle(detailCompany) && (detailCompany.status !== 'suspended'
              ? <Button variant="danger" size="sm" onClick={() => confirmStatusChange(detailCompany)}>Suspend Company</Button>
              : <Button variant="success" size="sm" onClick={() => confirmStatusChange(detailCompany)}>Reinstate Company</Button>
            )}
          </>
        }
      >
        {detailCompany && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-clay-border">
              <div className="w-14 h-14 rounded-clay-sm bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white text-2xl font-bold shadow-clay">
                {detailCompany.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-text-primary text-lg">{detailCompany.name}</h3>
                {detailCompany.tradingName && <p className="text-sm text-text-tertiary">Trading as: {detailCompany.tradingName}</p>}
                <div className="flex gap-2 mt-1">
                  <StatusBadge status={detailCompany.status as any} />
                  <StatusBadge status={detailCompany.tier as any} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'CAC Number', value: detailCompany.cacNumber },
                { label: 'TIN', value: detailCompany.tin },
                { label: 'Director', value: detailCompany.director },
                { label: 'Email', value: detailCompany.email },
                { label: 'Phone', value: detailCompany.phone },
                { label: 'Office Address', value: detailCompany.officeAddress },
                { label: 'Total Agents', value: String(detailCompany.agentsCount) },
                { label: 'Total Listings', value: String(detailCompany.listingsCount) },
                { label: 'Date Joined', value: detailCompany.joinDate },
                { label: 'Tier', value: detailCompany.tier.charAt(0).toUpperCase() + detailCompany.tier.slice(1) },
                { label: 'Bank Name', value: detailCompany.bankName || '—' },
                { label: 'Account Name', value: detailCompany.accountName || '—' },
                { label: 'Account Number', value: detailCompany.accountNumber || '—' },
                {
                  label: 'Subaccount', value: detailCompany.subaccountCode ? (
                    <span className="flex items-center gap-1 text-status-success text-xs font-semibold">Active {detailCompany.subaccountCode.slice(-6)}</span>
                  ) : '—'
                },
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

      {/* ── Suspend / Reinstate Confirm Modal ────────────── */}
      <Modal open={!!statusConfirm} onClose={() => setStatusConfirm(null)} title="Confirm Action" size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setStatusConfirm(null)}>Cancel</Button>
            <Button variant={statusConfirm?.status === 'suspended' ? 'success' : 'danger'} size="sm" onClick={() => statusConfirm && handleStatusChange(statusConfirm)}>
              {statusConfirm?.status === 'suspended' ? 'Reinstate Company' : 'Suspend Company'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          {statusConfirm?.status === 'suspended'
            ? `Reinstate ${statusConfirm?.name}? The company and its members will regain access to the platform.`
            : `Suspend ${statusConfirm?.name}? The company and its members will lose access until reinstated.`}
        </p>
      </Modal>
    </div>
  );
}
