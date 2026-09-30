import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminLayout } from './layouts/AdminLayout';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { isAdminAuthenticated } from './api/auth';
import { NAV_TABLE } from './navigation/routeTable';
import { RouteGuard } from './navigation/RouteGuard';

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

        {/* Protected Dashboard Layout: every page comes from NAV_TABLE. */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          {NAV_TABLE.map(entry =>
            entry.path === '/'
              ? <Route key={entry.path} index element={<RouteGuard entry={entry} />} />
              : <Route key={entry.path} path={entry.path.slice(1)} element={<RouteGuard entry={entry} />} />,
          )}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
