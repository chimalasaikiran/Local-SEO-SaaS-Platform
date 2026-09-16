"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../stores/auth-context';
import { apiClient } from '../../../../lib/api/client';
import Link from 'next/link';

export default function CompareCompetitorsPage() {
  const { activeOrganization } = useAuth();
  
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [availableCompetitors, setAvailableCompetitors] = useState<any[]>([]);
  
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeOrganization) {
      apiClient.get(`/organizations/${activeOrganization.id}/businesses`).then(res => setBusinesses(res.data || [])).catch(err => console.error(err));
      apiClient.get(`/organizations/${activeOrganization.id}/competitors`).then(res => {
        // Only allow comparing tracked competitors
        const tracked = (res || []).filter((c: any) => c.tracking_status === 'TRACKED');
        setAvailableCompetitors(tracked);
      }).catch(err => console.error(err));
    }
  }, [activeOrganization]);

  useEffect(() => {
    if (activeOrganization && selectedBusiness) {
      apiClient.get(`/organizations/${activeOrganization.id}/businesses/${selectedBusiness}/locations`).then(res => setLocations(res.data || [])).catch(err => console.error(err));
    }
  }, [activeOrganization, selectedBusiness]);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization || !selectedBusiness || !selectedLocation || selectedCompetitors.length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const compIds = selectedCompetitors.join(',');
      const res = await apiClient.get(`/organizations/${activeOrganization.id}/competitors/compare?businessId=${selectedBusiness}&locationId=${selectedLocation}&competitorIds=${compIds}`);
      setComparisonData(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompetitor = (id: string) => {
    setSelectedCompetitors(prev => {
      if (prev.includes(id)) return prev.filter(cId => cId !== id);
      if (prev.length >= 3) {
        alert('You can compare up to 3 competitors at a time.');
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/competitors" className="text-sm text-emerald-600 hover:underline mb-2 inline-block">
          &larr; Back to Competitors
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Competitor Comparison</h1>
        <p className="text-sm text-gray-500 mt-1">Compare local market signals against tracked competitors.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <form onSubmit={handleCompare} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Business</label>
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select a business</option>
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                disabled={!selectedBusiness}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md disabled:bg-gray-100"
                required
              >
                <option value="">Select a location</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Competitors to Compare (Max 3)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableCompetitors.map(comp => (
                <div 
                  key={comp.id} 
                  onClick={() => toggleCompetitor(comp.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedCompetitors.includes(comp.id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      checked={selectedCompetitors.includes(comp.id)} 
                      readOnly 
                      className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{comp.name}</p>
                      <p className="text-xs text-gray-500">{comp.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {availableCompetitors.length === 0 && (
              <p className="text-sm text-gray-500">No tracked competitors available.</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !selectedBusiness || !selectedLocation || selectedCompetitors.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400"
            >
              {loading ? 'Comparing...' : 'Compare'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {comparisonData && (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Metric</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider w-1/4">
                  {comparisonData.business.name} (You)
                </th>
                {comparisonData.competitors.map((comp: any) => (
                  <th key={comp.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    {comp.name}
                  </th>
                ))}
                {/* Fill empty columns if less than 3 competitors selected */}
                {Array.from({ length: 3 - comparisonData.competitors.length }).map((_, i) => (
                  <th key={`empty-${i}`} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"></th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Distance</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">—</td>
                {comparisonData.competitors.map((comp: any) => (
                  <td key={comp.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(comp.distance_meters / 1000).toFixed(2)} km
                  </td>
                ))}
                {Array.from({ length: 3 - comparisonData.competitors.length }).map((_, i) => (
                  <td key={`empty-dist-${i}`} className="px-6 py-4 whitespace-nowrap"></td>
                ))}
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Category</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comparisonData.business.primary_category || 'N/A'}</td>
                {comparisonData.competitors.map((comp: any) => (
                  <td key={comp.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comp.category || 'N/A'}
                  </td>
                ))}
                {Array.from({ length: 3 - comparisonData.competitors.length }).map((_, i) => (
                  <td key={`empty-cat-${i}`} className="px-6 py-4 whitespace-nowrap"></td>
                ))}
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Website</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comparisonData.business.website_url ? 'Yes' : 'No'}
                </td>
                {comparisonData.competitors.map((comp: any) => (
                  <td key={comp.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comp.website_url ? 'Yes' : 'No'}
                  </td>
                ))}
                {Array.from({ length: 3 - comparisonData.competitors.length }).map((_, i) => (
                  <td key={`empty-web-${i}`} className="px-6 py-4 whitespace-nowrap"></td>
                ))}
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Phone</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comparisonData.business.phone ? 'Yes' : 'No'}
                </td>
                {comparisonData.competitors.map((comp: any) => (
                  <td key={comp.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comp.phone ? 'Yes' : 'No'}
                  </td>
                ))}
                {Array.from({ length: 3 - comparisonData.competitors.length }).map((_, i) => (
                  <td key={`empty-phone-${i}`} className="px-6 py-4 whitespace-nowrap"></td>
                ))}
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">OSM Data</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">N/A</td>
                {comparisonData.competitors.map((comp: any) => (
                  <td key={comp.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comp.source === 'OSM' ? 'Available' : 'N/A'}
                  </td>
                ))}
                {Array.from({ length: 3 - comparisonData.competitors.length }).map((_, i) => (
                  <td key={`empty-osm-${i}`} className="px-6 py-4 whitespace-nowrap"></td>
                ))}
              </tr>

              <tr className="hover:bg-gray-50 bg-yellow-50/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Keywords</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">Unavailable</td>
                {comparisonData.competitors.map((comp: any) => (
                  <td key={comp.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">Unavailable</td>
                ))}
                {Array.from({ length: 3 - comparisonData.competitors.length }).map((_, i) => (
                  <td key={`empty-kw-${i}`} className="px-6 py-4 whitespace-nowrap"></td>
                ))}
              </tr>

              <tr className="hover:bg-gray-50 bg-yellow-50/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Google Ranking</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">Unavailable</td>
                {comparisonData.competitors.map((comp: any) => (
                  <td key={comp.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">Unavailable</td>
                ))}
                {Array.from({ length: 3 - comparisonData.competitors.length }).map((_, i) => (
                  <td key={`empty-rank-${i}`} className="px-6 py-4 whitespace-nowrap"></td>
                ))}
              </tr>

              <tr className="hover:bg-gray-50 bg-yellow-50/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Local Visibility</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">Unavailable</td>
                {comparisonData.competitors.map((comp: any) => (
                  <td key={comp.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">Unavailable</td>
                ))}
                {Array.from({ length: 3 - comparisonData.competitors.length }).map((_, i) => (
                  <td key={`empty-vis-${i}`} className="px-6 py-4 whitespace-nowrap"></td>
                ))}
              </tr>

            </tbody>
          </table>
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-center">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Google Ranking Data is currently unavailable as no legitimate ranking provider is connected.
          </div>
        </div>
      )}
    </div>
  );
}
