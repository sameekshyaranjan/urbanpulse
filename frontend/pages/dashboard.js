import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import IssueCard from '../components/IssueCard';
import Toast from '../components/Toast';
import useAuth from '../hooks/useAuth';
import useProgress from '../hooks/useProgress';
import api from '../lib/api';

const DEFAULT_LAT = 15.2993;
const DEFAULT_LNG = 74.1240;
const DEFAULT_RADIUS = 10000;

const STATUSES = ['All', 'Reported', 'Assigned', 'In Progress', 'Resolved', 'Verified'];

const STAT_CONFIG = [
  { label: 'Total Issues',  key: 'total',        bg: 'bg-slate-50',    border: 'border-slate-200',    text: 'text-slate-800',    icon: '📋' },
  { label: 'Reported',      key: 'Reported',      bg: 'bg-red-50',      border: 'border-red-200',      text: 'text-red-700',      icon: '🚨' },
  { label: 'In Progress',   key: 'In Progress',   bg: 'bg-amber-50',    border: 'border-amber-200',    text: 'text-amber-700',    icon: '🔧' },
  { label: 'Resolved',      key: 'Resolved',      bg: 'bg-cyan-50',     border: 'border-cyan-200',     text: 'text-cyan-700',     icon: '✅' },
];

const PROGRESS_COLORS = {
  Reported:      'bg-red-500',
  Assigned:      'bg-blue-500',
  'In Progress': 'bg-amber-500',
  Resolved:      'bg-cyan-500',
  Verified:      'bg-emerald-500',
};

const GOA_LAT = 15.2993;
const GOA_LNG = 74.1240;

const DEMO_ISSUES = [
  {
    _id: 'demo1',
    title: 'Unsafe lighting near Calangute beach road',
    description: 'Street lights on the coastal road near Calangute beach are broken. Very dangerous for tourists walking at night.',
    status: 'Reported',
    location: { coordinates: [GOA_LNG + 0.01, GOA_LAT + 0.01] },
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    _id: 'demo2',
    title: 'Broken walkway near Anjuna tourist area',
    description: 'Cracked pavement near the Anjuna flea market entrance. Several visitors have tripped and fallen.',
    status: 'In Progress',
    location: { coordinates: [GOA_LNG - 0.01, GOA_LAT - 0.01] },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: 'demo3',
    title: 'Garbage near Baga beach market',
    description: 'Uncollected garbage near the Baga beach market causing health hazards and bad odour for tourists.',
    status: 'Resolved',
    location: { coordinates: [GOA_LNG + 0.02, GOA_LAT - 0.02] },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    _id: 'demo4',
    title: 'Dark street near hostel area in Panaji',
    description: 'No street lighting on the lane behind the popular hostel cluster in Panaji. Unsafe after 9pm.',
    status: 'Assigned',
    location: { coordinates: [GOA_LNG - 0.02, GOA_LAT + 0.02] },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export default function Dashboard() {
  const { user, ready } = useAuth({ requireAuth: true });
  const { progress, active: progressActive, startProgress, doneProgress } = useProgress();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [touristMode, setTouristMode] = useState(false);

  useEffect(() => {
    if (ready && user) fetchNearby();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const fetchNearby = async () => {
    setLoading(true);
    startProgress();
    try {
      const { lat, lng } = await getLocation();
      const res = await api.get('/issues/nearby', { params: { lat, lng, radius: DEFAULT_RADIUS } });
      const data = res.data.data || [];
      setIssues(data.length > 0 ? data : DEMO_ISSUES);
    } catch {
      setIssues(DEMO_ISSUES);
    } finally {
      setLoading(false);
      doneProgress();
    }
  };

  const getLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: DEFAULT_LAT, lng: DEFAULT_LNG })
      );
    });

  const handleDelete = async (id) => {
    if (id.startsWith('demo')) { setToast({ message: 'Demo issues cannot be deleted', type: 'info' }); return; }
    if (!window.confirm('Delete this issue? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/issues/${id}`);
      setIssues((prev) => prev.filter((i) => i._id !== id));
      setToast({ message: 'Issue deleted', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => {
    const counts = { total: issues.length };
    STATUSES.slice(1).forEach((s) => { counts[s] = issues.filter((i) => i.status === s).length; });
    return counts;
  }, [issues]);

  const myCount = useMemo(() =>
    user ? issues.filter((i) => i.reporterId === user.id || i.reporterId?._id === user.id).length : 0,
  [issues, user]);

  const visible = useMemo(() => {
    let list = issues;
    if (touristMode) {
      const tw = ['tourist','tourism','beach','heritage','monument','resort','visitor','hotel','attraction','unsafe','danger','hazard','dark','lighting'];
      list = list.filter((i) => {
        const text = `${i.title || ''} ${i.description || ''}`.toLowerCase();
        return tw.some((w) => text.includes(w));
      });
    }
    return list
      .filter((i) => filter === 'All' || i.status === filter)
      .filter((i) => !search || (i.title || '').toLowerCase().includes(search.toLowerCase()));
  }, [issues, filter, search, touristMode]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Hero banner ── */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-12">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Goa · Coastal Safety</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Issues Overview
              </h1>
              <p className="text-slate-400 text-base mt-2 max-w-md">
                Helping tourists and local communities stay safer and cleaner together.
              </p>
              {myCount > 0 && (
                <span className="inline-block mt-3 text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-md font-medium border border-slate-700">
                  {myCount} issue{myCount > 1 ? 's' : ''} reported by you
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Tourist Mode */}
              <button
                onClick={() => setTouristMode((t) => !t)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  touristMode
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                🗺️ Tourist Mode
              </button>
              <button
                onClick={fetchNearby}
                disabled={loading}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg border border-slate-700 transition-all"
              >
                {loading ? '⏳' : '🔄'} Refresh
              </button>
            </div>
          </div>

          {touristMode && (
            <div className="mt-4 text-sm text-blue-300 bg-blue-900/40 border border-blue-800/50 rounded-lg px-4 py-2 inline-block">
              🏖️ Showing safety-related and tourist-relevant issues only
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Progress strip */}
        {progressActive && (
          <div className="w-full h-1 rounded-full mb-6 overflow-hidden bg-slate-200">
            <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Story banner */}
        <div className="modern-card px-6 py-4 mb-8 bg-white border-l-4 border-l-blue-500 flex items-start gap-4">
          <span className="text-2xl mt-0.5">🌴</span>
          <p className="text-slate-700 text-sm leading-relaxed">
            Tourists can report unsafe areas, and local volunteers help resolve them —
            <span className="font-bold text-slate-900"> making Goa safer for everyone.</span>
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STAT_CONFIG.map(({ label, key, bg, border, text, icon }) => (
            <div
              key={key}
              className={`${bg} border ${border} rounded-xl p-5 hover:-translate-y-0.5 transition-transform cursor-default shadow-sm`}
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className={`text-3xl font-bold ${text}`}>{stats[key] ?? 0}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Status distribution */}
        {issues.length > 0 && (
          <div className="modern-card p-6 mb-8">
            <h3 className="text-sm font-bold text-slate-800 mb-4 tracking-tight">Safety Status Distribution</h3>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5 bg-slate-100">
              {STATUSES.slice(1).map((s) => {
                const pct = (stats[s] / issues.length) * 100;
                return pct > 0 ? (
                  <div key={s} title={`${s}: ${stats[s]}`} className={`${PROGRESS_COLORS[s]} transition-all`} style={{ width: `${pct}%` }} />
                ) : null;
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {STATUSES.slice(1).map((s) => stats[s] > 0 && (
                <span key={s} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <span className={`w-2 h-2 rounded-full ${PROGRESS_COLORS[s]}`} />
                  {s} <span className="text-slate-900 font-bold">({stats[s]})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div className="modern-card p-5 mb-8">
          <h3 className="text-sm font-bold text-slate-800 mb-3 tracking-tight">Issues Near You</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="🔍 Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input flex-1"
            />
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors border ${
                    filter === s
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="modern-card p-6 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="h-6 bg-slate-200 rounded-md w-24" />
                  <div className="h-6 bg-slate-200 rounded-md w-20" />
                </div>
                <div className="h-5 bg-slate-100 rounded w-3/4 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && visible.length === 0 && (
          <div className="modern-card text-center py-20 px-4">
            <div className="text-5xl mb-4">🛡️</div>
            <p className="text-slate-900 font-bold text-xl mb-2">
              {search || filter !== 'All' || touristMode
                ? 'No issues found for your filter'
                : 'No issues reported here — this area is currently safe'}
            </p>
            <p className="text-base text-slate-500 mt-2">
              {search || filter !== 'All' || touristMode
                ? 'Try adjusting your search or filter criteria.'
                : <Link href="/create-issue" className="text-blue-600 hover:underline font-medium">Be the first to report an issue →</Link>
              }
            </p>
          </div>
        )}

        {/* Issue list */}
        {!loading && visible.map((issue) => {
          const isOwner = user && (issue.reporterId === user.id || issue.reporterId?._id === user.id);
          const isDemo = issue._id?.startsWith('demo');
          return (
            <IssueCard
              key={issue._id}
              issue={issue}
              actions={isOwner && issue.status === 'Reported' && !isDemo ? (
                <button
                  onClick={() => handleDelete(issue._id)}
                  disabled={deletingId === issue._id}
                  className="btn-secondary py-1.5 px-3 text-xs text-red-600 border-red-200 hover:border-red-400 hover:bg-red-50"
                >
                  {deletingId === issue._id ? 'Deleting...' : '🗑 Delete'}
                </button>
              ) : null}
            />
          );
        })}
      </div>
    </div>
  );
}
