"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../stores/auth-context';
import { listKeywords, archiveKeyword, Keyword } from '../../../lib/api/keywords';
import { Button } from '../../../components/ui/button';
import { listBusinesses, Business } from '../../../lib/api/businesses';
import { listLocations, Location } from '../../../lib/api/locations';

export default function KeywordsPage() {
  const { activeOrganization } = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (!activeOrganization) return;
    const fetchDropdowns = async () => {
      try {
        const bRes = await listBusinesses(activeOrganization.id, { limit: 100 });
        setBusinesses(bRes.data);
        const lRes = await listLocations(activeOrganization.id, { limit: 100 });
        setLocations(lRes.data);
      } catch (e) {
        console.error('Failed to load dropdowns', e);
      }
    };
    fetchDropdowns();
  }, [activeOrganization]);

  const fetchKeywords = async () => {
    if (!activeOrganization) return;
    try {
      setLoading(true);
      const params: any = { search: searchTerm };
      if (selectedBusiness) params.businessId = selectedBusiness;
      if (selectedLocation) params.locationId = selectedLocation;
      
      const res = await listKeywords(activeOrganization.id, params);
      setKeywords(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load keywords');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchKeywords();
    }, 500); // Debounce search
    return () => clearTimeout(delayDebounceFn);
  }, [activeOrganization, searchTerm, selectedBusiness, selectedLocation]);

  const handleArchive = async (id: string) => {
    if (!activeOrganization) return;
    if (!confirm('Are you sure you want to archive this keyword?')) return;
    try {
      await archiveKeyword(activeOrganization.id, id);
      fetchKeywords();
    } catch (err: any) {
      alert(err.message || 'Failed to archive keyword');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Keywords</h1>
          <p className="text-gray-500 mt-1">Track and manage the search terms that matter to your local visibility.</p>
        </div>
        <Link href="/keywords/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Add Keywords
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search keywords..."
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
          >
            <option value="">All Businesses</option>
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select 
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading keywords...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : keywords.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No keywords tracked</h3>
            <p className="text-gray-500 mb-6">Add keywords to start tracking your local SEO rankings.</p>
            <Link href="/keywords/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Add Keywords</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keyword</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Engine / Device</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Position</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Checked</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {keywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{kw.keyword}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{kw.location?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{kw.business?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{kw.search_engine}</div>
                      <div className="text-xs text-gray-400">{kw.device}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {kw.currentRanking?.position ?? 'Not tracked yet'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {kw.rankingChange != null ? kw.rankingChange : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        kw.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 
                        kw.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {kw.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {kw.lastCheckedAt ? new Date(kw.lastCheckedAt).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link href={`/keywords/${kw.id}`} className="text-gray-600 hover:text-gray-900 transition-colors">
                          View
                        </Link>
                        <Link href={`/keywords/${kw.id}/edit`} className="text-blue-600 hover:text-blue-900 transition-colors">
                          Edit
                        </Link>
                        <button onClick={() => handleArchive(kw.id)} className="text-red-600 hover:text-red-900 transition-colors">
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
