"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../stores/auth-context';
import { apiClient } from '../../../../lib/api/client';

export default function DiscoverCompetitorsPage() {
  const router = useRouter();
  const { activeOrganization: currentOrganization } = useAuth();
  
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [category, setCategory] = useState<string>('dentist');
  const [radius, setRadius] = useState<number>(5000);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentOrganization) return;
    fetchBusinesses();
  }, [currentOrganization]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchLocations(selectedBusiness);
    } else {
      setLocations([]);
      setSelectedLocation('');
    }
  }, [selectedBusiness]);

  const fetchBusinesses = async () => {
    try {
      const result = await apiClient.get(`/organizations/${currentOrganization?.id}/businesses`);
      const businessesArray = result.data || [];
      setBusinesses(businessesArray);
      if (businessesArray.length > 0) setSelectedBusiness(businessesArray[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLocations = async (businessId: string) => {
    try {
      const result = await apiClient.get(`/organizations/${currentOrganization?.id}/businesses/${businessId}/locations`);
      const locationsArray = result.data || [];
      setLocations(locationsArray);
      if (locationsArray.length > 0) setSelectedLocation(locationsArray[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.post(`/organizations/${currentOrganization?.id}/competitors/discover`, {
        businessId: selectedBusiness,
        locationId: selectedLocation,
        category,
        radiusMeters: radius,
        limit: 100
      });
      
      // Redirect to list view
      router.push('/competitors');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Discover Competitors</h1>
        <p className="text-sm text-gray-500 mt-1">Find local businesses around your location using OpenStreetMap data.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleDiscover} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Business</label>
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
                disabled={!selectedBusiness || locations.length === 0}
              >
                <option value="">Select a location</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name} - {l.address_line_1}</option>
                ))}
              </select>
              {locations.length === 0 && selectedBusiness && (
                <p className="mt-1 text-sm text-red-500">No active locations found for this business.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Search Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
              >
                <option value="dentist">Dentist</option>
                <option value="doctor">Doctor</option>
                <option value="restaurant">Restaurant</option>
                <option value="hotel">Hotel</option>
                <option value="lawyer">Lawyer</option>
                <option value="gym">Gym / Fitness Center</option>
                <option value="salon">Salon / Hairdresser</option>
                <option value="cafe">Cafe</option>
                <option value="plumber">Plumber</option>
                <option value="electrician">Electrician</option>
                <option value="pharmacy">Pharmacy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Radius</label>
              <div className="mt-2 space-y-4">
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 km</span>
                  <span className="font-medium text-emerald-600 text-sm">{(radius / 1000).toFixed(1)} km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedLocation}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none disabled:opacity-50"
              >
                {loading ? 'Discovering...' : 'Discover Competitors'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
