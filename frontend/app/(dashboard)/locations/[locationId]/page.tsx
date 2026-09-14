"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../stores/auth-context';
import { getLocation, Location } from '../../../../lib/api/locations';
import { Button } from '../../../../components/ui/button';

export default function LocationDetailPage() {
  const params = useParams();
  const locationId = params.locationId as string;
  const { activeOrganization } = useAuth();
  
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeOrganization || !locationId) return;
    setLoading(true);
    getLocation(activeOrganization.id, locationId)
      .then(data => setLocation(data))
      .catch(err => setError(err.message || 'Failed to load location'))
      .finally(() => setLoading(false));
  }, [activeOrganization, locationId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading location details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!location) return <div className="p-8 text-center text-gray-500">Location not found.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-4">
        <Link href={`/businesses/${location.business_id}`} className="text-emerald-600 hover:underline text-sm font-medium">
          ← Back to Business
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{location.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                location.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {location.status}
              </span>
            </div>
          </div>
          <Link href={`/locations/${location.id}/edit`}>
            <Button variant="outline" className="text-gray-600">Edit Location</Button>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Address</h3>
            <p className="mt-1 text-sm text-gray-900">
              {location.address_line_1}<br/>
              {location.address_line_2 && <>{location.address_line_2}<br/></>}
              {location.city}, {location.state} {location.postal_code}<br/>
              {location.country}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact</h3>
            <p className="mt-1 text-sm text-gray-900">
              Phone: {location.phone || 'N/A'}<br/>
              Website: {location.website_url ? (
                <a href={location.website_url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                  {location.website_url}
                </a>
              ) : 'N/A'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Geographic</h3>
            <p className="mt-1 text-sm text-gray-900">
              Lat: {location.latitude || 'N/A'}<br/>
              Lng: {location.longitude || 'N/A'}<br/>
              Timezone: {location.timezone || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* SEO Placeholder Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
            <span className="text-blue-500 font-bold text-xl">G</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Google Business Profile</h3>
          <p className="text-sm text-gray-500 mt-2 mb-4">Connect this location to Google to manage reviews, posts, and details.</p>
          <Button variant="outline" disabled className="opacity-50">Coming Soon</Button>
        </div>

        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Local Rankings</h3>
          <p className="text-sm text-gray-500 mt-2 mb-4">Track keyword rankings in the geographic grid around this location.</p>
          <Button variant="outline" disabled className="opacity-50">Coming Soon</Button>
        </div>
        
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Reviews & Reputation</h3>
          <p className="text-sm text-gray-500 mt-2 mb-4">Monitor and respond to customer reviews from multiple platforms.</p>
          <Button variant="outline" disabled className="opacity-50">Coming Soon</Button>
        </div>
        
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">SEO Audit</h3>
          <p className="text-sm text-gray-500 mt-2 mb-4">Run comprehensive audits for on-page, off-page, and technical SEO.</p>
          <Button variant="outline" disabled className="opacity-50">Coming Soon</Button>
        </div>
      </div>
    </div>
  );
}
