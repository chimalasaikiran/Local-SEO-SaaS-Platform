"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../stores/auth-context';
import { apiClient } from '../../../../lib/api/client';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import map to avoid SSR window issues
const CompetitorMap = dynamic(() => import('../../../../components/competitors/CompetitorMap').then(mod => mod.CompetitorMap), { ssr: false });
import { CompetitorMarker } from '../../../../components/competitors/CompetitorMap';

export default function CompetitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { activeOrganization: currentOrganization } = useAuth();
  
  const competitorId = params.competitorId as string;
  const [competitor, setCompetitor] = useState<any>(null);
  const [businessLat, setBusinessLat] = useState<number>(0);
  const [businessLng, setBusinessLng] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentOrganization || !competitorId) return;
    
    const fetchData = async () => {
      try {
        // Fetch all competitors just to find this one and its business location.
        // In a real app we'd have a specific GET /competitors/:id
        const result = await apiClient.get(`/organizations/${currentOrganization.id}/competitors`);
        const comp = result?.find((c: any) => c.id === competitorId);
        
        if (!comp) throw new Error('Competitor not found');
        setCompetitor(comp);

        // Fetch the location for the center of the map
        const locResult = await apiClient.get(`/organizations/${currentOrganization.id}/businesses/${comp.business_id}/locations`);
        // locResult is already the array because apiClient unpacks data?.data
        const locData = Array.isArray(locResult) ? locResult : (locResult.data || []);
        const loc = locData.find((l: any) => l.id === comp.location_id);
        if (loc) {
          setBusinessLat(parseFloat(loc.latitude));
          setBusinessLng(parseFloat(loc.longitude));
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentOrganization, competitorId]);

  const handleToggleTrack = async () => {
    try {
      const newStatus = competitor.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
      const endpoint = newStatus === 'ACTIVE' ? 'track' : '';
      
      const method = newStatus === 'ACTIVE' ? apiClient.post : apiClient.delete;
      await method(`/organizations/${currentOrganization?.id}/competitors/${competitorId}${endpoint ? `/${endpoint}` : ''}`);
      
      setCompetitor({ ...competitor, status: newStatus });
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading competitor...</div>;
  if (error || !competitor) return <div className="p-8 text-center text-red-500">{error || 'Not found'}</div>;

  const markers: CompetitorMarker[] = [{
    id: competitor.id,
    latitude: parseFloat(competitor.latitude),
    longitude: parseFloat(competitor.longitude),
    name: competitor.name,
    category: competitor.category,
    distanceMeters: competitor.distance_meters,
    status: competitor.status
  }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/competitors" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Competitors
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{competitor.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${competitor.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : (competitor.status === 'DISCOVERED' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800')}`}>
                {competitor.status}
              </span>
              <span className="text-sm text-gray-500">{competitor.category}</span>
            </div>
          </div>
          <div className="flex gap-3">
             <button
               onClick={handleToggleTrack}
               className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm border ${
                 competitor.status === 'ACTIVE' 
                   ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50' 
                   : 'border-transparent text-white bg-emerald-600 hover:bg-emerald-700'
               }`}
             >
               {competitor.status === 'ACTIVE' ? 'Stop Tracking' : 'Track Competitor'}
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="col-span-1 lg:col-span-2 space-y-8">
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <CompetitorMap 
               businessLat={businessLat} 
               businessLng={businessLng} 
               competitors={markers} 
             />
           </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Competitor Details</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Distance from you</dt>
                <dd className="mt-1 text-sm text-gray-900">{(competitor.distance_meters / 1000).toFixed(2)} km</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{competitor.phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="mt-1 text-sm text-emerald-600">
                  {competitor.website_url ? (
                    <a href={competitor.website_url} target="_blank" rel="noopener noreferrer">{competitor.website_url}</a>
                  ) : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Coordinates</dt>
                <dd className="mt-1 text-sm text-gray-900">{competitor.latitude.toFixed(6)}, {competitor.longitude.toFixed(6)}</dd>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <dt className="text-xs font-medium text-gray-500">Data Source</dt>
                <dd className="mt-1 text-xs text-gray-900 flex items-center">
                  <span className="capitalize">{competitor.source}</span>
                </dd>
                <p className="mt-2 text-[10px] text-gray-400">
                  Note: OpenStreetMap competitor data does not indicate Google Search or Maps ranking.
                </p>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
