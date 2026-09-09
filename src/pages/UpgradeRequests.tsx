import { useState, useEffect } from 'react';
import {
  Layers01Icon,
  SparklesIcon,
  Search01Icon,
  FilterIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  UserIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  FireIcon,
  Award01Icon,
  Calendar01Icon,
  Message01Icon,
  FloppyDiskIcon,
  Tag01Icon,
  Loading01Icon,
} from '@hugeicons/react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import upgradeRequestsApi, { RankedStack, RankedStacksResponse } from '../api/upgradeRequests';

export function UpgradeRequests() {
  const [data, setData] = useState<RankedStacksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStackId, setExpandedStackId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [updatingStackId, setUpdatingStackId] = useState<string | null>(null);

  const fetchStacks = async () => {
    try {
      setLoading(true);
      const res = await upgradeRequestsApi.getRankedStacks(activeTab);
      setData(res);
      // Preload admin notes into state
      const initialNotes: Record<string, string> = {};
      res.data.forEach((s) => {
        const firstWithNotes = s.requests.find((r) => r.adminNotes);
        if (firstWithNotes?.adminNotes) {
          initialNotes[s.stackId] = firstWithNotes.adminNotes;
        }
      });
      setEditingNotes(initialNotes);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load feature requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStacks();
  }, [activeTab]);

  const handleStatusChange = async (stackId: string, newStatus: string) => {
    try {
      setUpdatingStackId(stackId);
      await upgradeRequestsApi.updateStackStatus(stackId, { status: newStatus });
      toast.success('Stack status updated successfully');
      fetchStacks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStackId(null);
    }
  };

  const handleSaveNotes = async (stackId: string) => {
    try {
      setUpdatingStackId(stackId);
      const note = editingNotes[stackId] || '';
      await upgradeRequestsApi.updateStackStatus(stackId, { adminNotes: note });
      toast.success('Admin notes saved for stack');
      fetchStacks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save notes');
    } finally {
      setUpdatingStackId(null);
    }
  };

  const filteredStacks = (data?.data || []).filter((s) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.stackTitle.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query) ||
      s.topKeywords.some((k) => k.toLowerCase().includes(query)) ||
      s.requests.some(
        (r) =>
          r.userName.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query)
      )
    );
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-sm border border-amber-300">
          <Award01Icon className="w-4 h-4 text-amber-600 fill-amber-500" />
          Rank #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-sm border border-slate-300">
          <Award01Icon className="w-4 h-4 text-slate-500" />
          Rank #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-bold text-sm border border-orange-300">
          <Award01Icon className="w-4 h-4 text-orange-600" />
          Rank #3
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 font-semibold text-sm border border-neutral-200">
        Rank #{rank}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-textPrimary tracking-tight flex items-center gap-2.5">
            <Layers01Icon className="w-7 h-7 text-primary" />
            Feature Upgrades &amp; Requests
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Automated keyword clustering groups similar user requests into ranked stacks without discarding individual submissions.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ClayCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">
              Total Stacks
            </span>
            <SparklesIcon className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-textPrimary mt-2">
            {data?.summary.totalStacks ?? 0}
          </p>
          <span className="text-xs text-textSecondary mt-1 block">Clustered topics</span>
        </ClayCard>

        <ClayCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">
              UserIcon Requests
            </span>
            <Message01Icon className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-textPrimary mt-2">
            {data?.summary.totalRequests ?? 0}
          </p>
          <span className="text-xs text-textSecondary mt-1 block">Total submissions stacked</span>
        </ClayCard>

        <ClayCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">
              Planned / In Progress
            </span>
            <Clock01Icon className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-textPrimary mt-2">
            {(data?.summary.plannedCount ?? 0) + (data?.summary.inProgressCount ?? 0)}
          </p>
          <span className="text-xs text-textSecondary mt-1 block">On technical roadmap</span>
        </ClayCard>

        <ClayCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">
              Delivered
            </span>
            <CheckmarkCircle02Icon className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-textPrimary mt-2">
            {data?.summary.completedCount ?? 0}
          </p>
          <span className="text-xs text-textSecondary mt-1 block">Completed features</span>
        </ClayCard>
      </div>

      {/* FilterIcon and Search01Icon Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface p-4 rounded-2xl border border-border shadow-sm">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Stacks' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'planned', label: 'Planned' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-background hover:bg-neutral-100 text-textSecondary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search01Icon Input */}
        <div className="relative w-full sm:w-72">
          <Search01Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
          <input
            type="text"
            placeholder="Search01Icon titles, keywords, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-border bg-background text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Stacks List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-2xl border border-border">
          <Loading01Icon className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium text-textSecondary">Loading ranked stacks...</p>
        </div>
      ) : filteredStacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-2xl border border-border text-center px-4">
          <SparklesIcon className="w-12 h-12 text-textSecondary/40 mb-3" />
          <h3 className="text-base font-bold text-textPrimary">No feature requests found</h3>
          <p className="text-xs text-textSecondary mt-1 max-w-sm">
            {searchQuery
              ? 'No stacks match your search criteria.'
              : 'Users have not submitted any upgrade requests in this category yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStacks.map((stack) => {
            const isExpanded = expandedStackId === stack.stackId;

            return (
              <ClayCard
                key={stack.stackId}
                className={clsx(
                  'transition-all border',
                  isExpanded ? 'border-primary/40 shadow-md ring-1 ring-primary/10' : 'border-border'
                )}
              >
                {/* Main Stack Header Row */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Details */}
                    <div className="flex items-start gap-4">
                      {getRankBadge(stack.rank)}

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-extrabold text-textPrimary tracking-tight">
                            {stack.stackTitle}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-neutral-100 text-neutral-700 capitalize border border-neutral-200">
                            {stack.category}
                          </span>
                        </div>

                        {/* Top Keywords */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-xs text-textSecondary flex items-center gap-1 font-medium">
                            <Tag01Icon className="w-3 h-3 text-textSecondary" /> Clustered terms:
                          </span>
                          {stack.topKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Metadata & Controls */}
                    <div className="flex flex-wrap items-center gap-3 self-end lg:self-center">
                      {/* Request Count Badge (The Stack representation) */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-extrabold">
                        <Layers01Icon className="w-4 h-4 text-blue-600" />
                        <span>{stack.requestCount} UserIcon Requests Stacked</span>
                      </div>

                      {/* Total Votes */}
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-bold border border-neutral-200">
                        <FireIcon className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        <span>{stack.totalVotes} votes</span>
                      </div>

                      {/* Status Dropdown */}
                      <select
                        value={stack.status}
                        onChange={(e) => handleStatusChange(stack.stackId, e.target.value)}
                        disabled={updatingStackId === stack.stackId}
                        className={clsx(
                          'text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 cursor-pointer transition-colors',
                          stack.status === 'completed' && 'bg-emerald-50 text-emerald-800 border-emerald-300',
                          stack.status === 'in_progress' && 'bg-amber-50 text-amber-800 border-amber-300',
                          stack.status === 'planned' && 'bg-blue-50 text-blue-800 border-blue-300',
                          stack.status === 'under_review' && 'bg-purple-50 text-purple-800 border-purple-300',
                          stack.status === 'declined' && 'bg-neutral-100 text-neutral-600 border-neutral-300'
                        )}
                      >
                        <option value="under_review">Under Review</option>
                        <option value="planned">Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="declined">Declined</option>
                      </select>

                      {/* Expand Button */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setExpandedStackId(isExpanded ? null : stack.stackId)
                        }
                        className="flex items-center gap-1.5 text-xs font-bold"
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide Submissions</span>
                            <ArrowUp01Icon className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>View All {stack.requestCount} Requests</span>
                            <ArrowDown01Icon className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Stack Drawer: Displays every single user request without discarding! */}
                {isExpanded && (
                  <div className="border-t border-border bg-background/50 p-5 sm:p-6 space-y-5 rounded-b-2xl">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-textSecondary uppercase tracking-wider flex items-center gap-2">
                        <Message01Icon className="w-4 h-4 text-primary" />
                        Original UserIcon Submissions in this Stack ({stack.requests.length})
                      </h4>
                      <span className="text-[11px] text-textSecondary">
                        Latest: {new Date(stack.latestRequestedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Stacked Submissions List */}
                    <div className="space-y-3">
                      {stack.requests.map((item) => (
                        <div
                          key={item._id}
                          className="p-4 rounded-xl bg-surface border border-border/80 shadow-sm space-y-2 hover:border-border transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-textPrimary">
                                {item.title}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600">
                                {item.userRole}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-textSecondary">
                              <span className="flex items-center gap-1 font-medium">
                                <UserIcon className="w-3 h-3" />
                                {item.userName}
                                {item.userEmail ? ` (${item.userEmail})` : ''}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar01Icon className="w-3 h-3" />
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed bg-background p-3 rounded-lg border border-border/50">
                            {item.description}
                          </p>

                          {/* Individual Keywords extracted */}
                          {item.keywords && item.keywords.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pt-1">
                              <span className="text-[11px] text-textSecondary font-medium">
                                Extracted keywords:
                              </span>
                              {item.keywords.map((k, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600"
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Admin Notes Box */}
                    <div className="pt-3 border-t border-border space-y-2">
                      <label className="text-xs font-bold text-textPrimary block">
                        Admin Roadmap &amp; Internal Notes for this Stack:
                      </label>
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={editingNotes[stack.stackId] || ''}
                          onChange={(e) =>
                            setEditingNotes({
                              ...editingNotes,
                              [stack.stackId]: e.target.value,
                            })
                          }
                          placeholder="e.g. Scheduled for Sprint 14; Mobile team investigating installment gateway options."
                          className="flex-1 text-xs p-3 rounded-xl border border-border bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveNotes(stack.stackId)}
                          disabled={updatingStackId === stack.stackId}
                          className="self-end flex items-center gap-1.5 font-bold text-xs"
                        >
                          <FloppyDiskIcon className="w-3.5 h-3.5" />
                          FloppyDiskIcon
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </ClayCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UpgradeRequests;
