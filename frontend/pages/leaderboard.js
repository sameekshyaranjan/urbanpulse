import { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import useAuth from '../hooks/useAuth';
import api from '../lib/api';

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_STYLES = [
  'bg-amber-50 border-amber-200 shadow-sm',
  'bg-slate-100 border-slate-200 shadow-sm',
  'bg-orange-50 border-orange-200 shadow-sm',
];

export default function Leaderboard() {
  useAuth({ requireAuth: false });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get('/leaderboard')
      .then((res) => setEntries(res.data.data || []))
      .catch((err) => setToast({ message: err.response?.data?.message || 'Failed to load leaderboard', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">🏆 Leaderboard</h1>
          <p className="text-slate-400 text-base">
            Top volunteers keeping the community safe and clean.
          </p>
          <div className="flex gap-3 mt-5 flex-wrap">
            <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-md font-medium">
              Resolve = +10 pts
            </span>
            <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-md font-medium">
              Verify = +5 pts
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="modern-card p-4 animate-pulse flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-200 rounded-full" />
                <div className="flex-1 h-4 bg-slate-100 rounded" />
                <div className="w-16 h-4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && entries.length === 0 && (
          <div className="modern-card text-center py-20 px-4">
            <div className="text-5xl mb-4 text-slate-300">🏅</div>
            <p className="text-slate-900 font-bold text-xl mb-1">No entries yet</p>
            <p className="text-sm text-slate-500">Resolve issues to appear on the leaderboard.</p>
          </div>
        )}

        {/* Top 3 podium */}
        {!loading && entries.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {entries.slice(0, 3).map((entry, i) => (
              <div
                key={String(entry.userId)}
                className={`border rounded-xl p-5 text-center transition-transform hover:-translate-y-1 ${PODIUM_STYLES[i]}`}
              >
                <div className="text-4xl mb-3">{MEDALS[i]}</div>
                <div className="font-bold text-slate-900 text-sm truncate mb-1">{entry.name}</div>
                <div className="text-2xl font-extrabold text-slate-800">{entry.totalPoints}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-0.5">pts</div>
              </div>
            ))}
          </div>
        )}

        {/* Full ranked list */}
        {!loading && entries.map((entry, i) => (
          <div
            key={String(entry.userId)}
            className="flex items-center gap-4 modern-card px-5 py-4 mb-3 transition-colors hover:border-slate-300"
          >
            <span className="w-8 text-center text-xl font-bold text-slate-400">
              {MEDALS[i] || `#${i + 1}`}
            </span>
            <span className="flex-1 font-bold text-slate-900">{entry.name}</span>
            <span className="font-bold text-sm bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-md">
              {entry.totalPoints} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
