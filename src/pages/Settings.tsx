import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Key, Save } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { adminApi } from '../api/admin';
import { getAdminToken } from '../api/auth';

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    newListings: true,
    verificationRequests: true,
    newUserRegistrations: false,
    criticalAlerts: true,
  });
  const [platform, setPlatform] = useState<any>({});
  const [limits, setLimits] = useState<any>({});

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Profile state
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminApi.settings.get();
      console.log('Settings response:', response);
      if (response.success && response.data) {
        setAdminData(response.data.profile);
        setProfileName(response.data.profile?.name || '');
        setNotifications(response.data.notifications || notifications);
        setPlatform(response.data.platform || {});
        setLimits(response.data.limits || {});
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      await adminApi.settings.updateProfile({ name: profileName });
      alert('Profile saved successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      await adminApi.settings.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error?.response?.data?.error || 'Failed to update password');
    }
  };

  const saveSettings = async () => {
    try {
      await adminApi.settings.updateNotifications({ notifications });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'platform', label: 'Platform', icon: SettingsIcon },
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
                  {profileName?.charAt(0) || 'A'}
                </div>
                <div>
                  <Button variant="secondary" size="sm" onClick={() => alert('Change Avatar mocked')}>Change Avatar</Button>
                  <p className="text-[11px] text-text-tertiary mt-2">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Full Name</label>
                  <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Email Address</label>
                  <input 
                    type="email" 
                    readOnly 
                    value={adminData?.email || 'Loading...'} 
                    className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Role</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={adminData?.role === 'super_admin' ? 'System Administrator' : adminData?.role || 'Loading...'} 
                    className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm" 
                  />
                </div>
              </div>

<div className="flex justify-end pt-4 border-t border-clay-border">
                <Button variant="primary" icon={<Save className="w-4 h-4" />} onClick={handleProfileSave}>Save Changes</Button>
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
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard transition-colors" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard transition-colors" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard transition-colors" 
                  />
                </div>
                {passwordError && <p className="text-status-error text-sm">{passwordError}</p>}
                {passwordSuccess && <p className="text-status-success text-sm">Password updated successfully!</p>}
              </div>

              <div className="flex justify-start pt-2">
                <Button variant="primary" onClick={handlePasswordChange}>Update Password</Button>
              </div>
            </ClayCard>
          )}

          {activeTab === 'notifications' && (
            <ClayCard padding="md" className="space-y-6">
              <h3 className="text-base font-bold text-text-primary border-b border-clay-border pb-3">Email Notifications</h3>

              <div className="space-y-4">
                {[
                  { key: 'newListings', title: 'New Listings', desc: 'Receive emails when a new listing is submitted for approval' },
                  { key: 'verificationRequests', title: 'Verification Requests', desc: 'Get notified when an agent or company submits verification docs' },
                  { key: 'newUserRegistrations', title: 'New User Registrations', desc: 'Weekly summary of new signups' },
                  { key: 'criticalAlerts', title: 'Critical System Alerts', desc: 'Uptime warnings and platform errors' },
                ].map(item => (
                  <label key={item.key} className="flex items-start gap-3 p-3 rounded-clay-sm hover:bg-clay-border-light cursor-pointer transition-colors">
                    <div
                      className="mt-0.5 relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-mustard focus:ring-offset-2"
                      style={{ backgroundColor: notifications[item.key as keyof typeof notifications] ? '#D4821A' : '#E7DCD4' }}
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifications[item.key as keyof typeof notifications] ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                      <p className="text-xs text-text-tertiary">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-clay-border">
                <Button variant="primary" icon={<Save className="w-4 h-4" />} onClick={saveSettings}>Save Preferences</Button>
              </div>
            </ClayCard>
          )}

          {activeTab === 'platform' && (
            <ClayCard padding="md" className="space-y-6">
              <h3 className="text-base font-bold text-text-primary border-b border-clay-border pb-3">Platform Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-text-primary">Platform Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-clay-border-light">
                      <span className="text-sm text-text-secondary">Maintenance Mode</span>
                      <button 
                        onClick={() => setPlatform({ ...platform, maintenanceMode: !platform?.maintenanceMode })}
                        className={`w-12 h-6 rounded-full transition-colors ${platform?.maintenanceMode ? 'bg-status-error' : 'bg-status-success/30'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${platform?.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-clay-border-light">
                      <span className="text-sm text-text-secondary">User Registration</span>
                      <button 
                        onClick={() => setPlatform({ ...platform, registrationEnabled: !platform?.registrationEnabled })}
                        className={`w-12 h-6 rounded-full transition-colors ${!platform?.registrationEnabled ? 'bg-status-error' : 'bg-status-success/30'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${!platform?.registrationEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-clay-border-light">
                      <span className="text-sm text-text-secondary">Waitlist</span>
                      <button 
                        onClick={() => setPlatform({ ...platform, waitlistEnabled: !platform?.waitlistEnabled })}
                        className={`w-12 h-6 rounded-full transition-colors ${!platform?.waitlistEnabled ? 'bg-status-error' : 'bg-status-success/30'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${!platform?.waitlistEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-text-primary">Platform Limits</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-clay-border-light">
                      <span className="text-sm text-text-secondary">Max Images per Listing</span>
                      <input 
                        type="number" 
                        defaultValue={limits?.maxImagesPerListing || 10}
                        onChange={(e) => setLimits({ ...limits, maxImagesPerListing: parseInt(e.target.value) })}
                        className="w-20 px-2 py-1 text-sm text-right border border-clay-border rounded" 
                      />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-clay-border-light">
                      <span className="text-sm text-text-secondary">Max Listings per Agent</span>
                      <input 
                        type="number" 
                        defaultValue={limits?.maxListingsPerAgent || 50}
                        onChange={(e) => setLimits({ ...limits, maxListingsPerAgent: parseInt(e.target.value) })}
                        className="w-20 px-2 py-1 text-sm text-right border border-clay-border rounded" 
                      />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-clay-border-light">
                      <span className="text-sm text-text-secondary">Waitlist Max Budget</span>
                      <input 
                        type="number" 
                        defaultValue={limits?.waitlistMaxBudget || 2000000}
                        onChange={(e) => setLimits({ ...limits, waitlistMaxBudget: parseInt(e.target.value) })}
                        className="w-24 px-2 py-1 text-sm text-right border border-clay-border rounded" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-clay-border">
                <Button variant="primary" icon={<Save className="w-4 h-4" />} onClick={() => {
                  adminApi.settings.updatePlatform({ platform, limits });
                  alert('Platform settings saved');
                }}>Save Settings</Button>
              </div>
            </ClayCard>
          )}
        </div>
      </div>
    </div>
  );
}
