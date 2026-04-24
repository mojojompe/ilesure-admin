import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, AlertCircle, Clock, ChevronRight, User, Building2 } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { mockVerifications } from '../data/mockData';
import { VerificationRequest } from '../types';
import { clsx } from 'clsx';
import { adminApi } from '../api/admin';

const docLabels: Record<string, string> = {
  nin: 'Govt. ID (NIN)', bvn: 'BVN', ownershipCert: 'Ownership Certificate',
  utilityBill: 'Utility Bill', selfie: 'Selfie / Photo',
  cacCert: 'CAC Certificate', cacForm: 'CAC Form 2/7',
  tin: 'Tax ID (TIN)', directorNin: 'Director NIN',
};

const agentChecklist = [
  { key: 'ninVerified',        label: 'Government ID (NIN) verified' },
  { key: 'bvnConfirmed',       label: 'BVN confirmed' },
  { key: 'ownershipReviewed',  label: 'Property ownership document reviewed' },
  { key: 'utilityBillChecked', label: 'Utility bill not older than 3 months' },
  { key: 'selfieMatches',      label: 'Selfie matches identity document' },
  { key: 'otpVerified',        label: 'Phone OTP verified' },
];
const companyExtra = [
  { key: 'cacVerified',        label: 'CAC Certificate verified' },
  { key: 'cacFormVerified',    label: 'CAC Form 2 or 7 reviewed' },
  { key: 'tinVerified',        label: 'Tax Identification Number (TIN) confirmed' },
  { key: 'directorNinVerified',label: 'Director NIN verified' },
];

export function VerificationQueue() {
  const [selected, setSelected] = useState<VerificationRequest | null>(null);
  const [verifications, setVerifications] = useState<any[]>(mockVerifications);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [adminNote, setAdminNote] = useState('');
  const [activeDoc, setActiveDoc] = useState<string>('nin');
  const [confirmModal, setConfirmModal] = useState<'approve' | 'reject' | 'info' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const response = await adminApi.verifications.list();
      if (response.success && response.data?.verifications) {
        const formatted = response.data.verifications.map((v: any) => ({
          id: v._id || v.id,
          applicantName: v.applicantName || v.fullName || '',
          applicantEmail: v.applicantEmail || v.email || '',
          applicantPhone: v.applicantPhone || v.phone || '',
          role: v.role,
          companyName: v.companyName,
          submittedDate: v.submittedDate || v.createdAt ? new Date(v.submittedDate || v.createdAt).toISOString().split('T')[0] : '',
          status: v.status || v.verificationStatus,
          documents: v.documents || {},
          checklist: v.checklist || {
            ninVerified: false,
            bvnConfirmed: false,
            ownershipReviewed: false,
            utilityBillChecked: false,
            selfieMatches: false,
            otpVerified: false,
          },
          adminNotes: v.adminNotes || '',
        }));
        setVerifications(formatted);
        if (formatted.length > 0 && !selected) {
          handleSelect(formatted[0], formatted[0].checklist, formatted[0].adminNotes);
        }
      }
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (r: any, check?: Record<string, boolean>, notes?: string) => {
    setSelected(r);
    setChecklist(check || {
      ninVerified: false,
      bvnConfirmed: false,
      ownershipReviewed: false,
      utilityBillChecked: false,
      selfieMatches: false,
      otpVerified: false,
    });
    setAdminNote(notes || r.adminNotes || '');
    setActiveDoc('nin');
  };

  const handleSaveChecklist = async () => {
    if (!selected) return;
    try {
      await adminApi.verifications.updateChecklist(selected.id, checklist);
    } catch (error) {
      console.error('Failed to save checklist:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    try {
      await adminApi.verifications.updateNotes(selected.id, adminNote);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const confirmVerificationAction = async () => {
    if (!selected || !confirmModal) return;
    
    try {
      switch (confirmModal) {
        case 'approve':
          await adminApi.verifications.approve(selected.id);
          break;
        case 'reject':
          await adminApi.verifications.reject(selected.id, adminNote);
          break;
        case 'info':
          await adminApi.verifications.requestInfo(selected.id, adminNote);
          break;
      }
      await fetchVerifications();
      setConfirmModal(null);
    } catch (error) {
      console.error('Failed to perform verification action:', error);
    }
  };

  const checklistItems = selected?.role === 'company'
    ? [...agentChecklist, ...companyExtra]
    : agentChecklist;

  const completedCount = checklistItems.filter(i => checklist[i.key]).length;
  const progressPct = Math.round((completedCount / checklistItems.length) * 100);

  const availableDocs = selected ? Object.entries(selected.documents)
    .filter(([, v]) => v && 'url' in (v as any))
    .map(([k]) => k) : [];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Queue List (top strip) ───────────────────────── */}
      <ClayCard padding="none">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-clay-border">
          <Clock className="w-4 h-4 text-mustard" />
          <h3 className="font-bold text-text-primary text-sm">Pending Verifications ({verifications.length})</h3>
        </div>
        <div className="flex overflow-x-auto divide-x divide-clay-border-light">
          {verifications.map((req) => (
            <button
              key={req.id}
              onClick={() => handleSelect(req, req.checklist, req.adminNotes)}
              className={clsx(
                'flex-shrink-0 flex items-center gap-3 px-5 py-3.5 text-left transition-all duration-150 hover:bg-mustard-pale group min-w-[220px]',
                selected?.id === req.id && 'bg-burnt-brown/5 border-b-2 border-burnt-brown',
              )}
            >
              <div className={clsx('w-9 h-9 rounded-pill flex items-center justify-center text-sm font-bold shadow-clay-sm flex-shrink-0',
                req.role === 'company' ? 'bg-mustard/15 text-mustard' : 'bg-burnt-brown-pale text-burnt-brown'
              )}>
                {req.role === 'company' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{req.applicantName}</p>
                <p className="text-xs text-text-tertiary capitalize">{req.role} · {req.submittedDate}</p>
              </div>
              <ChevronRight className={clsx('w-4 h-4 text-text-tertiary ml-auto flex-shrink-0 transition-transform', selected?.id === req.id && 'text-burnt-brown')} />
            </button>
          ))}
        </div>
      </ClayCard>

      {/* ── Split Panel ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* LEFT — Document Viewer (3/5) */}
        <div className="xl:col-span-3 space-y-4">
          {/* Doc Tabs */}
          <ClayCard padding="none">
            <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-clay-border flex-wrap">
              {availableDocs.map((docKey) => (
                <button
                  key={docKey}
                  onClick={() => setActiveDoc(docKey)}
                  className={clsx(
                    'px-3 py-2 text-xs font-semibold rounded-t-clay-sm -mb-px border-b-2 transition-all duration-150',
                    activeDoc === docKey
                      ? 'border-burnt-brown text-burnt-brown bg-burnt-brown/5'
                      : 'border-transparent text-text-tertiary hover:text-text-secondary',
                  )}
                >
                  {docLabels[docKey] || docKey}
                </button>
              ))}
            </div>

            {/* Document Preview Area */}
            <div className="p-6">
              <div className="bg-clay-border-light rounded-clay border-2 border-dashed border-clay-border flex flex-col items-center justify-center min-h-72 gap-4">
                <div className="w-16 h-16 rounded-clay bg-burnt-brown-pale flex items-center justify-center shadow-clay">
                  <FileText className="w-8 h-8 text-burnt-brown" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-text-primary text-sm">{docLabels[activeDoc] || activeDoc}</p>
                  <p className="text-xs text-text-tertiary mt-1">Submitted by {selected?.applicantName || 'N/A'}</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  <Button variant="primary" size="sm" onClick={() => alert('View document mocked')}>View Full Document</Button>
                  <Button variant="secondary" size="sm" onClick={() => alert('Download document mocked')}>Download</Button>
                </div>
                {/* Verification badge on doc */}
                {(selected?.documents as any)?.[activeDoc]?.verified && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-status-success bg-status-success/10 px-3 py-1 rounded-pill">
                    <CheckCircle className="w-3 h-3" /> Previously verified
                  </span>
                )}
              </div>
            </div>
          </ClayCard>

          {/* Applicant info summary */}
          <ClayCard padding="md">
            <h4 className="font-bold text-text-primary text-sm mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-burnt-brown" /> Applicant Details
            </h4>
            {selected && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Name',       value: selected.applicantName },
                { label: 'Role',       value: selected.role?.charAt(0).toUpperCase() + selected.role?.slice(1) },
                { label: 'Email',      value: selected.applicantEmail },
                { label: 'Phone',      value: selected.applicantPhone },
                { label: 'Submitted', value: selected.submittedDate },
                { label: 'Company',   value: selected.companyName || 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-clay-border-light rounded-clay-sm px-3 py-2">
                  <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5 truncate">{value}</p>
                </div>
              ))}
            </div>
            )}
          </ClayCard>
        </div>

        {/* RIGHT — Checklist (2/5) */}
        <div className="xl:col-span-2 space-y-4">
          {/* Progress */}
          <ClayCard padding="md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-text-primary text-sm">Verification Progress</h4>
              {selected && <StatusBadge status={selected.status as any} />}
            </div>
            <div className="h-2.5 bg-clay-border-light rounded-pill overflow-hidden mb-1">
              <div
                className="h-full rounded-pill bg-gradient-to-r from-burnt-brown-light to-mustard transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-text-tertiary">{completedCount} of {checklistItems.length} checks completed</p>
          </ClayCard>

          {/* Checklist items */}
          <ClayCard padding="md">
            <h4 className="font-bold text-text-primary text-sm mb-4">Document Checklist</h4>
            <div className="space-y-2.5">
              {checklistItems.map(({ key, label }) => (
                <label
                  key={key}
                  className={clsx(
                    'flex items-center gap-3 p-2.5 rounded-clay-sm cursor-pointer transition-colors duration-100',
                    checklist[key] ? 'bg-status-success/8' : 'bg-clay-border-light hover:bg-clay-border',
                  )}
                >
                  <div
                    className={clsx(
                      'w-5 h-5 rounded-[6px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150',
                      checklist[key] ? 'bg-status-success border-status-success' : 'bg-white border-clay-border',
                    )}
                    onClick={() => setChecklist(prev => ({ ...prev, [key]: !prev[key] }))}
                  >
                    {checklist[key] && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={clsx('text-xs font-medium flex-1', checklist[key] ? 'text-status-success line-through decoration-status-success/40' : 'text-text-secondary')}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </ClayCard>

          {/* Admin Notes */}
          <ClayCard padding="md">
            <h4 className="font-bold text-text-primary text-sm mb-2">Admin Notes</h4>
            <textarea
              rows={3}
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Add notes about this verification..."
              className="w-full clay-input resize-none text-sm"
            />
          </ClayCard>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button variant="success" className="w-full" icon={<CheckCircle className="w-4 h-4" />} onClick={() => setConfirmModal('approve')}>
              Approve Verification
            </Button>
            <Button variant="mustard" className="w-full" icon={<AlertCircle className="w-4 h-4" />} onClick={() => setConfirmModal('info')}>
              Request More Information
            </Button>
            <Button variant="danger" className="w-full" icon={<XCircle className="w-4 h-4" />} onClick={() => setConfirmModal('reject')}>
              Reject Application
            </Button>
          </div>
        </div>
      </div>

{/* ── Confirmation Modal ───────────────────────────── */}
      <Modal
        open={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        size="sm"
        title={
          confirmModal === 'approve' ? 'Approve Verification' :
          confirmModal === 'reject'  ? 'Reject Verification' :
          'Request More Info'
        }
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setConfirmModal(null)}>Cancel</Button>
            <Button
              variant={confirmModal === 'approve' ? 'success' : confirmModal === 'reject' ? 'danger' : 'mustard'}
              size="sm"
              onClick={confirmVerificationAction}
            >
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          {confirmModal === 'approve' && selected && `Approving ${selected.applicantName} as a verified ${selected.role}. They will be able to create live listings.`}
          {confirmModal === 'reject' && selected && `Rejecting ${selected.applicantName}'s application. They will be notified with the reason below.`}
          {confirmModal === 'info' && selected && `Requesting additional information from ${selected.applicantName}. Specify what's needed:`}
        </p>
        {confirmModal !== 'approve' && (
          <textarea rows={3} placeholder="Reason / instructions..." className="w-full clay-input resize-none text-sm mt-3" />
        )}
      </Modal>
    </div>
  );
}
