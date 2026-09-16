"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../stores/auth-context';
import { apiClient } from '../../../../lib/api/client';
import Link from 'next/link';
import { CompetitorMap } from '../../../../components/competitors/CompetitorMap';

export default function CompetitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const competitorId = params.competitorId as string;
  const { activeOrganization } = useAuth();
  
  const [competitor, setCompetitor] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitorData = async () => {
    if (!activeOrganization || !competitorId) return;
    try {
      const [compRes, histRes] = await Promise.all([
        apiClient.get(`/organizations/${activeOrganization.id}/competitors/${competitorId}`),
        apiClient.get(`/organizations/${activeOrganization.id}/competitors/${competitorId}/history`)
      ]);
      setCompetitor(compRes);
      setHistory(histRes || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitorData();
  }, [activeOrganization, competitorId]);

  const handleRefresh = async () => {
    if (!activeOrganization || refreshing) return;
    setRefreshing(true);
    try {
      await apiClient.post(`/organizations/${activeOrganization.id}/competitors/${competitorId}/refresh`, {});
      alert('Refresh job queued successfully. Data will update shortly.');
      // Optionally fetch again after a delay, or rely on user refreshing
      setTimeout(fetchCompetitorData, 2000);
    } catch (err: any) {
      alert('Failed to refresh: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUntrack = async () => {
    if (!activeOrganization) return;
    if (!confirm('Untrack this competitor?')) return;
    try {
      await apiClient.post(`/organizations/${activeOrganization.id}/competitors/${competitorId}/untrack`, {});
      fetchCompetitorData();
    } catch (err: any) {
      alert('Failed to untrack: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
        <div className="grid grid-cols-2 gap-4">
           <div className="h-40 bg-gray-200 rounded-xl"></div>
           <div className="h-40 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !competitor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error || 'Competitor not found'}
        </div>
        <Link href="/competitors" className="mt-4 text-emerald-600 hover:underline">
          &larr; Back to Competitors
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/competitors" className="text-sm text-emerald-600 hover:underline mb-2 inline-block">
            &larr; Back to Competitors
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{competitor.name}</h1>
          <div className="flex items-center gap-3 mt-2">
             <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
               {competitor.category}
             </span>
             <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
               Source: {competitor.source}
             </span>
             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${competitor.tracking_status === 'TRACKED' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
               {competitor.tracking_status}
             </span>
          </div>
        </div>
        <div className="flex gap-3">
          {competitor.tracking_status === 'TRACKED' && (
            <button
              onClick={handleUntrack}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
            >
              Untrack
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Map */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {competitor.address_line_1 || 'N/A'}<br/>
                  {competitor.city}, {competitor.state} {competitor.postal_code}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="mt-1 text-sm text-blue-600 hover:underline">
                  {competitor.website_url ? <a href={competitor.website_url} target="_blank" rel="noreferrer">{competitor.website_url}</a> : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{competitor.phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Distance</dt>
                <dd className="mt-1 text-sm text-gray-900">{(competitor.distance_meters / 1000).toFixed(2)} km</dd>
              </div>
            </dl>
          </div>

          {/* Location Map Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-medium text-gray-900 mb-4">Location Map</h2>
             <div className="w-full relative h-[400px]">
               <CompetitorMap
                  businessLat={0}
                  businessLng={0}
                  competitors={[{
                    id: competitor.id,
                    latitude: competitor.latitude,
                    longitude: competitor.longitude,
                    name: competitor.name,
                    category: competitor.category,
                    distanceMeters: competitor.distance_meters,
                    status: competitor.tracking_status
                  }]}
                />
             </div>
          </div>

        </div>

        {/* Right Column: Signals & History */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Ranking Comparison</h2>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
              <p className="text-sm text-gray-500">Google Ranking Data Unavailable</p>
              <p className="text-xs text-gray-400 mt-1">Legitimate ranking provider required</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">History</h2>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500">No historical data available.</p>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {history.map((event, eventIdx) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {eventIdx !== history.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center ring-8 ring-white">
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">Snapshot captured <span className="font-medium text-gray-900">Open Data Update</span></p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {new Date(event.captured_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
