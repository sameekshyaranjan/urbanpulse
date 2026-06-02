import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Toast from '../components/Toast';
import api from '../lib/api';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const token = res.data?.data?.accessToken;
      const refreshToken = res.data?.data?.refreshToken;
      
      if (!token) throw new Error('No token received from server');
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      }
      router.push('/dashboard');
    } catch (err) {
      setToast({ message: err.response?.data?.message || err.message || 'Login failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden bg-grid-pattern">
      {/* Background Neon Blobs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="glass-panel w-full max-w-sm p-8 relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-2xl font-bold mx-auto mb-5 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            UP
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Welcome back</h1>
          <p className="text-sm text-cyan-400 mt-2 font-bold tracking-wide uppercase">UrbanPulse Platform</p>
          <p className="text-sm text-slate-400 mt-1 font-medium">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-widest">Email</label>
            <input 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 placeholder:text-slate-600" 
              placeholder="you@example.com" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-widest">Password</label>
            <input 
              name="password" 
              type="password" 
              value={form.password} 
              onChange={handleChange} 
              required 
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 placeholder:text-slate-600" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3.5 mt-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-base transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign In →'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-center text-sm text-slate-400 font-medium">
            No account?{' '}
            <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
