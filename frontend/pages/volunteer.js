import { useState, useEffect } from 'react';
import IssueCard from '../components/IssueCard';
import Toast from '../components/Toast';
import SidebarLayout from '../components/SidebarLayout';
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
    <SidebarLayout title="Volunteer Portal" subtitle="Accept issues reported in Pondicherry and help resolve them.">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-6xl mx-auto">
        {/* Progress strip */}
        {progressActive && (
          <div className="w-full h-1 rounded-full mb-6 overflow-hidden bg-slate-200">
            <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Accept Issue */}
        <div className="modern-card p-6 mb-8 border-t-4 border-t-blue-500 bg-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎯</span>
            <h2 className="text-lg font-extrabold text-slate-900">Accept an Issue</h2>
          </div>
          <p className="text-sm text-slate-500 mb-5 leading-relaxed max-w-2xl font-medium">
            Copy an Issue ID from the main dashboard (click the <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">#xxxxxx</span> tag on any card) and paste it below to take ownership.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !accepting && acceptIssue()}
              placeholder="Paste Issue ID here..."
              className="form-input flex-1 shadow-sm"
            />
            <button
              onClick={acceptIssue}
              disabled={accepting}
              className="btn-primary whitespace-nowrap px-6 shadow-sm"
            >
              {accepting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Accepting...
                </span>
              ) : 'Accept Issue →'}
            </button>
          </div>
        </div>

        {/* Assigned Issues header */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              My Assigned Issues
              {!loading && <span className="ml-2 text-sm font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{assigned.length}</span>}
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Issues you are responsible for resolving in Pondicherry</p>
          </div>
          <button
            onClick={fetchAssigned}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-sm font-bold px-4 py-2 rounded-lg border border-slate-200 transition-all shadow-sm"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((n) => (
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
        {!loading && assigned.length === 0 && (
          <div className="modern-card text-center py-20 px-4 bg-white/50">
            <div className="text-5xl mb-4 text-slate-300">🙌</div>
            <p className="text-slate-800 font-extrabold text-xl mb-2">No assigned issues yet</p>
            <p className="text-slate-500 font-medium">Accept an issue above to start helping the Pondicherry community.</p>
          </div>
        )}

        {/* Issue Grid */}
        {!loading && assigned.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assigned.map((issue) => (
              <div key={issue._id} className="h-full">
                <IssueCard
                  issue={issue}
                  actions={
                    STATUS_NEXT[issue.status] ? (
                      <button
                        disabled={updatingId === issue._id}
                        onClick={() => updateStatus(issue._id, issue.status)}
                        className="btn-primary w-full py-2.5 text-xs font-bold"
                      >
                        {updatingId === issue._id ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> 
                            Updating...
                          </span>
                        ) : `✓ Mark as ${STATUS_NEXT[issue.status]}`}
                      </button>
                    ) : (
                      <span className="text-xs w-full text-center text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-lg shadow-sm">
                        ✅ Fully resolved
                      </span>
                    )
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
