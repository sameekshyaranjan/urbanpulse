const STATUS_STYLES = {
  Reported:      { pill: 'bg-red-50 text-red-700 border border-red-200',      dot: 'bg-red-500' },
  Assigned:      { pill: 'bg-blue-50 text-blue-700 border border-blue-200',      dot: 'bg-blue-500' },
  'In Progress': { pill: 'bg-amber-50 text-amber-700 border border-amber-200',  dot: 'bg-amber-500' },
  Resolved:      { pill: 'bg-cyan-50 text-cyan-700 border border-cyan-200',    dot: 'bg-cyan-500' },
  Verified:      { pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
};

const PRIORITY_RULES = [
  { words: ['unsafe', 'danger', 'dark', 'broken', 'accident', 'hazard', 'fire', 'flood', 'collapse', 'lighting'],
    label: '🔴 Unsafe', cls: 'bg-red-50 text-red-700 border border-red-200' },
  { words: ['garbage', 'waste', 'pothole', 'crack', 'leak', 'noise', 'blocked', 'dirty', 'problem'],
    label: '🟡 Attention', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
];
const PRIORITY_DEFAULT = { label: '🟢 Minor', cls: 'bg-slate-50 text-slate-700 border border-slate-200' };

const LOCATION_RULES = [
  { words: ['beach', 'promenade', 'sea', 'shore', 'serenity', 'paradise', 'auroville', 'rock'],
    label: '🏖️ Coastal / Auroville' },
  { words: ['market', 'shop', 'bazaar', 'goubbert', 'sunday', 'store'],
    label: '🛍️ Market Area' },
  { words: ['hotel', 'hostel', 'resort', 'tourist', 'visitor', 'heritage', 'monument', 'white town', 'ashram', 'french'],
    label: '🗺️ Heritage Zone' },
];
const LOCATION_DEFAULT = '📍 Local Area';

export function inferPriority(title = '', desc = '') {
  const text = `${title} ${desc}`.toLowerCase();
  for (const r of PRIORITY_RULES) {
    if (r.words.some((w) => text.includes(w))) return r;
  }
  return PRIORITY_DEFAULT;
}

function inferLocation(title = '', desc = '') {
  const text = `${title} ${desc}`.toLowerCase();
  for (const r of LOCATION_RULES) {
    if (r.words.some((w) => text.includes(w))) return r.label;
  }
  return LOCATION_DEFAULT;
}

export default function IssueCard({ issue, actions }) {
  const { _id, title = '', description = '', status, imageUrl, location, createdAt } = issue || {};

  const coords = Array.isArray(location?.coordinates) ? location.coordinates : [];
  const lng = typeof coords[0] === 'number' ? coords[0] : null;
  const lat = typeof coords[1] === 'number' ? coords[1] : null;
  const hasCoords = lat !== null && lng !== null;

  const statusStyle = STATUS_STYLES[status] || { pill: 'bg-slate-100 text-slate-600 border border-slate-200', dot: 'bg-slate-400' };
  const priority = inferPriority(title, description);
  const locationLabel = inferLocation(title, description);

  const dateStr = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const copyId = () => { if (_id) navigator.clipboard?.writeText(_id).catch(() => {}); };

  const openMap = () => {
    if (!hasCoords) return;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="modern-card p-5 hover:-translate-y-1 hover:shadow-md transition-all cursor-default h-full flex flex-col">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Status badge with dot */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md ${statusStyle.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {status}
          </span>
          {/* Priority */}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${priority.cls}`}>
            {priority.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {dateStr && <span className="text-xs text-slate-400 font-medium">{dateStr}</span>}
          {_id && (
            <button
              onClick={copyId}
              title="Copy Issue ID"
              className="text-xs text-slate-300 hover:text-blue-500 transition-colors font-mono"
            >
              #{String(_id).slice(-6)}
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-slate-900 text-base mb-1.5 leading-snug">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-3 leading-relaxed">{description}</p>
      )}

      {/* Location + map */}
      <div className="flex items-center gap-2 mb-3 flex-wrap mt-auto">
        <span className="text-xs text-slate-500 font-medium">{locationLabel}</span>
        {hasCoords && (
          <>
            <span className="text-slate-300 text-xs">·</span>
            <span className="text-xs text-slate-400">{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</span>
            <button
              onClick={openMap}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors ml-1"
              title="Open in Google Maps"
            >
              View on Map ↗
            </button>
          </>
        )}
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="mb-3 rounded-lg overflow-hidden border border-slate-200">
          <img
            src={imageUrl}
            alt={title || 'Issue photo'}
            loading="lazy"
            className="w-full h-40 object-cover"
          />
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="pt-3 border-t border-slate-100 flex gap-2 flex-wrap">{actions}</div>
      )}
    </div>
  );
}
