import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Key, Save } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-clay bg-mustard/10 flex items-center justify-center flex-shrink-0 shadow-clay-sm">
          <SettingsIcon className="w-6 h-6 text-mustard" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Admin Settings</h2>
          <p className="text-sm text-text-tertiary mt-0.5">Manage your account preferences and platform configurations</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* ── Sidebar Nav ─────────────────────────────────── */}
        <div className="w-full md:w-56 flex-shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-clay-sm text-sm font-semibold transition-all duration-150 ${isActive
                    ? 'bg-burnt-brown text-white shadow-clay-sm'
                    : 'bg-transparent text-text-secondary hover:bg-clay-border-light'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-mustard-light' : 'text-text-tertiary'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Content Area ────────────────────────────────── */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <ClayCard padding="md" className="space-y-6">
              <h3 className="text-base font-bold text-text-primary border-b border-clay-border pb-3">Personal Information</h3>

              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-pill bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white text-3xl font-bold shadow-clay flex-shrink-0">
                  A
                </div>
                <div>
                  <Button variant="secondary" size="sm" onClick={() => alert('Change Avatar mocked')}>Change Avatar</Button>
                  <p className="text-[11px] text-text-tertiary mt-2">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Full Name</label>
                  <input type="text" defaultValue="Super Admin" className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Email Address</label>
                  <input type="email" defaultValue="admin@iléSure.com" className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard transition-colors" disabled />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Role</label>
                  <input type="text" defaultValue="System Administrator" className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none cursor-not-allowed text-text-tertiary" disabled />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-clay-border">
                <Button variant="primary" icon={<Save className="w-4 h-4" />} onClick={() => alert('Save Changes mocked')}>Save Changes</Button>
              </div>
            </ClayCard>
          )}

          {activeTab === 'security' && (
            <ClayCard padding="md" className="space-y-6">
              <h3 className="text-base font-bold text-text-primary border-b border-clay-border pb-3 flex items-center gap-2">
                <Key className="w-4 h-4 text-mustard" /> Change Password
              </h3>

              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard transition-colors" />
                </div>
              </div>

              <div className="flex justify-start pt-2">
                <Button variant="primary" onClick={() => alert('Update Password mocked')}>Update Password</Button>
              </div>
            </ClayCard>
          )}

          {activeTab === 'notifications' && (
            <ClayCard padding="md" className="space-y-6">
              <h3 className="text-base font-bold text-text-primary border-b border-clay-border pb-3">Email Notifications</h3>

              <div className="space-y-4">
                {[
                  { id: '1', title: 'New Listings', desc: 'Receive emails when a new listing is submitted for approval', checked: true },
                  { id: '2', title: 'Verification Requests', desc: 'Get notified when an agent or company submits verification docs', checked: true },
                  { id: '3', title: 'New User Registrations', desc: 'Weekly summary of new signups', checked: false },
                  { id: '4', title: 'Critical System Alerts', desc: 'Uptime warnings and platform errors', checked: true },
                ].map(item => (
                  <label key={item.id} className="flex items-start gap-3 p-3 rounded-clay-sm hover:bg-clay-border-light cursor-pointer transition-colors">
                    <div className="mt-0.5 relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-mustard focus:ring-offset-2" style={{ backgroundColor: item.checked ? '#D4821A' : '#E7DCD4' }}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.checked ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                      <p className="text-xs text-text-tertiary">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-clay-border">
                <Button variant="primary" icon={<Save className="w-4 h-4" />} onClick={() => alert('Save Preferences mocked')}>Save Preferences</Button>
              </div>
            </ClayCard>
          )}
        </div>
      </div>
    </div>
  );
}
