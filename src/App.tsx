import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { Listings } from './pages/Listings';
import { VerificationQueue } from './pages/VerificationQueue';
import { Users } from './pages/Users';
import { Companies } from './pages/Companies';
import { Agents } from './pages/Agents';
import { Bookings } from './pages/Bookings';
import { Payments } from './pages/Payments';
import { Reports } from './pages/Reports';
import { WaitlistData } from './pages/WaitlistData';
import { Analytics } from './pages/Analytics';
import { Tiers } from './pages/Tiers';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

// Auth Guard Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = localStorage.getItem('ilesure_admin_auth') === 'true';
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="companies" element={<Companies />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="waitlist" element={<WaitlistData />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="tiers" element={<Tiers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
