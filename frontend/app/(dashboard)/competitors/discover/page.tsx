"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../stores/auth-context';
import { apiClient } from '../../../../lib/api/client';
import Link from 'next/link';
import { CompetitorMap } from '../../../../components/competitors/CompetitorMap';

export default function DiscoverCompetitorsPage() {
  const { activeOrganization } = useAuth();
  const router = useRouter();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [category, setCategory] = useState('');
  const [radius, setRadius] = useState(5000);

  const [discovering, setDiscovering] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeOrganization) {
      apiClient.get(`/organizations/${activeOrganization.id}/businesses`).then(res => setBusinesses(res.data || [])).catch(err => console.error(err));
    }
  }, [activeOrganization]);

  useEffect(() => {
    if (activeOrganization && selectedBusiness) {
      apiClient.get(`/organizations/${activeOrganization.id}/businesses/${selectedBusiness}/locations`).then(res => setLocations(res.data || [])).catch(err => console.error(err));
    }
  }, [activeOrganization, selectedBusiness]);

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization || !selectedBusiness || !selectedLocation || !category) return;
    
    setDiscovering(true);
    setError(null);
    try {
      const res = await apiClient.post(`/organizations/${activeOrganization.id}/competitors/discover`, {
        businessId: selectedBusiness,
        locationId: selectedLocation,
        category,
        radiusMeters: radius,
        limit: 50
      });
      setResults(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDiscovering(false);
    }
  };

  const handleTrack = async (place: any) => {
    try {
      await apiClient.post(`/organizations/${activeOrganization.id}/competitors/${place.id}/track`, {});
      setResults(prev => prev.map(r => r.id === place.id ? { ...r, status: 'ACTIVE', tracking_status: 'TRACKED' } : r));
    } catch (err: any) {
      alert('Failed to track: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/competitors" className="text-sm text-emerald-600 hover:underline mb-2 inline-block">
          &larr; Back to Competitors
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Discover Competitors</h1>
        <p className="text-sm text-gray-500 mt-1">Find nearby competitors using OpenStreetMap data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-1">
          <form onSubmit={handleDiscover} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Business</label>
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
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                disabled={!selectedBusiness}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md disabled:bg-gray-100"
                required
              >
                <option value="">Select a location</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name} - {l.city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category to Search</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. restaurant, plumber"
                className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Radius (meters)</label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value) || 5000)}
                min={100}
                max={50000}
                className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={discovering || !selectedBusiness || !selectedLocation || !category}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400"
            >
              {discovering ? 'Discovering...' : 'Discover'}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Map & Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Results Map</h2>
            <div className="w-full relative h-[400px]">
              {selectedLocation ? (
                (() => {
                  const loc = locations.find(l => l.id === selectedLocation);
                  return (
                    <CompetitorMap
                      businessLat={loc?.latitude || 0}
                      businessLng={loc?.longitude || 0}
                      competitors={results.map(r => ({ ...r, status: r.status || 'DISCOVERED' }))}
                      isLoading={discovering}
                    />
                  );
                })()
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <p className="text-gray-500 text-sm">Select a location to view map</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Discovered Competitors ({results.length})</h2>
            </div>
            
            {results.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No results found. Run a discovery search to populate this list.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {results.map((r) => (
                  <li key={r.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{r.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {r.category} &bull; {(r.distance_meters / 1000).toFixed(2)} km
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Source: Open Data ({r.source})</p>
                    </div>
                    <div>
                      {r.status === 'ACTIVE' || r.tracking_status === 'TRACKED' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Tracked
                        </span>
                      ) : (
                        <button
                          onClick={() => handleTrack(r)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none"
                        >
                          Track
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
