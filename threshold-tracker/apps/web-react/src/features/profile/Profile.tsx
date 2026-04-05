import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/profile';
import { syncAll } from '../../api/sync';
import { useAuth } from '../../context/AuthContext';

export function Profile() {
  const { loadProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [defaultSensitivity, setDefaultSensitivity] = useState('');
  const [defaultFov, setDefaultFov] = useState('');
  const [defaultDpi, setDefaultDpi] = useState('');
  const [aimlabsUsername, setAimlabsUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');

  const usernameChanged = aimlabsUsername !== originalUsername;

  useEffect(() => {
    getProfile().then(p => {
      setDisplayName(p.display_name);
      setEmail(p.email);
      setDefaultSensitivity(p.default_sensitivity ?? '');
      setDefaultFov(p.default_fov?.toString() ?? '');
      setDefaultDpi(p.default_dpi?.toString() ?? '');
      setAimlabsUsername(p.aimlabs_username ?? '');
      setOriginalUsername(p.aimlabs_username ?? '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function onSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile({
        display_name: displayName || null,
        default_sensitivity: defaultSensitivity || undefined,
        default_fov: defaultFov ? parseFloat(defaultFov) : undefined,
        default_dpi: defaultDpi ? parseInt(defaultDpi) : undefined,
        aimlabs_username: aimlabsUsername || undefined,
      });
      setOriginalUsername(aimlabsUsername);
      setSuccess('Profile saved successfully.');
      loadProfile();
    } catch (err: unknown) {
      const e = err as { data?: { detail?: string } };
      setError(e?.data?.detail ?? 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  async function onSync() {
    setSyncing(true);
    setError('');
    setSuccess('');
    try {
      const tasks = await syncAll();
      setSuccess(`Sync complete — ${tasks.length} tasks imported.`);
    } catch (err: unknown) {
      const e = err as { data?: { detail?: string } };
      setError(e?.data?.detail ?? 'Sync failed. Make sure your Aimlabs username is correct.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/dashboard" className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded-lg" />)}
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg px-4 py-3">{success}</div>
          )}

          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-2">Email</label>
            <p className="text-white/40 text-sm px-3 py-2 bg-white/5 border border-white/10 rounded-lg">{email}</p>
          </div>

          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-2">Display Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-white/20" />
          </div>

          {/* Aimlabs Integration */}
          <div className="border border-white/10 rounded-xl p-4 space-y-3">
            <h3 className="text-white/60 text-xs uppercase tracking-wider">Aimlabs Account</h3>
            <div className="flex gap-2">
              <input value={aimlabsUsername} onChange={e => setAimlabsUsername(e.target.value)}
                placeholder="Your Aimlabs username"
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none focus:border-white/20" />
              <button onClick={onSync} disabled={syncing || saving || usernameChanged || !aimlabsUsername}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
            {usernameChanged ? (
              <p className="text-amber-400/80 text-xs">Username changed — save before syncing.</p>
            ) : (
              <p className="text-white/20 text-xs">Save your profile first after changing the username, then sync.</p>
            )}
          </div>

          {/* Default Settings */}
          <div>
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Default Settings</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-white/40 text-xs block mb-2">Sensitivity</label>
                <input value={defaultSensitivity} onChange={e => setDefaultSensitivity(e.target.value)}
                  placeholder="0.8"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none" />
              </div>
              <div>
                <label className="text-white/40 text-xs block mb-2">FOV</label>
                <input type="number" value={defaultFov} onChange={e => setDefaultFov(e.target.value)}
                  placeholder="103"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none" />
              </div>
              <div>
                <label className="text-white/40 text-xs block mb-2">DPI</label>
                <input type="number" value={defaultDpi} onChange={e => setDefaultDpi(e.target.value)}
                  placeholder="800"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 outline-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={onSave} disabled={saving}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
