import React from 'react';

export interface FilterControlsToolbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCount?: number;
}

export function FilterControlsToolbar({
  searchTerm,
  setSearchTerm,
  selectedCount = 0
}: FilterControlsToolbarProps) {
  return (
    <section aria-label="Profiles Filter and Toolbar" className="bg-white rounded-xl border border-slate-200/90 p-3 sm:p-4 shadow-sm mt-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Search & Filter inputs */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 transition" 
              placeholder="Search business name, address, or tag..." 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Tag / Filter Dropdown */}
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors" type="button">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
            </svg>
            <span>All Tags</span>
            <svg className="w-3.5 h-3.5 text-slate-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          {/* Google Account Sync Filter */}
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors" type="button">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2zm0-10h2v8h-2z"></path>
            </svg>
            <span>Google: Connected</span>
            <svg className="w-3.5 h-3.5 text-slate-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        
        {/* Right: Sort & Display Toggles */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          {/* Bulk Checkbox Info */}
          <div className="flex items-center gap-2 mr-1">
            <input className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" id="select-all" type="checkbox" />
            <label className="text-xs font-semibold text-slate-600 cursor-pointer select-none" htmlFor="select-all">
              {selectedCount} profiles selected
            </label>
          </div>
          
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <span className="text-xs">Sort:</span>
            <select className="py-1 pl-2 pr-7 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer outline-none">
              <option>Last updated</option>
              <option>Highest local rank</option>
              <option>Alphabetical</option>
              <option>Tasks pending</option>
            </select>
          </div>
          
          {/* Show Keywords Toggle */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input defaultChecked className="sr-only peer" type="checkbox" />
            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="text-xs font-medium text-slate-700">Keywords</span>
          </label>
          
          {/* View Switcher (Grid/List) */}
          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button className="p-1 rounded text-emerald-700 bg-white shadow-sm" title="List View" type="button">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <button className="p-1 rounded text-slate-400 hover:text-slate-600" title="Card Grid View" type="button">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
