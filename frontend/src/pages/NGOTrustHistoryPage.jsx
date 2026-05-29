import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import ngoService from '../services/ngoService';
import useAuth from '../hooks/useAuth';
import { 
  HiChevronLeft, 
  HiShieldCheck, 
  HiTrendingUp, 
  HiTrendingDown, 
  HiInformationCircle,
  HiClipboardList
} from 'react-icons/hi';

const NGOTrustHistoryPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrustHistory = async () => {
      setLoading(true);
      try {
        const response = await ngoService.getNGOTrustHistory(userId);
        setHistoryData(response.data.data);
      } catch (error) {
        console.error('Failed to load trust history data', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchTrustHistory();
    }
  }, [userId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-eco-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!historyData) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-center p-6">
        <Navbar />
        <div className="card-eco p-12 max-w-md w-full">
          <HiInformationCircle size={60} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">History Not Found</h2>
          <p className="text-dark-400 mb-6">Could not load trust history for this NGO profile.</p>
          <button onClick={() => navigate(-1)} className="btn-eco w-full">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { ngoName, trustScore, trustTier, history } = historyData;

  // Process data for trend chart (Chronological order: oldest to newest)
  // Include starting default score of 70 as the first point
  const chronologicalHistory = [...history].reverse();
  const trendPoints = [70, ...chronologicalHistory.map(h => h.newScore)];

  // Draw SVG path coordinates
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = 30;
  const usableWidth = chartWidth - padding * 2;
  const usableHeight = chartHeight - padding * 2;

  let pointsStr = '';
  if (trendPoints.length > 1) {
    pointsStr = trendPoints.map((score, idx) => {
      const x = padding + (idx * (usableWidth / (trendPoints.length - 1)));
      // Invert Y coordinate since SVG (0,0) is top-left
      const y = padding + (usableHeight - ((score / 100) * usableHeight));
      return `${x},${y}`;
    }).join(' ');
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <Navbar />
      
      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-dark-400 hover:text-white mb-8 transition-colors text-sm font-semibold"
        >
          <HiChevronLeft size={20} /> Back to Profile
        </button>

        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-dark-800">
          <div>
            <h1 className="text-3xl font-display font-black text-white">{ngoName}</h1>
            <p className="text-sm text-dark-400 mt-1">Real-time Trust Score History & Audits</p>
          </div>
          <div className="bg-dark-900 border border-dark-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
            <div>
              <p className="text-[10px] uppercase font-bold text-dark-400 tracking-wider">Current Score</p>
              <p className="text-3xl font-black text-eco-400">{trustScore}%</p>
            </div>
            <div className="border-l border-dark-800 pl-4">
              <p className="text-[10px] uppercase font-bold text-dark-400 tracking-wider">Tier Status</p>
              <p className={`text-sm font-bold mt-1 px-3 py-1 rounded-full border ${
                trustScore >= 90 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                trustScore >= 75 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                trustScore >= 50 ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                'text-red-400 bg-red-500/10 border-red-500/20'
              }`}>{trustTier}</p>
            </div>
          </div>
        </div>

        {/* Real-time Trend Chart */}
        <div className="card-eco p-6 mb-10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-eco-500/5 to-transparent pointer-events-none"></div>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <HiShieldCheck className="text-eco-400" /> Trust Score Trend Line
          </h2>

          {trendPoints.length <= 1 ? (
            <div className="h-48 flex items-center justify-center text-dark-500 font-semibold text-sm">
              Not enough verification history to draw a trend.
            </div>
          ) : (
            <div className="w-full overflow-x-auto custom-scroll">
              <div className="min-w-[600px] flex justify-center py-2">
                <svg width={chartWidth} height={chartHeight} className="overflow-visible">
                  {/* Grid Lines */}
                  {[0, 25, 50, 75, 100].map((level) => {
                    const y = padding + (usableHeight - ((level / 100) * usableHeight));
                    return (
                      <g key={level}>
                        <line 
                          x1={padding} 
                          y1={y} 
                          x2={chartWidth - padding} 
                          y2={y} 
                          stroke="#1e293b" 
                          strokeWidth="1" 
                          strokeDasharray="4"
                        />
                        <text 
                          x={padding - 8} 
                          y={y + 4} 
                          fill="#64748b" 
                          fontSize="9" 
                          fontWeight="bold"
                          textAnchor="end"
                        >
                          {level}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Trend Area Gradient */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>

                  {/* Shaded Area Under Line */}
                  <path
                    d={`M ${padding},${padding + usableHeight} L ${pointsStr} L ${chartWidth - padding},${padding + usableHeight} Z`}
                    fill="url(#chartGradient)"
                  />

                  {/* Line Connection */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    points={pointsStr}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  />

                  {/* Interactive Nodes */}
                  {trendPoints.map((score, idx) => {
                    const x = padding + (idx * (usableWidth / (trendPoints.length - 1)));
                    const y = padding + (usableHeight - ((score / 100) * usableHeight));
                    return (
                      <g key={idx} className="group/node cursor-pointer">
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#10b981"
                          stroke="#020617"
                          strokeWidth="2"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="12"
                          fill="#10b981"
                          fillOpacity="0"
                          className="hover:fill-opacity-20 transition-all duration-200"
                        />
                        {/* Tooltip on hover */}
                        <g className="opacity-0 group-hover/node:opacity-100 pointer-events-none transition-opacity duration-200">
                          <rect
                            x={x - 25}
                            y={y - 32}
                            width="50"
                            height="22"
                            rx="6"
                            fill="#0f172a"
                            stroke="#334155"
                            strokeWidth="1"
                          />
                          <text
                            x={x}
                            y={y - 18}
                            fill="#fff"
                            fontSize="10"
                            fontWeight="black"
                            textAnchor="middle"
                          >
                            {score}%
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-dark-500 font-bold px-8 mt-2 min-w-[600px]">
                <span>Registered (Initial)</span>
                <span>Submissions & Admin Audits over Time</span>
                <span>Current Status</span>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Audit Log History */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <HiClipboardList className="text-eco-500" /> Historical Recalculation Logs
          </h2>

          {history.length === 0 ? (
            <div className="card-eco p-12 text-center flex flex-col items-center">
              <HiInformationCircle size={40} className="text-dark-500 mb-2" />
              <h3 className="text-base font-bold text-white mb-1">No Trust History Available</h3>
              <p className="text-dark-400 text-xs">This NGO hasn't had any plantation data processed or reviewed by an admin yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((log) => {
                const date = new Date(log.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={log._id} className="card-eco p-5 border-dark-800 bg-dark-900/50 hover:bg-dark-900/80 transition-colors flex items-start gap-4 justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-bold text-dark-400">{date}</span>
                        {log.projectId && (
                          <span className="bg-dark-950 text-eco-400 border border-dark-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            Project: {log.projectId.title}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm font-semibold text-white leading-relaxed">{log.reason}</p>
                      
                      {log.plantationId && (
                        <div className="text-[11px] text-dark-400 flex items-center gap-4">
                          <span>Reported Count: <strong className="text-white">{log.plantationId.treeCount}</strong></span>
                          <span>AI Detected: <strong className="text-eco-400">{log.plantationId.aiTreeCount || 0}</strong></span>
                          <span>Status: <strong className={`uppercase ${
                            log.plantationId.verificationStatus === 'approved' ? 'text-emerald-400' : 'text-red-400'
                          }`}>{log.plantationId.verificationStatus}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Change Indicator */}
                    <div className="shrink-0 flex flex-col items-end justify-center">
                      <div className="flex items-center gap-1">
                        {log.change > 0 ? (
                          <span className="flex items-center gap-0.5 text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <HiChevronLeft size={16} className="rotate-90" />
                            +{log.change}
                          </span>
                        ) : log.change < 0 ? (
                          <span className="flex items-center gap-0.5 text-red-400 font-bold text-sm bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                            <HiChevronLeft size={16} className="-rotate-90" />
                            {log.change}
                          </span>
                        ) : (
                          <span className="text-dark-400 font-bold text-sm bg-dark-800 px-2 py-0.5 rounded border border-dark-700">
                            No Change
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-dark-500 mt-1 font-bold">
                        {log.oldScore}% → {log.newScore}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NGOTrustHistoryPage;
