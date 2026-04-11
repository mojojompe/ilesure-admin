import { useState } from 'react';
import { Building2, Users, Home, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { mockCompanies } from '../data/mockData';
import { Company } from '../types';
import { clsx } from 'clsx';

export function Companies() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Summary Row ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Companies', value: mockCompanies.length, icon: <Building2 className="w-5 h-5 text-burnt-brown" />, bg: 'bg-burnt-brown-pale' },
          { label: 'Verified',        value: mockCompanies.filter(c => c.status === 'verified').length,  icon: <Building2 className="w-5 h-5 text-status-success" />, bg: 'bg-status-success/10' },
          { label: 'Pending',         value: mockCompanies.filter(c => c.status === 'pending').length,   icon: <Building2 className="w-5 h-5 text-mustard" />,        bg: 'bg-mustard/10' },
          { label: 'Total Agents',    value: mockCompanies.reduce((s, c) => s + c.agentsCount, 0),       icon: <Users className="w-5 h-5 text-burnt-brown-light" />,   bg: 'bg-burnt-brown-pale' },
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

      {/* ── Companies Table ─────────────────────────────── */}
      <ClayCard padding="none">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-clay-border">
          <h3 className="font-bold text-text-primary text-sm">Registered Companies</h3>
          <Button variant="primary" size="sm" onClick={() => alert('Add Company mocked')}>+ Add Company</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full clay-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>CAC Number</th>
                <th>Director</th>
                <th>Tier</th>
                <th>Agents</th>
                <th>Listings</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockCompanies.map(company => (
                <>
                  <tr key={company.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === company.id ? null : company.id)}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-clay-sm bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white font-bold text-sm shadow-clay-sm flex-shrink-0">
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary text-sm leading-tight">{company.name}</p>
                          {company.tradingName && <p className="text-[11px] text-text-tertiary">t/a {company.tradingName}</p>}
                        </div>
                      </div>
                    </td>
                    <td><span className="text-xs font-mono text-text-secondary bg-clay-border-light px-2 py-1 rounded-clay-sm">{company.cacNumber}</span></td>
                    <td><span className="text-sm text-text-secondary">{company.director}</span></td>
                    <td><StatusBadge status={company.tier as any} /></td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-pill bg-mustard/10 flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-mustard" />
                        </div>
                        <span className="text-sm font-semibold text-text-primary">{company.agentsCount}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-pill bg-burnt-brown-pale flex items-center justify-center">
                          <Home className="w-3.5 h-3.5 text-burnt-brown" />
                        </div>
                        <span className="text-sm font-semibold text-text-primary">{company.listingsCount}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={company.status as any} /></td>
                    <td><span className="text-xs text-text-tertiary">{company.joinDate}</span></td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setDetailCompany(company)} className="w-7 h-7 flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors" title="View">
                          <Eye className="w-3.5 h-3.5 text-text-secondary" />
                        </button>
                        <button onClick={() => setExpandedId(expandedId === company.id ? null : company.id)} className="w-7 h-7 flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors">
                          {expandedId === company.id ? <ChevronUp className="w-3.5 h-3.5 text-text-secondary" /> : <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded: sub-agents mock list */}
                  {expandedId === company.id && (
                    <tr key={`${company.id}-exp`} className="bg-mustard-pale/40">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">Sub-Agents under {company.name}</p>
                          <Button variant="secondary" size="sm" onClick={() => alert('Invite Agent mocked')}>+ Invite Agent</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {Array.from({ length: Math.min(company.agentsCount, 4) }, (_, i) => (
                            <div key={i} className="bg-white rounded-clay-sm border border-clay-border shadow-clay-sm p-3 flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-pill bg-burnt-brown-pale flex items-center justify-center text-burnt-brown font-bold text-xs flex-shrink-0">
                                {String.fromCharCode(65 + i)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-text-primary">Agent {i + 1}</p>
                                <p className="text-xs text-text-tertiary">agent{i + 1}@{company.tradingName?.toLowerCase() || 'company'}.ng</p>
                              </div>
                              <StatusBadge status="verified" showIcon={false} className="ml-auto text-[10px]" />
                            </div>
                          ))}
                          {company.agentsCount > 4 && (
                            <div className="bg-clay-border-light rounded-clay-sm border border-clay-border p-3 flex items-center justify-center text-xs text-text-tertiary font-medium">
                              +{company.agentsCount - 4} more agents
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </ClayCard>

      {/* ── Company Detail Modal ─────────────────────────── */}
      <Modal open={!!detailCompany} onClose={() => setDetailCompany(null)} title="Company Profile" size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDetailCompany(null)}>Close</Button>
            {detailCompany?.status === 'pending' && <Button variant="success" size="sm" onClick={() => { alert('Approve mocked'); setDetailCompany(null); }}>Approve Company</Button>}
            <Button variant="danger" size="sm" onClick={() => { alert('Suspend mocked'); setDetailCompany(null); }}>Suspend Company</Button>
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
                { label: 'CAC Number',     value: detailCompany.cacNumber },
                { label: 'TIN',            value: detailCompany.tin },
                { label: 'Director',       value: detailCompany.director },
                { label: 'Email',          value: detailCompany.email },
                { label: 'Phone',          value: detailCompany.phone },
                { label: 'Office Address', value: detailCompany.officeAddress },
                { label: 'Total Agents',   value: String(detailCompany.agentsCount) },
                { label: 'Total Listings', value: String(detailCompany.listingsCount) },
                { label: 'Date Joined',    value: detailCompany.joinDate },
                { label: 'Tier',           value: detailCompany.tier.charAt(0).toUpperCase() + detailCompany.tier.slice(1) },
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
