import { useState } from 'react';
import { Bell, Mail } from 'lucide-react';
import { clsx } from 'clsx';
import { PushTab } from './notifications/PushTab';
import { EmailTab } from './notifications/EmailTab';

type ActiveTab = 'push' | 'email';

export function PushNotifications() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('push');

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-clay-border-light rounded-clay-sm p-1 border border-clay-border w-fit">
        <button
          onClick={() => setActiveTab('push')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-clay-sm text-sm font-semibold transition-all',
            activeTab === 'push'
              ? 'bg-white text-burnt-brown shadow-clay-sm'
              : 'text-text-secondary hover:text-text-primary',
          )}
        >
          <Bell className="w-4 h-4" />
          Push Notifications
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-clay-sm text-sm font-semibold transition-all',
            activeTab === 'email'
              ? 'bg-white text-burnt-brown shadow-clay-sm'
              : 'text-text-secondary hover:text-text-primary',
          )}
        >
          <Mail className="w-4 h-4" />
          Email Broadcast
        </button>
      </div>

      {activeTab === 'push' ? <PushTab /> : <EmailTab />}
    </div>
  );
}
