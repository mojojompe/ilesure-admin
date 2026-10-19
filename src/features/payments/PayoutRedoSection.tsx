import { useCallback, useEffect, useState } from 'react';
import { Loading01Icon } from '@hugeicons/react';
import { Modal as AntModal } from 'antd';
import toast from 'react-hot-toast';
import { ClayCard } from '../../components/ui/ClayCard';
import { Button } from '../../components/ui/Button';
import { adminApi } from '../../api/admin';
import { can, CAP } from '../../lib/rbac';
import { errorMessage } from '../../api/errors';

interface Candidate {
  kind: 'user' | 'company';
  id: string;
  name: string;
  emails: string[];
}

interface Report {
  liveKey: boolean;
  checked: number;
  alreadyValid: number;
  candidates: Candidate[];
  errors: { kind: string; id: string; name: string; reason: string }[];
  asked?: number;
  emailFailures?: { email: string; reason: string }[];
}

/**
 * Go-live: payout accounts set up while Paystack was in test mode cannot receive live
 * payments. This lists their owners (checked against the server's live key) and, on
 * confirmation, clears those accounts and emails each owner to add their bank account again.
 */
export function PayoutRedoSection() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [problem, setProblem] = useState('');
  const canRun = can(CAP.PAYMENTS_PROCESS);

  const check = useCallback(async () => {
    setLoading(true);
    setProblem('');
    try {
      const res = await adminApi.payments.payoutRedoPreview();
      setReport(res.data);
    } catch (err) {
      setReport(null);
      setProblem(errorMessage(err, 'Could not check payout accounts'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  const run = () => {
    const n = report?.candidates.length || 0;
    AntModal.confirm({
      title: `Ask ${n} lister${n === 1 ? '' : 's'} to add their payout account again?`,
      content: 'Their old test-mode payout accounts will be cleared and each will get an email with a link to Settings. Until they add it again, their listings are hidden from renters once payments are on. This cannot be undone.',
      okText: 'Clear and send emails',
      okButtonProps: { danger: true },
      onOk: async () => {
        setRunning(true);
        try {
          const res = await adminApi.payments.payoutRedoRun();
          setReport(res.data);
          toast.success(res.message || 'Done');
          const failed = res.data?.emailFailures?.length || 0;
          if (failed > 0) toast.error(`${failed} email${failed === 1 ? '' : 's'} could not be sent. See the list below.`);
        } catch (err) {
          toast.error(errorMessage(err, 'Failed to send the requests'));
        } finally {
          setRunning(false);
        }
      },
    });
  };

  return (
    <ClayCard padding="none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3.5 border-b border-clay-border gap-3">
        <div>
          <h3 className="font-bold text-text-primary text-sm">Payout accounts from test mode</h3>
          <p className="text-xs text-text-tertiary mt-0.5">
            Listers who added a bank account before Paystack went live must add it again to be paid.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={check} disabled={loading || running}>Check again</Button>
          {canRun && report && report.candidates.length > 0 && report.asked === undefined && (
            <Button size="sm" onClick={run} disabled={running}>
              {running ? 'Sending...' : `Ask ${report.candidates.length} to add it again`}
            </Button>
          )}
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-text-tertiary text-sm">
            <Loading01Icon className="w-4 h-4 animate-spin text-mustard" /> Checking every payout account with Paystack...
          </div>
        ) : problem ? (
          <p className="text-sm text-status-error">{problem}</p>
        ) : report ? (
          <>
            <p className="text-sm text-text-secondary">
              {report.asked !== undefined
                ? `${report.asked} asked to add their payout account again. ${report.alreadyValid} already had a live account.`
                : `${report.checked} payout account${report.checked === 1 ? '' : 's'} on file: ${report.alreadyValid} already live, ${report.candidates.length} from test mode.`}
            </p>
            {report.candidates.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full clay-table">
                  <thead>
                    <tr><th>{report.asked !== undefined ? 'Asked' : 'Will be asked'}</th><th>Type</th><th>Email</th></tr>
                  </thead>
                  <tbody>
                    {report.candidates.map((c) => (
                      <tr key={`${c.kind}:${c.id}`}>
                        <td><span className="text-sm font-semibold text-text-primary">{c.name || '—'}</span></td>
                        <td><span className="text-sm text-text-secondary capitalize">{c.kind === 'user' ? 'Lister' : 'Company'}</span></td>
                        <td><span className="text-xs text-text-tertiary">{c.emails.join(', ') || 'No email on file'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {report.errors.length > 0 && (
              <p className="text-xs text-status-error">
                {report.errors.length} account{report.errors.length === 1 ? '' : 's'} could not be checked with Paystack. Click "Check again" to retry.
              </p>
            )}
            {(report.emailFailures?.length || 0) > 0 && (
              <p className="text-xs text-status-error">
                Emails that could not be sent (their accounts were cleared; contact them directly): {report.emailFailures!.map((f) => f.email).join(', ')}
              </p>
            )}
          </>
        ) : null}
      </div>
    </ClayCard>
  );
}
