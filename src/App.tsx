import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { Listings } from './pages/Listings';
import { VerificationQueue } from './pages/VerificationQueue';
import { Users } from './pages/Users';
import { Companies } from './pages/Companies';
import { Agents } from './pages/Agents';
import { AgentReviews } from './pages/AgentReviews';
import { Bookings } from './pages/Bookings';
import { Payments } from './pages/Payments';
import { Reports } from './pages/Reports';
import { WaitlistData } from './pages/WaitlistData';
import { Analytics } from './pages/Analytics';
import Tiers from './pages/Tiers';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { AuditLogs } from './pages/AuditLogs';
import { PushNotifications } from './pages/PushNotifications';
import { Ads } from './pages/Ads';
import { NotFound } from './pages/NotFound';
import { isAdminAuthenticated } from './api/auth';

// Auth Guard Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // SECURITY-FIX (AD-C1): Gate on a valid, non-expired admin JWT instead of the
  // spoofable `ilesure_admin_auth` boolean flag (anyone could set that flag in
  // DevTools to load the entire admin UI). The flag may still be set at login for
  // UI convenience, but it is NO LONGER the authorization gate.
  const isAuth = isAdminAuthenticated();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Layout */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="listings" element={<Listings />} />
          <Route path="verification" element={<VerificationQueue />} />
          <Route path="users" element={<Users />} />
          <Route path="agents" element={<Agents />} />
          <Route path="agent-reviews" element={<AgentReviews />} />
          <Route path="companies" element={<Companies />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="waitlist" element={<WaitlistData />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="tiers" element={<Tiers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="notifications" element={<PushNotifications />} />
          <Route path="ads" element={<Ads />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
