import { useState } from 'react';
import { HiX, HiCheck, HiLocationMarker, HiPhotograph, HiExternalLink } from 'react-icons/hi';
import plantationService from '../services/plantationService';

const PlantationReviewModal = ({ plantation, token, onClose, onActionComplete }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  if (!plantation) return null;

  const handleApprove = async () => {
    setActionLoading('approve');
    try {
      await plantationService.approvePlantation(plantation._id, token);
      onActionComplete('approved');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading('reject');
    try {
      await plantationService.rejectPlantation(plantation._id, rejectReason, token);
      onActionComplete('rejected');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  // Confidence badge color
  const getConfidenceBadge = (score) => {
    if (score >= 90) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', label: 'High' };
    if (score >= 80) return { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', label: 'Good' };
    if (score >= 70) return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', label: 'Fair' };
    return { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', label: 'Low' };
  };

  const confidenceBadge = getConfidenceBadge(plantation.confidenceScore);
  const lat = plantation.gpsLocation?.latitude;
  const lng = plantation.gpsLocation?.longitude;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

        {/* Modal */}
        <div className="relative bg-dark-900 border border-dark-700 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[92vh]">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-dark-950/50 hover:bg-red-500 hover:text-white text-dark-300 p-2 rounded-full backdrop-blur-md z-30 transition-colors"
          >
            <HiX size={20} />
          </button>

          {/* Header */}
          <div className="bg-dark-800 border-b border-dark-700 p-6 shrink-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">🌳</span>
              <h2 className="text-2xl font-bold text-white">Plantation Review</h2>
              <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-sm border border-amber-500/20">
                Pending Review
              </span>
            </div>
            <p className="text-dark-400 text-sm ml-9">
              Submitted by <span className="text-white font-medium">{plantation.ngoCompanyName || plantation.ngoId?.name || 'Unknown NGO'}</span>
              {plantation.ngoId?.email && <span className="text-dark-500"> ({plantation.ngoId.email})</span>}
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 space-y-6">

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* User Tree Count */}
              <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700/50">
                <p className="text-dark-400 text-xs font-bold uppercase mb-1">Reported Trees</p>
                <p className="text-2xl font-black text-white">{plantation.treeCount}</p>
              </div>
              {/* AI Tree Count */}
              <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700/50">
                <p className="text-dark-400 text-xs font-bold uppercase mb-1">AI Tree Count</p>
                <p className="text-2xl font-black text-eco-400">{plantation.aiTreeCount ?? '—'}</p>
              </div>
              {/* Confidence Score */}
              <div className={`rounded-2xl p-4 border ${confidenceBadge.bg} ${confidenceBadge.border}`}>
                <p className="text-dark-400 text-xs font-bold uppercase mb-1">AI Confidence</p>
                <p className={`text-2xl font-black ${confidenceBadge.text}`}>
                  {plantation.confidenceScore ?? '—'}%
                  <span className="text-xs font-bold ml-1 opacity-80">{confidenceBadge.label}</span>
                </p>
              </div>
              {/* AI Verified */}
              <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700/50">
                <p className="text-dark-400 text-xs font-bold uppercase mb-1">AI Status</p>
                {plantation.aiVerified ? (
                  <p className="text-emerald-400 font-bold text-sm flex items-center gap-1 mt-1">
                    <HiCheck size={18} /> Verified
                  </p>
                ) : (
                  <p className="text-dark-500 font-bold text-sm mt-1">Not Verified</p>
                )}
              </div>
            </div>

            {/* Project Info */}
            {plantation.projectId && (
              <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700/50">
                <h4 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3">Project Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <p className="text-dark-300">
                    <span className="text-dark-400 w-28 inline-block font-medium">Title:</span>
                    <span className="text-white font-bold">{plantation.projectId.title}</span>
                  </p>
                  <p className="text-dark-300">
                    <span className="text-dark-400 w-28 inline-block font-medium">Category:</span>
                    <span className="text-white">{plantation.projectId.category}</span>
                  </p>
                  <p className="text-dark-300">
                    <span className="text-dark-400 w-28 inline-block font-medium">Target Funding:</span>
                    <span className="text-white font-bold">PKR {plantation.projectId.targetFunding?.toLocaleString()}</span>
                  </p>
                  <p className="text-dark-300">
                    <span className="text-dark-400 w-28 inline-block font-medium">Status:</span>
                    <span className={`font-bold ${plantation.projectId.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {plantation.projectId.status}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Image Gallery */}
            <div>
              <h4 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <HiPhotograph size={16} /> Uploaded Images ({plantation.imageUrls?.length || 1})
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-3 snap-x">
                {(plantation.imageUrls?.length > 0 ? plantation.imageUrls : [plantation.imageUrl]).filter(Boolean).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden bg-dark-800 min-w-[200px] h-40 flex-shrink-0 border border-dark-700 snap-center cursor-pointer"
                    onClick={() => setFullscreenImage(`http://localhost:5000/${imgUrl.replace(/\\/g, '/').replace(/^\//, '')}`)}
                  >
                    <img
                      src={`http://localhost:5000/${imgUrl.replace(/\\/g, '/').replace(/^\//, '')}`}
                      alt={`Plantation ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-bold bg-dark-900/70 px-3 py-1 rounded-full">View Full</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GPS / Map Section */}
            {lat && lng && (
              <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700/50">
                <h4 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <HiLocationMarker size={16} className="text-eco-400" /> GPS Location & Map
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-dark-400 text-xs mb-1">Latitude</p>
                    <p className="text-eco-400 font-mono text-sm">{lat}°</p>
                  </div>
                  <div>
                    <p className="text-dark-400 text-xs mb-1">Longitude</p>
                    <p className="text-eco-400 font-mono text-sm">{lng}°</p>
                  </div>
                </div>
                {/* Google Maps Embed or OpenStreetMap fallback */}
                <div className="rounded-xl overflow-hidden border border-dark-700 h-64">
                  <iframe
                    title="Plantation Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
                  ></iframe>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-eco-400 hover:text-eco-300 text-xs font-bold transition-colors"
                >
                  Open in Google Maps <HiExternalLink size={14} />
                </a>
              </div>
            )}

            {/* Reject Reason Form */}
            {showRejectForm && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 animate-fade-in">
                <h4 className="text-sm font-bold text-rose-400 mb-3">Rejection Reason</h4>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:border-rose-500 focus:outline-none resize-none"
                  placeholder="Provide a reason for rejection (optional)..."
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleReject}
                    disabled={actionLoading !== null}
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-dark-700 disabled:text-dark-400 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
                  >
                    {actionLoading === 'reject' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <HiX size={18} /> Confirm Rejection
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
                    className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          {!showRejectForm && (
            <div className="bg-dark-800 border-t border-dark-700 p-5 flex gap-4 shrink-0">
              <button
                onClick={handleApprove}
                disabled={actionLoading !== null}
                className="flex-1 py-3.5 bg-eco-500 hover:bg-eco-600 disabled:bg-dark-700 disabled:text-dark-400 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg"
              >
                {actionLoading === 'approve' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <HiCheck size={20} /> Approve Plantation
                  </>
                )}
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={actionLoading !== null}
                className="flex-1 py-3.5 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/30 hover:border-rose-500 disabled:bg-dark-700 disabled:text-dark-400 text-rose-400 hover:text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2"
              >
                <HiX size={20} /> Reject Plantation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Image Overlay */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 bg-dark-900/50 hover:bg-red-500 text-white p-3 rounded-full transition-colors z-[70]"
          >
            <HiX size={24} />
          </button>
          <img src={fullscreenImage} alt="Fullscreen" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </>
  );
};

export default PlantationReviewModal;
