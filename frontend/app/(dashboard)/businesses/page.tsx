"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../stores/auth-context';
import { listBusinesses, Business } from '../../../lib/api/businesses';
import { KPISummaryBar } from '../../../components/dashboard/KPISummaryBar';
import { FilterControlsToolbar } from '../../../components/dashboard/FilterControlsToolbar';
import { BusinessProfileCard } from '../../../components/dashboard/BusinessProfileCard';

export default function BusinessesDashboardPage() {
  const { activeOrganization } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBusinesses = async () => {
    if (!activeOrganization) return;
    try {
      setLoading(true);
      const res = await listBusinesses(activeOrganization.id, { search: searchTerm, limit: 50 });
      setBusinesses(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [activeOrganization, searchTerm]);

  // Derived KPI metrics
  const activeCount = useMemo(() => businesses.filter(b => b.status === 'ACTIVE').length, [businesses]);
  const totalProfiles = businesses.length || 30; // 30 is mock limit slot if none exists

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 pb-20">
      {/* Top Header / Nav - Note: Normally this is handled by a layout component, but we include the title here */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Title & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Business Profiles</h1>
            <p className="text-sm text-slate-500 mt-1">Manage, audit local Google rankings, and automate GBP optimizations.</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-400">Auto-sync with Google Maps active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            
            <div className="h-5 w-px bg-slate-200 ml-2 hidden sm:block"></div>
            
            <Link href="/businesses/new" className="ml-2 hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 hover:shadow-md hover:shadow-emerald-600/25 transition-all">
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span>Add Profile</span>
            </Link>
          </div>
        </div>

        {/* KPI Metrics */}
        <KPISummaryBar 
          activeProfiles={activeCount}
          totalProfiles={Math.max(totalProfiles, 30)}
          optimizedCount={Math.floor(activeCount * 0.8)} // Mock optimization count for demo
          totalAutomated={activeCount}
          pinnedCount={businesses.length > 0 ? 1 : 0}
          pinnedProfileName={businesses.length > 0 ? businesses[0].name : 'None'}
          tasksPendingCount={Math.max(0, activeCount * 2 - 1)} // Mock task count
        />

        {/* Filter Controls */}
        <FilterControlsToolbar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          selectedCount={0}
        />

        {/* Business List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading business profiles...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : businesses.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No businesses yet</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">Add your first Google Business Profile to start tracking your local SEO performance and keywords.</p>
              <Link href="/businesses/new" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all">
                Add Business Profile
              </Link>
            </div>
          ) : (
            businesses.map((business) => (
              <BusinessProfileCard 
                key={business.id} 
                business={business} 
                organizationId={activeOrganization!.id} 
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
