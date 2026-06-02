import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    setUser(token ? decodeToken(token) : null);
    setOpen(false);
  }, [router.pathname]);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.7)] group-hover:scale-105">
              UP
            </div>
            <div className="text-xl font-extrabold text-white tracking-tight">UrbanPulse</div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-bold text-slate-300 hover:text-cyan-400 px-3 py-2 transition-colors">
                  Go to Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-bold text-slate-400 hover:text-white transition-colors ml-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="ml-2 py-2.5 px-6 text-sm font-bold rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 text-slate-300 hover:text-white rounded-md"
            onClick={() => setOpen((o) => !o)}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-2xl">
          {user ? (
            <>
              <Link href="/dashboard" className="block px-4 py-3 rounded-lg text-base font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10">Dashboard</Link>
              <button onClick={logout} className="block w-full text-left px-4 py-3 text-sm font-bold text-red-400">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-4 py-3 text-base font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">Login</Link>
              <Link href="/register" className="block px-4 py-3 text-base font-bold text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 rounded-lg border border-cyan-400/20 text-center">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
