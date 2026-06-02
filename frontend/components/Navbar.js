import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const ROLE_LABEL = {
  citizen:   { label: 'Citizen',   badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
  volunteer: { label: 'Volunteer', badge: 'bg-cyan-50 text-cyan-700 border border-cyan-200' },
  admin:     { label: 'Admin',     badge: 'bg-slate-100 text-slate-700 border border-slate-200' },
};

function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
}

const NAV_LINKS = [
  { href: '/dashboard',    label: 'Dashboard',    roles: null },
  { href: '/create-issue', label: 'Report Issue', roles: ['citizen'] },
  { href: '/volunteer',    label: 'Volunteer',    roles: ['volunteer', 'admin'] },
  { href: '/leaderboard',  label: 'Leaderboard',  roles: null },
];

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

  const isActive = (href) => router.pathname === href;
  const roleInfo = user ? (ROLE_LABEL[user.role] || { label: user.role, badge: 'bg-slate-100 text-slate-700' }) : null;

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white text-xs font-bold transition-transform group-hover:scale-105">
              UP
            </div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">UrbanPulse</div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <>
                {NAV_LINKS.filter(({ roles }) => !roles || roles.includes(user.role)).map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive(href)
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${roleInfo.badge}`}>
                    {roleInfo.label}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2">
                  Login
                </Link>
                <Link href="/register" className="btn-primary ml-2 py-2 px-4 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-md"
            onClick={() => setOpen((o) => !o)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          {user ? (
            <>
              {NAV_LINKS.filter(({ roles }) => !roles || roles.includes(user.role)).map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(href) ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-center">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${roleInfo.badge}`}>{roleInfo.label}</span>
                <button onClick={logout} className="text-sm font-medium text-red-600">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md">Login</Link>
              <Link href="/register" className="block px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
