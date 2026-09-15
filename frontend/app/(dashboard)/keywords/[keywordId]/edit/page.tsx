"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../../stores/auth-context';
import { getKeyword, updateKeyword, Keyword } from '../../../../../lib/api/keywords';
import { Button } from '../../../../../components/ui/button';

export default function EditKeywordPage() {
  const params = useParams();
  const router = useRouter();
  const { activeOrganization } = useAuth();
  
  const keywordId = params.keywordId as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form State
  const [keywordStr, setKeywordStr] = useState('');
  const [searchEngine, setSearchEngine] = useState('GOOGLE');
  const [countryCode, setCountryCode] = useState('IN');
  const [languageCode, setLanguageCode] = useState('en');
  const [device, setDevice] = useState('DESKTOP');
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED' | 'ARCHIVED'>('ACTIVE');

  useEffect(() => {
    if (!activeOrganization || !keywordId) return;
    const fetchKeyword = async () => {
      try {
        setLoading(true);
        const res = await getKeyword(activeOrganization.id, keywordId);
        const k = res;
        setKeywordStr(k.keyword);
        setSearchEngine(k.search_engine);
        setCountryCode(k.country_code);
        setLanguageCode(k.language_code);
        setDevice(k.device);
        setStatus(k.status);
      } catch (err: any) {
        setError(err.message || 'Failed to load keyword');
      } finally {
        setLoading(false);
      }
    };
    fetchKeyword();
  }, [activeOrganization, keywordId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization || !keywordId) return;
    setError('');
    setSuccess('');
    setSaving(true);
    
    try {
      await updateKeyword(activeOrganization.id, keywordId, {
        keyword: keywordStr,
        searchEngine,
        countryCode,
        languageCode,
        device,
        status
      });
      setSuccess('Keyword updated successfully');
      setTimeout(() => router.push(`/keywords/${keywordId}`), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to update keyword');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/keywords/${keywordId}`} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
            &larr; Back to Keyword Details
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Keyword</h1>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
          {success && <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-100">{success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium text-gray-700">Keyword <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={keywordStr}
                onChange={(e) => setKeywordStr(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

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
            <Link href={`/keywords/${keywordId}`}>
              <Button type="button" variant="outline" disabled={saving}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
