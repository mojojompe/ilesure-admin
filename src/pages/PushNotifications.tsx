import { useState, useEffect } from 'react';
import { Send, Bell, Users, Globe, Search, X } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { clsx } from 'clsx';
import { adminApi } from '../api/admin';

type TargetMode = 'all' | 'roles' | 'users';

const NOTIFICATION_TYPES = [
  { value: 'system', label: 'System Announcement' },
  { value: 'listing', label: 'Listing Update' },
  { value: 'booking', label: 'Booking' },
  { value: 'verification', label: 'Verification' },
  { value: 'message', label: 'Message' },
  { value: 'match', label: 'Match' },
];

const ROLE_OPTIONS = [
  { value: 'student', label: 'Students' },
  { value: 'agent', label: 'Agents' },
  { value: 'landlord', label: 'Landlords' },
  { value: 'company_admin', label: 'Company Admins' },
  { value: 'sub_agent', label: 'Sub-Agents' },
];

export function PushNotifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('system');
  const [targetMode, setTargetMode] = useState<TargetMode>('all');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (targetMode !== 'users' || userSearch.length < 2) {
      setUserResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await adminApi.users.list(`?search=${encodeURIComponent(userSearch)}&limit=10`);
        if (res.success && res.data?.users) {
          setUserResults(res.data.users);
        }
      } catch { } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch, targetMode]);

  const addUser = (u: any) => {
    if (!selectedUsers.find(su => su._id === u._id)) {
      setSelectedUsers(prev => [...prev, u]);
    }
    setUserSearch('');
    setUserResults([]);
  };

  const removeUser = (id: string) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== id));
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const payload: any = { title: title.trim(), body: body.trim(), type };
      if (targetMode === 'roles' && selectedRoles.length > 0) {
        payload.roles = selectedRoles;
      } else if (targetMode === 'users' && selectedUsers.length > 0) {
        payload.userIds = selectedUsers.map(u => u._id);
      }
      const res = await adminApi.notifications.sendPush(payload);
      setResult({ success: res.success, message: res.message || (res.success ? 'Sent successfully' : 'Failed to send') });
      if (res.success) {
        setTitle('');
        setBody('');
        setType('system');
        setTargetMode('all');
        setSelectedRoles([]);
        setSelectedUsers([]);
      }
    } catch (e: any) {
      setResult({ success: false, message: e?.message || 'Failed to send notification' });
    } finally {
      setSending(false);
    }
  };

  const canSend = title.trim().length > 0 && body.trim().length > 0
    && (targetMode !== 'roles' || selectedRoles.length > 0)
    && (targetMode !== 'users' || selectedUsers.length > 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Push Notifications</h1>
          <p className="text-sm text-text-tertiary mt-1">Send push notifications to users</p>
        </div>
        <Button
          variant="mustard"
          icon={<Bell className="w-4 h-4" />}
          onClick={() => setShowPreview(true)}
          disabled={!canSend}
        >
          Preview & Send
        </Button>
      </div>

      {/* Result Banner */}
      {result && (
        <div className={clsx(
          'px-5 py-3 rounded-clay-sm border flex items-center gap-3',
          result.success ? 'bg-status-success/10 border-status-success/20 text-status-success' : 'bg-status-error/10 border-status-error/20 text-status-error',
        )}>
          <span className="text-sm font-semibold">{result.message}</span>
          <button className="ml-auto text-current opacity-60 hover:opacity-100" onClick={() => setResult(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Compose Card */}
      <ClayCard>
        <div className="space-y-5">
          {/* Notification Type */}
          <div>
            <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Notification Type</label>
            <div className="flex flex-wrap gap-2">
              {NOTIFICATION_TYPES.map(nt => (
                <button
                  key={nt.value}
                  onClick={() => setType(nt.value)}
                  className={clsx(
                    'px-3 py-1.5 rounded-pill text-xs font-semibold border transition-all',
                    type === nt.value
                      ? 'bg-burnt-brown text-white border-burnt-brown shadow-clay-sm'
                      : 'bg-white text-text-secondary border-clay-border hover:border-burnt-brown/30',
                  )}
                >
                  {nt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Important System Update"
              maxLength={100}
              className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm placeholder:text-text-tertiary outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/20 transition-all"
            />
            <span className="text-[10px] text-text-tertiary mt-1 block text-right">{title.length}/100</span>
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Message Body *</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your notification message here..."
              rows={5}
              maxLength={500}
              className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm placeholder:text-text-tertiary outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/20 transition-all resize-none"
            />
            <span className="text-[10px] text-text-tertiary mt-1 block text-right">{body.length}/500</span>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">Target Audience</label>
            <div className="flex gap-2 mb-4">
              {[
                { mode: 'all' as TargetMode, label: 'All Users', icon: <Globe className="w-3.5 h-3.5" /> },
                { mode: 'roles' as TargetMode, label: 'By Role', icon: <Users className="w-3.5 h-3.5" /> },
                { mode: 'users' as TargetMode, label: 'Specific Users', icon: <Search className="w-3.5 h-3.5" /> },
              ].map(t => (
                <button
                  key={t.mode}
                  onClick={() => setTargetMode(t.mode)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 rounded-clay-sm text-xs font-semibold border transition-all',
                    targetMode === t.mode
                      ? 'bg-burnt-brown text-white border-burnt-brown shadow-clay-sm'
                      : 'bg-white text-text-secondary border-clay-border hover:border-burnt-brown/30',
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Role checkboxes */}
            {targetMode === 'roles' && (
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map(ro => (
                  <label key={ro.value} className="flex items-center gap-2 px-3 py-2 bg-clay-border-light rounded-clay-sm cursor-pointer hover:bg-clay-border transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(ro.value)}
                      onChange={() => {
                        setSelectedRoles(prev =>
                          prev.includes(ro.value) ? prev.filter(r => r !== ro.value) : [...prev, ro.value]
                        );
                      }}
                      className="rounded border-clay-border text-burnt-brown focus:ring-burnt-brown/20"
                    />
                    <span className="text-sm font-medium text-text-secondary">{ro.label}</span>
                  </label>
                ))}
              </div>
            )}

            {/* User search + chips */}
            {targetMode === 'users' && (
              <div className="space-y-3">
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(u => (
                      <span key={u._id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-burnt-brown-pale text-burnt-brown-dark rounded-pill text-xs font-semibold">
                        {u.fullName || u.email}
                        <button onClick={() => removeUser(u._id)} className="hover:text-status-error transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full pl-9 pr-4 py-2 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm placeholder:text-text-tertiary outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/20 transition-all"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-mustard border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {userResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-clay-border rounded-clay-sm shadow-clay-lg z-10 max-h-48 overflow-y-auto">
                      {userResults.map((u: any) => (
                        <button
                          key={u._id}
                          onClick={() => addUser(u)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-clay-border-light text-left transition-colors"
                        >
                          <div className="w-7 h-7 rounded-pill bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(u.fullName || u.email || '?').charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{u.fullName || 'Unknown'}</p>
                            <p className="text-xs text-text-tertiary">{u.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-text-tertiary">
                  {selectedUsers.length > 0
                    ? `${selectedUsers.length} user(s) selected`
                    : 'Type at least 2 characters to search'}
                </p>
              </div>
            )}

            {targetMode === 'all' && (
              <p className="text-sm text-text-tertiary bg-clay-border-light rounded-clay-sm px-3 py-2">
                <Globe className="w-3.5 h-3.5 inline mr-1.5" />
                This notification will be sent to <strong>all registered users</strong>.
              </p>
            )}
          </div>
        </div>
      </ClayCard>

      {/* Preview & Send Modal */}
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Preview Notification"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowPreview(false)}>Cancel</Button>
            <Button
              variant="mustard"
              size="sm"
              icon={<Send className="w-4 h-4" />}
              loading={sending}
              onClick={async () => { await handleSend(); setShowPreview(false); }}
            >
              Send Now
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Notification Preview Card */}
          <div className="bg-clay-border-light rounded-clay-lg p-5 border border-clay-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-pill bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white flex-shrink-0 shadow-clay-sm">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary">{title || 'Notification Title'}</p>
                <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{body || 'Notification body...'}</p>
                <p className="text-[10px] text-text-tertiary mt-2">
                  Type: {NOTIFICATION_TYPES.find(nt => nt.value === type)?.label || type}
                  {' · '}
                  {targetMode === 'all' ? 'All Users'
                    : targetMode === 'roles' ? `Roles: ${selectedRoles.join(', ') || 'none'}`
                    : `${selectedUsers.length} specific user(s)`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-mustard/5 rounded-clay-sm px-4 py-3 border border-mustard/20">
            <p className="text-xs text-text-tertiary">
              <strong className="text-burnt-brown">Note:</strong> Push notifications are only delivered to users who have granted notification permissions and have a registered push token. In-app notifications will be saved for all targeted users regardless.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
