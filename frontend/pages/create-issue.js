import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Toast from '../components/Toast';
import SidebarLayout from '../components/SidebarLayout';
import useAuth from '../hooks/useAuth';
import api from '../lib/api';

const MAX_SIZE_MB = 5;
const ISSUE_TYPES = ['Civic', 'Tourist', 'Safety Hazard', 'Infrastructure', 'Sanitation'];
const PRIORITIES  = ['High — Unsafe', 'Medium — Needs Attention', 'Low — Minor'];

export default function CreateIssue() {
  const router = useRouter();
  const { user, ready } = useAuth({ requireAuth: true });

  const [form, setForm] = useState({ title: '', description: '', issueType: '', priority: '', lat: '', lng: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [imageMode, setImageMode] = useState('upload');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const roleError = ready && user && user.role !== 'citizen' ? 'Only citizens can report issues.' : '';
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setToast({ message: 'Only JPEG and PNG files are allowed', type: 'error' }); e.target.value = ''; return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setToast({ message: `File size must not exceed ${MAX_SIZE_MB}MB`, type: 'error' }); e.target.value = ''; return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch { setCameraError('Camera access denied. Please allow camera permission.'); }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setImageFile(file); setImagePreview(URL.createObjectURL(blob)); stopCamera();
    }, 'image/jpeg', 0.92);
  }, [stopCamera]);

  const clearImage = () => {
    setImageFile(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    stopCamera();
  };

  const switchMode = (mode) => { clearImage(); setImageMode(mode); setCameraError(''); };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setToast({ message: 'Geolocation not supported', type: 'error' }); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() })),
      () => setToast({ message: 'Could not get location', type: 'error' })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) { setToast({ message: 'Please provide a photo of the issue', type: 'error' }); return; }
    setLoading(true);
    try {
      const data = new FormData();
      const enrichedTitle = form.issueType ? `[${form.issueType}] ${form.title}` : form.title;
      data.append('title', enrichedTitle);
      data.append('description', form.description);
      data.append('lat', form.lat);
      data.append('lng', form.lng);
      data.append('image', imageFile);
      await api.post('/issues', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setToast({ message: '✅ Issue reported! Thank you for keeping the community safe.', type: 'success' });
      setTimeout(() => router.push('/dashboard'), 1800);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create issue', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const labelClass = 'block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide';

  if (!ready) return null;

  return (
    <SidebarLayout title="🚨 Report an Issue" subtitle="Report hazards, infrastructure issues, or sanitation problems to help keep Pondicherry safe.">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto">
        {roleError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold rounded-lg px-4 py-3 mb-6 flex items-center gap-2 shadow-sm">
            ⚠️ {roleError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modern-card p-6 sm:p-8 space-y-6">
          <div>
            <label className={labelClass}>Issue Title</label>
            <input name="title" value={form.title} onChange={handleChange} required className="form-input shadow-sm" placeholder="e.g. Broken streetlight near Promenade beach" />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="form-input resize-none shadow-sm" placeholder="Describe the issue clearly — location details help volunteers find it faster." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Issue Type</label>
              <select name="issueType" value={form.issueType} onChange={handleChange} className="form-input shadow-sm font-medium text-slate-700">
                <option value="">Select type...</option>
                {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="form-input shadow-sm font-medium text-slate-700">
                <option value="">Select priority...</option>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Photo */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <label className={labelClass}>Photo Evidence</label>
            <div className="flex gap-2 mb-4">
              {[{ key: 'upload', icon: '📁', label: 'Upload' }, { key: 'camera', icon: '📸', label: 'Live Camera' }].map(({ key, icon, label }) => (
                <button key={key} type="button" onClick={() => switchMode(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors shadow-sm ${
                    imageMode === key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover" />
                <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white font-bold text-xs px-3 py-1.5 rounded-md transition-colors">✕ Remove</button>
              </div>
            ) : imageMode === 'upload' ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all bg-white shadow-sm">
                <span className="text-3xl mb-2 text-slate-400">📁</span>
                <span className="text-sm font-bold text-slate-700">Click to upload a photo</span>
                <span className="text-xs font-medium text-slate-500 mt-1">JPEG or PNG · max 5MB</span>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-black shadow-sm">
                {cameraError ? (
                  <div className="flex flex-col items-center justify-center h-56 gap-3 px-4 text-center">
                    <span className="text-2xl">🚫</span>
                    <p className="text-sm font-medium text-red-400">{cameraError}</p>
                    <button type="button" onClick={startCamera} className="text-sm text-blue-400 hover:underline mt-1 font-bold">Try again</button>
                  </div>
                ) : cameraActive ? (
                  <div className="relative">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <button type="button" onClick={capturePhoto} className="w-16 h-16 rounded-full bg-white border-4 border-slate-200 hover:border-blue-400 shadow-lg transition-all active:scale-95 flex items-center justify-center">
                        <span className="w-12 h-12 rounded-full block bg-blue-600" />
                      </button>
                    </div>
                    <button type="button" onClick={stopCamera} className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white font-bold text-xs px-3 py-1.5 rounded-md transition-colors">✕ Close</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 gap-3 cursor-pointer hover:bg-slate-900 transition-colors" onClick={startCamera}>
                    <span className="text-4xl text-slate-400">📸</span>
                    <span className="text-sm font-bold text-slate-300">Tap to open camera</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Latitude</label>
              <input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} required className="form-input shadow-sm" placeholder="11.9139" />
            </div>
            <div>
              <label className={labelClass}>Longitude</label>
              <input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} required className="form-input shadow-sm" placeholder="79.8145" />
            </div>
          </div>

          <button type="button" onClick={useMyLocation}
            className="w-full btn-secondary text-blue-700 font-bold border-blue-200 hover:border-blue-400 hover:bg-blue-50 py-3 shadow-sm">
            📍 Use My Current Location
          </button>

          <button type="submit" disabled={loading || !!roleError}
            className="w-full btn-primary py-4 text-base font-extrabold mt-4 shadow-md shadow-blue-500/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Uploading & Submitting...
              </span>
            ) : '🚨 Submit Issue Report'}
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
}
