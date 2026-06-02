import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <header className="pt-32 pb-20 px-4 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Civic Tech for the <span className="text-blue-600">Modern City</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          UrbanPulse connects citizens and volunteers to report, track, and resolve public safety issues in real-time. Make your destination safer, together.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="btn-primary w-full sm:w-auto text-base px-8 py-3">
            Start Reporting
          </Link>
          <Link href="/leaderboard" className="btn-secondary w-full sm:w-auto text-base px-8 py-3 bg-white">
            View Leaderboard
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="modern-card p-8 bg-slate-50 border-none shadow-none">
              <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-6">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Geo-Targeted</h3>
              <p className="text-slate-600">Report issues with exact GPS coordinates and view nearby hazards instantly.</p>
            </div>
            <div className="modern-card p-8 bg-slate-50 border-none shadow-none">
              <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-6">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Volunteer Driven</h3>
              <p className="text-slate-600">Local volunteers accept and resolve issues without race-conditions or double-booking.</p>
            </div>
            <div className="modern-card p-8 bg-slate-50 border-none shadow-none">
              <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-6">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Gamified Impact</h3>
              <p className="text-slate-600">Earn points for resolving and verifying community issues. Top the leaderboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white font-bold text-xs">
              UP
            </div>
            <span className="text-white font-bold text-xl tracking-tight">UrbanPulse</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 UrbanPulse. Empowering local communities.</p>
        </div>
      </footer>
    </div>
  );
}
