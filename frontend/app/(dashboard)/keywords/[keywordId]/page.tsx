"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../stores/auth-context';
import { getKeyword, listKeywordLocations, addKeywordLocation, removeKeywordLocation, Keyword, KeywordLocation } from '../../../../lib/api/keywords';
import { Button } from '../../../../components/ui/button';

export default function KeywordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { activeOrganization } = useAuth();
  
  const keywordId = params.keywordId as string;
  
  const [keyword, setKeyword] = useState<Keyword | null>(null);
  const [locations, setLocations] = useState<KeywordLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocLat, setNewLocLat] = useState('');
  const [newLocLng, setNewLocLng] = useState('');
  const [newLocRadius, setNewLocRadius] = useState('');
  const [newLocLabel, setNewLocLabel] = useState('');
  const [addingLoc, setAddingLoc] = useState(false);

  const fetchKeywordData = async () => {
    if (!activeOrganization || !keywordId) return;
    try {
      setLoading(true);
      const [kwRes, locRes] = await Promise.all([
        getKeyword(activeOrganization.id, keywordId),
        listKeywordLocations(activeOrganization.id, keywordId)
      ]);
      setKeyword(kwRes);
      setLocations(locRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load keyword details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywordData();
  }, [activeOrganization, keywordId]);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization || !keywordId) return;
    try {
      setAddingLoc(true);
      await addKeywordLocation(activeOrganization.id, keywordId, {
        latitude: parseFloat(newLocLat),
        longitude: parseFloat(newLocLng),
        radiusMeters: newLocRadius ? parseInt(newLocRadius, 10) : null,
        label: newLocLabel || null
      });
      setShowAddLocation(false);
      setNewLocLat('');
      setNewLocLng('');
      setNewLocRadius('');
      setNewLocLabel('');
      fetchKeywordData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || err.message || 'Failed to add search location');
    } finally {
      setAddingLoc(false);
    }
  };

  const handleRemoveLocation = async (locId: string) => {
    if (!activeOrganization || !keywordId) return;
    if (!confirm('Remove this search location?')) return;
    try {
      await removeKeywordLocation(activeOrganization.id, keywordId, locId);
      fetchKeywordData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove search location');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error || !keyword) return <div className="p-8 text-center text-red-500">{error || 'Keyword not found'}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/keywords" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
          &larr; Back to Keywords
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{keyword.keyword}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              keyword.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 
              keyword.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {keyword.status}
            </span>
          </div>
        </div>
        <Link href={`/keywords/${keyword.id}/edit`}>
          <Button variant="outline">Edit Keyword</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ranking Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Ranking</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Position</p>
              <p className="font-medium text-gray-900">Not tracked yet</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Previous Position</p>
              <p className="font-medium text-gray-900">—</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ranking Change</p>
              <p className="font-medium text-gray-900">—</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Visibility</p>
              <p className="font-medium text-gray-900">Not tracked yet</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
              No ranking data has been collected yet.
            </p>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Tracking Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Search Engine</p>
              <p className="font-medium text-gray-900">{keyword.search_engine}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Device</p>
              <p className="font-medium text-gray-900">{keyword.device}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Country</p>
              <p className="font-medium text-gray-900 uppercase">{keyword.country_code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Language</p>
              <p className="font-medium text-gray-900">{keyword.language_code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Locations Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Search Locations (Geo-Grid)</h2>
            <p className="text-sm text-gray-500 mt-1">Specific geographic points to track this keyword from.</p>
          </div>
          <Button onClick={() => setShowAddLocation(!showAddLocation)} variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
            {showAddLocation ? 'Cancel' : 'Add Search Location'}
          </Button>
        </div>

        {showAddLocation && (
          <div className="p-6 bg-emerald-50/30 border-b border-gray-100">
            <form onSubmit={handleAddLocation} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Label (Optional)</label>
                <input type="text" placeholder="e.g. Downtown" className="w-full border border-gray-300 rounded text-sm px-3 py-2" value={newLocLabel} onChange={e => setNewLocLabel(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Latitude *</label>
                <input type="number" step="any" required className="w-full border border-gray-300 rounded text-sm px-3 py-2" value={newLocLat} onChange={e => setNewLocLat(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Longitude *</label>
                <input type="number" step="any" required className="w-full border border-gray-300 rounded text-sm px-3 py-2" value={newLocLng} onChange={e => setNewLocLng(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Radius (m)</label>
                <input type="number" placeholder="Optional" className="w-full border border-gray-300 rounded text-sm px-3 py-2" value={newLocRadius} onChange={e => setNewLocRadius(e.target.value)} />
              </div>
              <div>
                <Button type="submit" disabled={addingLoc} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Save</Button>
              </div>
            </form>
          </div>
        )}

        {locations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No search locations configured. Add one to track rankings from specific coordinates.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Label</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Coordinates</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Radius</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loc.label || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{loc.latitude}, {loc.longitude}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{loc.radius_meters ? `${loc.radius_meters}m` : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button onClick={() => handleRemoveLocation(loc.id)} className="text-red-600 hover:text-red-900 transition-colors">
                        Remove
                      </button>
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
