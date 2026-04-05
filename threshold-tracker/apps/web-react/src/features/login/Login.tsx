import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { syncAll } from '../../api/sync';

export function Login() {
  const { login, loadProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const returnTo = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  async function onSubmit() {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(returnTo, { replace: true });
      // Fire-and-forget: load profile then sync
      loadProfile().then(username => { if (username) syncAll().catch(() => {}); });
    } catch (err: unknown) {
      const e = err as { data?: { detail?: string } };
      setError(e?.data?.detail ?? 'Invalid email or password.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#08080d] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/>
              <line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/>
              <line x1="12" y1="22" x2="12" y2="18"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to your ThresholdTracker account</p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSubmit()}
                placeholder="you@example.com"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSubmit()}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none focus:border-white/20" />
            </div>
            <button onClick={onSubmit} disabled={loading}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
          <p className="text-center text-white/30 text-sm mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
