import React from 'react';

export interface KPISummaryBarProps {
  activeProfiles: number;
  totalProfiles: number;
  optimizedCount: number;
  totalAutomated: number;
  pinnedCount: number;
  pinnedProfileName: string;
  tasksPendingCount: number;
}

export function KPISummaryBar({
  activeProfiles = 2,
  totalProfiles = 30,
  optimizedCount = 2,
  totalAutomated = 15,
  pinnedCount = 1,
  pinnedProfileName = 'Mountain Meadow E-Bike...',
  tasksPendingCount = 4
}: Partial<KPISummaryBarProps>) {
  return (
    <section aria-label="KPI Metrics" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: Active Profiles */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">All Active</span>
          <svg className="w-4 h-4 text-slate-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <title>Active profiles under this subscription slot</title>
            <circle cx="12" cy="12" r="10" strokeWidth="1.8"></circle>
            <path d="M12 16v-4m0-4h.01" strokeLinecap="round" strokeWidth="2"></path>
          </svg>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">{activeProfiles}</span>
          <span className="text-sm font-medium text-slate-400">/ {totalProfiles} slots</span>
        </div>
        <div className="mt-3">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round((activeProfiles / totalProfiles) * 100))}%` }}></div>
          </div>
        </div>
      </div>

      {/* Card 2: Optimization Status */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">Optimization</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">Healthy</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">{optimizedCount}</span>
          <span className="text-sm font-medium text-slate-400">/ {totalAutomated} automated</span>
        </div>
        <div className="mt-3">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round((optimizedCount / totalAutomated) * 100))}%` }}></div>
          </div>
        </div>
      </div>

      {/* Card 3: Pinned Profiles */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">Pinned Priority</span>
          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"></path>
          </svg>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">{pinnedCount}</span>
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            High Traffic
          </span>
        </div>
        <div className="mt-3 text-xs text-slate-400 truncate">
          {pinnedProfileName}
        </div>
      </div>

      {/* Card 4: Needs Review / Inactive */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">Tasks Pending</span>
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900">{tasksPendingCount}</span>
          <span className="text-xs font-medium text-amber-600">Action recommended</span>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          3 GBP updates, 1 review reply
        </div>
      </div>
    </section>
  );
}
