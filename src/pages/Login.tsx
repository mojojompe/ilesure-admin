import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    // Hardcoded auth check per user request
    setTimeout(() => {
      if (email === 'admin@ilesure.com' && password === 'TeamNova@04') {
        localStorage.setItem('ilesure_admin_auth', 'true');
        navigate('/', { replace: true });
      } else {
        setError('Invalid admin credentials.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center p-4 selection:bg-mustard selection:text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-burnt-brown/5 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-mustard/5 blur-3xl" />
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-clay bg-white flex items-center justify-center shadow-clay-sm mb-4">
            <img src="/NoBG Logo.png" alt="iléSure Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
          <p className="text-sm text-text-tertiary mt-1">Sign in to the iléSure Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-clay-lg p-8 shadow-clay border border-clay-border">
          <form onSubmit={handleLogin} className="space-y-5">

            {error && (
              <div className="flex items-center gap-2 p-3 bg-status-error/10 text-status-error text-xs font-semibold rounded-clay-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-tertiary pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@iléSure.com"
                  className="w-full pl-10 pr-4 py-3 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-tertiary pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/20 transition-all font-medium"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 mt-2"
              loading={loading}
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Secure Login
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-text-tertiary font-medium mt-8">
          iléSure Administrator Portal
        </p>
      </div>
    </div>
  );
}
