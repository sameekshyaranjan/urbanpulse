import { useState, useEffect } from 'react';
import IssueCard from '../components/IssueCard';
import Toast from '../components/Toast';
import useAuth from '../hooks/useAuth';
import useProgress from '../hooks/useProgress';
import api from '../lib/api';

const STATUS_NEXT = {
  Assigned:      'In Progress',
  'In Progress': 'Resolved',
};

export default function Volunteer() {
  const { ready } = useAuth({ requireAuth: true });
  const { progress, active: progressActive, startProgress, doneProgress } = useProgress();
  const [assigned, setAssigned] = useState([]);
  const [issueId, setIssueId] = useState('');
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (ready) fetchAssigned();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const fetchAssigned = async () => {
    setLoading(true);
    startProgress();
    try {
      const res = await api.get('/volunteer/assigned');
      setAssigned(res.data.data || []);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to load assigned issues', type: 'error' });
    } finally {
      setLoading(false);
      doneProgress();
    }
  };

  const acceptIssue = async () => {
    if (!issueId.trim()) { setToast({ message: 'Please enter an Issue ID', type: 'error' }); return; }
    setAccepting(true);
    try {
      await api.post(`/volunteer/accept/${issueId.trim()}`);
      setToast({ message: '✅ Issue accepted! It is now assigned to you.', type: 'success' });
      setIssueId('');
      fetchAssigned();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to accept issue', type: 'error' });
    } finally {
      setAccepting(false);
    }
  };

  const updateStatus = async (id, currentStatus) => {
    const next = STATUS_NEXT[currentStatus];
    if (!next) { setToast({ message: 'No further transitions available', type: 'info' }); return; }
    if (!window.confirm(`Mark this issue as "${next}"?\n\nThis will update the status and notify the system.`)) return;
    setUpdatingId(id);
    try {
      await api.patch(`/volunteer/status/${id}`, { status: next });
      setToast({ message: `✅ Status updated to "${next}"`, type: 'success' });
      fetchAssigned();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update status', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">Volunteer Portal</h1>
          <p className="text-slate-400 text-base">
            Help keep your local community safe. Accept issues and resolve them.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Progress strip */}
        {progressActive && (
          <div className="w-full h-1 rounded-full mb-6 overflow-hidden bg-slate-200">
            <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Accept Issue */}
        <div className="modern-card p-6 mb-8 border-t-4 border-t-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎯</span>
            <h2 className="text-lg font-bold text-slate-900">Accept an Issue</h2>
          </div>
          <p className="text-sm text-slate-500 mb-5 leading-relaxed max-w-2xl">
            Copy an Issue ID from the main dashboard (click the <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs border border-slate-200">#xxxxxx</span> tag on any card) and paste it below to take ownership.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !accepting && acceptIssue()}
              placeholder="Paste Issue ID here..."
              className="form-input flex-1"
            />
            <button
              onClick={acceptIssue}
              disabled={accepting}
              className="btn-primary whitespace-nowrap"
            >
              {accepting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Accepting...
                </span>
              ) : 'Accept Issue'}
            </button>
          </div>
        </div>

        {/* Assigned Issues header */}
        <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              My Assigned Issues
              {!loading && <span className="ml-2 text-sm font-medium text-slate-400">({assigned.length})</span>}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Issues you are responsible for resolving</p>
          </div>
          <button
            onClick={fetchAssigned}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((n) => (
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
        {!loading && assigned.length === 0 && (
          <div className="modern-card text-center py-20 px-4">
            <div className="text-5xl mb-4 text-slate-300">🙌</div>
            <p className="text-slate-900 font-bold text-xl mb-2">No assigned issues yet</p>
            <p className="text-slate-500">Accept an issue above to start helping your community.</p>
          </div>
        )}

        {/* Issue cards */}
        {!loading && assigned.map((issue) => (
          <IssueCard
            key={issue._id}
            issue={issue}
            actions={
              STATUS_NEXT[issue.status] ? (
                <button
                  disabled={updatingId === issue._id}
                  onClick={() => updateStatus(issue._id, issue.status)}
                  className="btn-primary py-2 text-xs"
                >
                  {updatingId === issue._id ? (
                    <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1" /> Updating...</>
                  ) : `✓ Mark as ${STATUS_NEXT[issue.status]}`}
                </button>
              ) : (
                <span className="text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  ✅ Fully resolved
                </span>
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
