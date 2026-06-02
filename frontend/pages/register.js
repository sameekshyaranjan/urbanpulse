import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Toast from '../components/Toast';
import api from '../lib/api';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'citizen' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setToast({ message: 'Account created! Redirecting to login...', type: 'success' });
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || err.message || 'Registration failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="modern-card w-full max-w-sm p-8">
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
            UP
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Join UrbanPulse</h1>
          <p className="text-sm text-blue-600 mt-1 font-semibold">Help keep the community safe</p>
          <p className="text-xs text-slate-500 mt-0.5">Create your free account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="form-input" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="form-input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} className="form-input" placeholder="Min 8 characters" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">I am a...</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { r: 'citizen',   icon: '🏖️', title: 'Citizen', sub: 'Report issues' },
                { r: 'volunteer', icon: '🙋', title: 'Volunteer',   sub: 'Resolve issues' },
              ].map(({ r, icon, title, sub }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: r }))}
                  className={`py-3 px-3 rounded-xl text-left transition-all duration-200 border-2 ${
                    form.role === r
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-100 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-lg mb-0.5">{icon}</div>
                  <div className="text-xs font-bold text-slate-800">{title}</div>
                  <div className="text-[10px] text-slate-500">{sub}</div>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-3 mt-1">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : 'Create Account →'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
