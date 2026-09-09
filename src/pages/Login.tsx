import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LockIcon,
  Mail01Icon,
  ArrowRight01Icon,
  Alert01Icon,
  SecurityCheckIcon
} from '@hugeicons/react';
import { Button } from '../components/ui/Button';
import { adminLogin, setAdminToken } from '../api/auth';

export function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    setLoading(true);
    try {
      const response = await adminLogin({ email, password });
      if (response.success && response.data?.adminToken) {
        setAdminToken(response.data.adminToken);
        localStorage.setItem('ilesure_admin_auth', 'true');
        navigate('/', { replace: true });
      } else {
        setError(response.error?.message || 'Invalid admin credentials.');
        setLoading(false);
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-mustard selection:text-white">

      {/* ── Left Panel — Brand ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(155deg, #5C2E0F 0%, #3D1D0A 50%, #2A1206 100%)' }}>

        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 orb"
          style={{ background: 'radial-gradient(circle, #E8941E 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-8 orb orb-delay"
          style={{ background: 'radial-gradient(circle, #9B5B35 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm">
            <img src="/NoBG Logo.png" alt="iléSure" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <div className="text-white font-bold text-xl leading-tight">iléSure</div>
            <div className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(232,148,30,0.7)' }}>Admin Portal</div>
          </div>
        </div>

        {/* Centre copy */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 mb-6">
            <SecurityCheckIcon className="w-3.5 h-3.5 text-mustard-light" />
            <span className="text-[12px] font-semibold text-white/70 tracking-wide">Secure Admin Access</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-snug mb-4">
            Your Sure Home<br />
            <span style={{ color: '#E8941E' }}>Management Hub</span>
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-sm">
            Full visibility and control over listings, users, agents, bookings, and platform analytics — all in one place.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['Real-time Analytics', 'Agent Verification', 'Booking Control', 'Revenue Tracking'].map(f => (
              <span key={f} className="px-3 py-1 rounded-full text-[12px] font-medium text-white/60 bg-white/8 border border-white/10">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-status-success animate-pulse-dot" />
            <span className="text-[13px] font-semibold text-white/60">All systems operational</span>
          </div>
          <p className="text-white/25 text-xs">© 2026 iléSure Technologies</p>
        </div>
      </div>

      {/* ── Right Panel — Form ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-off-white">
        {/* Subtle background decor */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-mustard/4 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-burnt-brown/4 blur-3xl" />
        </div>

        <div className="w-full max-w-[400px] relative z-10 animate-fade-in">

          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-[18px] bg-white flex items-center justify-center shadow-clay-sm mb-3 border border-clay-border">
              <img src="/NoBG Logo.png" alt="iléSure" className="w-9 h-9 object-contain" />
            </div>
            <span className="text-text-tertiary text-sm font-medium">iléSure Admin Portal</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[28px] font-extrabold text-text-primary leading-tight">Welcome back</h2>
            <p className="text-text-tertiary text-sm mt-1.5">Sign in to manage the platform</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-status-error/8 text-status-error text-sm font-medium rounded-[14px] border border-status-error/20 mb-6">
              <Alert01Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail01Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@ilesure.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-clay-border rounded-[14px] text-sm text-text-primary
                    placeholder:text-text-tertiary/60 outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/15
                    transition-all duration-150 shadow-clay-sm font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-clay-border rounded-[14px] text-sm text-text-primary
                    placeholder:text-text-tertiary/60 outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/15
                    transition-all duration-150 shadow-clay-sm font-medium"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-[52px] mt-2 text-base font-bold rounded-[14px]"
              loading={loading}
              iconRight={<ArrowRight01Icon className="w-5 h-5" />}
            >
              Sign In Securely
            </Button>
          </form>

          <div className="flex items-center justify-center gap-2 mt-8">
            <SecurityCheckIcon className="w-3.5 h-3.5 text-text-tertiary" />
            <p className="text-[12px] text-text-tertiary font-medium">Protected by JWT authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
}
