import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { Listings } from './pages/Listings';
import { VerificationQueue } from './pages/VerificationQueue';
import { Users } from './pages/Users';
import { Companies } from './pages/Companies';
import { WaitlistData } from './pages/WaitlistData';
import { Analytics } from './pages/Analytics';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';

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
          <Route path="companies" element={<Companies />} />
          <Route path="waitlist" element={<WaitlistData />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
