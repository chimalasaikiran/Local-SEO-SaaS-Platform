"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../stores/auth-context';
import { listBusinesses, Business } from '../../../../lib/api/businesses';
import { listLocations, Location } from '../../../../lib/api/locations';
import { createKeyword, bulkCreateKeywords } from '../../../../lib/api/keywords';
import { Button } from '../../../../components/ui/button';

export default function NewKeywordPage() {
  const router = useRouter();
  const { activeOrganization } = useAuth();
  
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  
  // Form State
  const [businessId, setBusinessId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [bulkKeywords, setBulkKeywords] = useState('');
  const [searchEngine, setSearchEngine] = useState('GOOGLE');
  const [countryCode, setCountryCode] = useState('IN');
  const [languageCode, setLanguageCode] = useState('en');
  const [device, setDevice] = useState('DESKTOP');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!activeOrganization) return;
    const fetchBusinesses = async () => {
      try {
        const res = await listBusinesses(activeOrganization.id, { limit: 100 });
        setBusinesses(res.data);
      } catch (e) {
        console.error('Failed to load businesses', e);
      }
    };
    fetchBusinesses();
  }, [activeOrganization]);

  useEffect(() => {
    if (!activeOrganization || !businessId) {
      setLocations([]);
      setLocationId('');
      return;
    }
    const fetchLocations = async () => {
      try {
        const res = await listLocations(activeOrganization.id, { businessId, limit: 100 });
        setLocations(res.data);
      } catch (e) {
        console.error('Failed to load locations', e);
      }
    };
    fetchLocations();
  }, [activeOrganization, businessId]);

  const parsedBulkCount = bulkKeywords.split('\n').map(k => k.trim()).filter(k => k.length > 0).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization) return;
    setError('');
    setSuccess('');
    
    if (!businessId || !locationId) {
      setError('Business and Location are required');
      return;
    }
    
    setLoading(true);
    try {
      const payloadBase = {
        businessId,
        locationId,
        searchEngine,
        countryCode,
        languageCode,
        device
      };

      if (mode === 'single') {
        if (!keyword.trim()) throw new Error('Keyword is required');
        await createKeyword(activeOrganization.id, { ...payloadBase, keyword });
        router.push('/keywords');
      } else {
        const keywords = bulkKeywords.split('\n').map(k => k.trim()).filter(k => k.length > 0);
        if (keywords.length === 0) throw new Error('At least one keyword is required');
        
        const res = await bulkCreateKeywords(activeOrganization.id, { ...payloadBase, keywords });
        const { created, skipped, invalid } = res;
        setSuccess(`Created: ${created}, Skipped (duplicates): ${skipped}, Invalid: ${invalid}`);
        if (created > 0) {
          setTimeout(() => router.push('/keywords'), 2000);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to add keyword(s)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/keywords" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
            &larr; Back to Keywords
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Keywords</h1>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 flex p-1 bg-gray-50/50">
          <button 
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-colors ${mode === 'single' ? 'bg-white shadow-sm border border-gray-200 text-emerald-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}`}
            onClick={() => setMode('single')}
            type="button"
          >
            Single Keyword
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-colors ${mode === 'bulk' ? 'bg-white shadow-sm border border-gray-200 text-emerald-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}`}
            onClick={() => setMode('bulk')}
            type="button"
          >
            Bulk Import
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
          {success && <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-100">{success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Business <span className="text-red-500">*</span></label>
              <select
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
              >
                <option value="" disabled>Select a business</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Location <span className="text-red-500">*</span></label>
              <select
                required
                disabled={!businessId}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white disabled:bg-gray-50"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                <option value="" disabled>Select a location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} - {l.city}</option>
                ))}
              </select>
            </div>

            {mode === 'single' ? (
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-700">Keyword <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. dentist near me"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            ) : (
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-700 flex justify-between">
                  <span>Keywords <span className="text-red-500">*</span></span>
                  <span className="text-xs text-emerald-600 font-semibold">{parsedBulkCount} keywords detected</span>
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Paste keywords, one per line.&#10;dentist&#10;dental clinic&#10;root canal"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={bulkKeywords}
                  onChange={(e) => setBulkKeywords(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Search Engine</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                value={searchEngine}
                onChange={(e) => setSearchEngine(e.target.value)}
              >
                <option value="GOOGLE">Google</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Device</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
              >
                <option value="DESKTOP">Desktop</option>
                <option value="MOBILE">Mobile</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Country Code</label>
              <input
                type="text"
                required
                maxLength={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 uppercase"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Language Code</label>
              <input
                type="text"
                required
                maxLength={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
            <Link href="/keywords">
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? 'Saving...' : 'Add Keywords'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
