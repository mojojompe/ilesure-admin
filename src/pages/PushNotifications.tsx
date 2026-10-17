import { useState } from 'react';
import {
  Notification01Icon,
  Mail01Icon
} from '@hugeicons/react';
import { clsx } from 'clsx';
import { PushTab } from './notifications/PushTab';
import { EmailTab } from './notifications/EmailTab';

type ActiveTab = 'push' | 'email';

export function PushNotifications() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('push');

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-clay-border-light rounded-clay-sm p-1 border border-clay-border w-full sm:w-fit overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('push')}
          className={clsx(
            'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-clay-sm text-xs sm:text-sm font-semibold transition-all whitespace-nowrap',
            activeTab === 'push'
              ? 'bg-white text-burnt-brown shadow-clay-sm'
              : 'text-text-secondary hover:text-text-primary',
          )}
        >
          <Notification01Icon className="w-4 h-4 flex-shrink-0" />
          <span>Push Notifications</span>
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={clsx(
            'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-clay-sm text-xs sm:text-sm font-semibold transition-all whitespace-nowrap',
            activeTab === 'email'
              ? 'bg-white text-burnt-brown shadow-clay-sm'
              : 'text-text-secondary hover:text-text-primary',
          )}
        >
          <Mail01Icon className="w-4 h-4 flex-shrink-0" />
          <span>Email Broadcast</span>
        </button>
      </div>

      {activeTab === 'push' ? <PushTab /> : <EmailTab />}
    </div>
  );
}
