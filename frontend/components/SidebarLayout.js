import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

export default function SidebarLayout({ children, title, subtitle }) {
  const router = useRouter();
  const { user, ready } = useAuth({ requireAuth: true });

  if (!ready) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Report Issue', path: '/create-issue', icon: '🚨' },
    { name: 'Volunteer Portal', path: '/volunteer', icon: '🙋' },
    { name: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              UP
            </div>
            <div>
              <h1 className="text-white font-bold tracking-tight leading-tight">UrbanPulse</h1>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Pondicherry</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-medium'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 px-4">
            <p className="text-xs text-slate-500 font-medium">Logged in as</p>
            <p className="text-sm text-white font-bold truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-blue-400 capitalize font-semibold">{user?.role || 'Citizen'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-red-500/10 hover:text-red-400 border border-slate-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 p-4 flex items-center justify-between border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">UP</div>
            <h1 className="text-white font-bold tracking-tight">UrbanPulse</h1>
          </Link>
          <button onClick={handleLogout} className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded border border-slate-700">Logout</button>
        </div>
        
        {/* Mobile Navigation Strip */}
        <div className="md:hidden flex overflow-x-auto bg-slate-800 border-b border-slate-700 no-scrollbar">
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap text-sm font-medium border-b-2 transition-colors ${
                  isActive ? 'border-blue-500 text-blue-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.icon} {item.name}
              </Link>
            );
          })}
        </div>

        {/* Page Header */}
        {(title || subtitle) && (
          <header className="bg-white border-b border-slate-200 px-6 py-8 md:px-10 md:py-10">
            {title && <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h2>}
            {subtitle && <p className="text-slate-500 mt-2 text-sm md:text-base">{subtitle}</p>}
          </header>
        )}

        {/* Content Body */}
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
