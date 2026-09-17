import React, { useEffect, useState } from 'react';
import { Business } from '../../lib/api/businesses';
import { Keyword, listKeywords } from '../../lib/api/keywords';

export interface BusinessProfileCardProps {
  business: Business;
  organizationId: string;
}

export function BusinessProfileCard({ business, organizationId }: BusinessProfileCardProps) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    async function loadKeywords() {
      if (!business.id || !organizationId) return;
      try {
        setLoading(true);
        const res = await listKeywords(organizationId, { businessId: business.id, limit: 10 });
        setKeywords(res.data || []);
      } catch (err) {
        console.error('Failed to load keywords for business', business.id, err);
      } finally {
        setLoading(false);
      }
    }
    loadKeywords();
  }, [business.id, organizationId]);

  // Calculate aggregates
  const validRankings = keywords.filter(k => k.currentRanking?.position != null);
  const avgRank = validRankings.length > 0 
    ? (validRankings.reduce((sum, k) => sum + (k.currentRanking?.position || 0), 0) / validRankings.length).toFixed(1)
    : '-';
    
  const validVisibility = keywords.filter(k => k.currentRanking?.visibility_score != null);
  const avgVisibility = validVisibility.length > 0
    ? Math.round(validVisibility.reduce((sum, k) => sum + (k.currentRanking?.visibility_score || 0), 0) / validVisibility.length)
    : 0;

  // Placeholder initials for avatar
  const initials = business.name.substring(0, 2).toUpperCase();

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300 mb-6">
      {/* Card Header Area */}
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-white via-white to-emerald-50/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Business Identity Info */}
          <div className="flex items-start gap-3.5">
            {/* Row Checkbox & Pin Action */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <input className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" type="checkbox" />
              <button className="text-emerald-600 hover:text-emerald-700 transition" title="Pin Profile" type="button">
                <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"></path>
                </svg>
              </button>
            </div>
            
            {/* Profile Avatar / Visual Maps Pin */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
              <span className="text-emerald-800 font-bold text-lg sm:text-xl">{initials}</span>
              <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-500"></div>
            </div>
            
            {/* Business Meta Details */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition">
                  {business.name}
                </h2>
                {business.status === 'ACTIVE' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active
                  </span>
                )}
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                  {business.slug || business.id.substring(0, 8)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {business.location_count || 0} Locations
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">{business.primary_category || 'Uncategorized'}</span>
              </div>
              
              {/* Tags / Chips row */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <button className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-0.5 pl-1" type="button">
                  + Add Tag
                </button>
              </div>
            </div>
          </div>
          
          {/* Top Right Controls: Quick Rank, Pending tasks & Toggle */}
          <div className="flex flex-wrap items-center gap-3 self-end lg:self-center pl-10 lg:pl-0">
            {/* Quick Stat Pill: Average Rank */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Avg Rank:</span>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                #{avgRank}
              </span>
            </div>
            
            {/* Quick Stat Pill: Visibility score */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span className="font-bold text-slate-800">{avgVisibility}%</span>
              </div>
              <div className="w-10 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${avgVisibility}%` }}></div>
              </div>
            </div>
            
            {/* View Keywords Toggle */}
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition" 
              type="button"
            >
              <span>{isExpanded ? 'Hide Keywords' : `View ${keywords.length} Keywords`}</span>
              <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {/* Optimization Active Toggle */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">Optimization</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input defaultChecked className="sr-only peer" type="checkbox" />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            
            {/* More dropdown button */}
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition" title="More options" type="button">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded keyword ranking breakdown */}
      {isExpanded && (
        <div className="bg-white">
          <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-xs tracking-wide uppercase">Tracked Keywords ({keywords.length} active)</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 transition" type="button">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Add Keywords
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold tracking-wider text-slate-400 uppercase bg-white">
                  <th className="py-2.5 px-4 sm:px-6">Keyword</th>
                  <th className="py-2.5 px-4">Local Rank</th>
                  <th className="py-2.5 px-4">Search Visibility</th>
                  <th className="py-2.5 px-4">Last Sync</th>
                  <th className="py-2.5 px-4 sm:px-6 text-right">Radar / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">Loading keywords...</td>
                  </tr>
                ) : keywords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">No keywords tracked yet.</td>
                  </tr>
                ) : (
                  keywords.map(kw => {
                    const pos = kw.currentRanking?.position || null;
                    const vis = kw.currentRanking?.visibility_score || 0;
                    
                    // Style logic based on rank
                    let rankBg = 'bg-slate-50 text-slate-700 border-slate-200';
                    let rankDot = 'bg-slate-400';
                    let visColor = 'bg-slate-400';
                    
                    if (pos !== null) {
                      if (pos <= 3) {
                        rankBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        rankDot = 'bg-emerald-500';
                        visColor = 'bg-emerald-500';
                      } else if (pos <= 10) {
                        rankBg = 'bg-amber-50 text-amber-700 border-amber-200';
                        rankDot = 'bg-amber-500';
                        visColor = 'bg-amber-500';
                      }
                    }
                    
                    return (
                      <tr key={kw.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 group-hover:text-emerald-700 transition">{kw.keyword}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${rankBg} border`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${rankDot}`}></span>
                            {pos !== null ? `Rank ${pos}` : 'Unranked'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5 max-w-xs">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className={`${visColor} h-2 rounded-full`} style={{ width: `${vis}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">{vis}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            {kw.lastCheckedAt ? new Date(kw.lastCheckedAt).toLocaleDateString() : 'Never'}
                            <button className="hover:text-emerald-600 transition" title="Re-check live rank" type="button">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            </button>
                          </span>
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition" title="View Heatmap Radar" type="button">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth="1.8"></circle><circle cx="12" cy="12" r="5" strokeWidth="1.8"></circle><circle cx="12" cy="12" r="1" strokeWidth="2"></circle></svg>
                            </button>
                            <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition" title="Keyword Options" type="button">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </article>
  );
}
