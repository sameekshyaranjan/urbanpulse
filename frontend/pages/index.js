import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden bg-grid-pattern">
      
      {/* Background Neon Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-[150px] -z-10 mix-blend-screen pointer-events-none" />

      {/* Hero Section */}
      <header className="pt-40 pb-24 px-4 text-center max-w-5xl mx-auto relative z-10">
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight mb-8">
          Civic Tech for the <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 neon-glow">
            Modern City
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          UrbanPulse connects citizens and volunteers to report, track, and resolve public safety issues in real-time. Make your destination safer, together.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-lg transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:-translate-y-1">
            Start Reporting
          </Link>
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg transition-all hover:border-white/30 backdrop-blur-sm">
            Volunteer Login
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(34,211,238,0.1)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-shadow">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Geo-Targeted</h3>
              <p className="text-slate-400 font-medium leading-relaxed">Report issues with exact GPS coordinates and view nearby hazards instantly.</p>
            </div>
            
            <div className="glass-panel p-8 group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-shadow">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Volunteer Driven</h3>
              <p className="text-slate-400 font-medium leading-relaxed">Local volunteers accept and resolve issues without race-conditions or double-booking.</p>
            </div>
            
            <div className="glass-panel p-8 group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-shadow">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Gamified Impact</h3>
              <p className="text-slate-400 font-medium leading-relaxed">Earn points for resolving and verifying community issues. Top the leaderboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 relative z-10 mt-12 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-bold text-xs shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              UP
            </div>
            <span className="text-white font-extrabold text-xl tracking-tight">UrbanPulse</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">© 2026 UrbanPulse. Empowering local communities.</p>
        </div>
      </footer>
    </div>
  );
}
