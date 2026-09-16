"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../stores/auth-context';
import { apiClient } from '../../../lib/api/client';

export default function CompetitorsPage() {
  const { activeOrganization: currentOrganization } = useAuth();
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitors = async () => {
    if (!currentOrganization) return;
    setLoading(true);
    try {
      const result = await apiClient.get(`/organizations/${currentOrganization.id}/competitors`);
      setCompetitors(result || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, [currentOrganization]);

  const handleUntrack = async (id: string) => {
    if (!currentOrganization) return;
    try {
      await apiClient.post(`/organizations/${currentOrganization.id}/competitors/${id}/untrack`, {});
      fetchCompetitors();
    } catch (err: any) {
      alert('Failed to untrack: ' + err.message);
    }
  };
  
  const handleArchive = async (id: string) => {
    if (!currentOrganization) return;
    if (!confirm('Are you sure you want to archive this competitor?')) return;
    try {
      await apiClient.delete(`/organizations/${currentOrganization.id}/competitors/${id}`);
      fetchCompetitors();
    } catch (err: any) {
      alert('Failed to archive: ' + err.message);
    }
  };

  const trackedCount = competitors.filter(c => c.tracking_status === 'TRACKED').length;
  const avgDistance = competitors.length > 0 ? (competitors.reduce((acc, c) => acc + c.distance_meters, 0) / competitors.length / 1000).toFixed(2) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competitors</h1>
          <p className="text-sm text-gray-500 mt-1">Track nearby businesses and compare local market signals.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/competitors/compare"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
          >
            Compare
          </Link>
          <button
            onClick={fetchCompetitors}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
          >
            Refresh Data
          </button>
          <Link 
            href="/competitors/discover"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
          >
            Discover Competitors
          </Link>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Tracked Competitors</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{trackedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Nearby Competitors</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{competitors.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Average Distance</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{avgDistance} km</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Ranking Data Available</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
             <div key={i} className="h-16 bg-gray-200 rounded-lg w-full"></div>
          ))}
        </div>
      ) : competitors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No competitors tracked</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by discovering nearby places from Open Data sources.</p>
          <div className="mt-6">
            <Link
              href="/competitors/discover"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
            >
              Discover Competitors
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ranking Data</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {competitors.map((comp) => (
                <tr key={comp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{comp.name}</div>
                        <div className="text-sm text-gray-500">{comp.website_url || comp.phone || 'No contact info'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {comp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(comp.distance_meters / 1000).toFixed(2)} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {comp.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${comp.tracking_status === 'TRACKED' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {comp.tracking_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Unavailable
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <div className="flex items-center justify-end space-x-3">
                       <Link href={`/competitors/${comp.id}`} className="text-emerald-600 hover:text-emerald-900">
                         View
                       </Link>
                       {comp.tracking_status === 'TRACKED' ? (
                         <button onClick={() => handleUntrack(comp.id)} className="text-yellow-600 hover:text-yellow-900">
                           Untrack
                         </button>
                       ) : (
                         <button onClick={() => handleArchive(comp.id)} className="text-red-600 hover:text-red-900">
                           Archive
                         </button>
                       )}
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
