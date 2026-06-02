import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import IssueCard from '../components/IssueCard';
import Toast from '../components/Toast';
import SidebarLayout from '../components/SidebarLayout';
import useAuth from '../hooks/useAuth';
import useProgress from '../hooks/useProgress';
import api from '../lib/api';

const DEFAULT_LAT = 11.9139;
const DEFAULT_LNG = 79.8145;
const DEFAULT_RADIUS = 10000;

const STATUSES = ['All', 'Reported', 'Assigned', 'In Progress', 'Resolved', 'Verified'];

const STAT_CONFIG = [
  { label: 'Total Issues',  key: 'total',        bg: 'bg-white',       border: 'border-slate-200',    text: 'text-slate-800',    icon: '📋' },
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

const PONDI_LAT = 11.9139;
const PONDI_LNG = 79.8145;

const DEMO_ISSUES = [
  {
    _id: 'demo1',
    title: 'Unsafe lighting near Promenade Beach',
    description: 'Street lights on the coastal road near the Gandhi statue are broken. Very dark at night.',
    status: 'Reported',
    location: { coordinates: [PONDI_LNG + 0.01, PONDI_LAT + 0.01] },
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    _id: 'demo2',
    title: 'Broken walkway in White Town',
    description: 'Cracked pavement near the French Quarter cafes. Several visitors have tripped.',
    status: 'In Progress',
    location: { coordinates: [PONDI_LNG - 0.01, PONDI_LAT - 0.01] },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: 'demo3',
    title: 'Garbage near Auroville entrance',
    description: 'Uncollected garbage near the visitor center causing health hazards.',
    status: 'Resolved',
    location: { coordinates: [PONDI_LNG + 0.02, PONDI_LAT - 0.02] },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    _id: 'demo4',
    title: 'Pothole on Heritage Street',
    description: 'Large pothole on the main heritage lane. Dangerous for two-wheelers.',
    status: 'Assigned',
    location: { coordinates: [PONDI_LNG - 0.02, PONDI_LAT + 0.02] },
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
    <SidebarLayout title="Issues Overview" subtitle="Helping tourists and local communities stay safer and cleaner together.">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-6xl mx-auto">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          {myCount > 0 && (
            <span className="inline-block text-xs bg-white text-slate-600 px-3 py-1.5 rounded-md font-bold border border-slate-200 shadow-sm">
              {myCount} issue{myCount > 1 ? 's' : ''} reported by you
            </span>
          )}
          <div className="flex items-center gap-3 flex-wrap ml-auto">
            <button
              onClick={() => setTouristMode((t) => !t)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border transition-all shadow-sm ${
                touristMode
                  ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🗺️ Tourist Mode
            </button>
            <button
              onClick={fetchNearby}
              disabled={loading}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-sm font-bold px-4 py-2.5 rounded-lg border border-slate-200 transition-all shadow-sm"
            >
              {loading ? '⏳' : '🔄'} Refresh
            </button>
          </div>
        </div>

        {touristMode && (
          <div className="mb-6 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 font-semibold shadow-sm">
            🏖️ Showing safety-related and tourist-relevant issues only
          </div>
        )}

        {/* Progress strip */}
        {progressActive && (
          <div className="w-full h-1 rounded-full mb-6 overflow-hidden bg-slate-200">
            <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STAT_CONFIG.map(({ label, key, bg, border, text, icon }) => (
            <div
              key={key}
              className={`${bg} border ${border} rounded-xl p-5 hover:-translate-y-0.5 transition-transform cursor-default shadow-sm`}
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className={`text-3xl font-extrabold ${text}`}>{stats[key] ?? 0}</div>
              <div className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="modern-card p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="🔍 Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input flex-1 shadow-sm"
            />
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`text-xs px-4 py-2 rounded-lg font-bold transition-all border ${
                    filter === s
                      ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="modern-card p-6 animate-pulse h-64">
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
          <div className="modern-card text-center py-20 px-4 bg-white/50">
            <div className="text-5xl mb-4 opacity-75">🛡️</div>
            <p className="text-slate-800 font-extrabold text-xl mb-2">
              {search || filter !== 'All' || touristMode
                ? 'No issues match your filters'
                : 'Pondicherry is currently safe and clean!'}
            </p>
            <p className="text-base text-slate-500 mt-2 font-medium">
              {search || filter !== 'All' || touristMode
                ? 'Try adjusting your search or filter criteria.'
                : <Link href="/create-issue" className="text-blue-600 hover:underline font-bold">Be the first to report an issue →</Link>
              }
            </p>
          </div>
        )}

        {/* Issue Grid */}
        {!loading && visible.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((issue) => {
              const isOwner = user && (issue.reporterId === user.id || issue.reporterId?._id === user.id);
              const isDemo = issue._id?.startsWith('demo');
              return (
                <div key={issue._id} className="h-full">
                  <IssueCard
                    issue={issue}
                    actions={isOwner && issue.status === 'Reported' && !isDemo ? (
                      <button
                        onClick={() => handleDelete(issue._id)}
                        disabled={deletingId === issue._id}
                        className="btn-secondary py-1.5 px-3 text-xs text-red-600 border-red-200 hover:border-red-400 hover:bg-red-50 w-full font-bold"
                      >
                        {deletingId === issue._id ? 'Deleting...' : '🗑 Delete Issue'}
                      </button>
                    ) : null}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
