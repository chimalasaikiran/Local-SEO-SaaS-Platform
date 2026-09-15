"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../stores/auth-context';
import { listBusinesses, Business } from '../../../../lib/api/businesses';
import { listLocations, Location } from '../../../../lib/api/locations';
import { listKeywords, Keyword } from '../../../../lib/api/keywords';
import { createRankTrackingConfig, addConfigKeyword, regenerateRankTrackingGrid } from '../../../../lib/api/rankTracking';
import { Button } from '../../../../components/ui/button';

export default function NewRankingCampaignPage() {
  const router = useRouter();
  const { activeOrganization } = useAuth();
  
  const [step, setStep] = useState(1);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [availableKeywords, setAvailableKeywords] = useState<Keyword[]>([]);
  
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  
  const [config, setConfig] = useState({
    name: '',
    searchEngine: 'GOOGLE',
    countryCode: 'IN',
    languageCode: 'en',
    device: 'DESKTOP',
    gridSize: 7,
    gridRadiusMeters: 5000,
    maxRank: 100,
    frequency: 'MANUAL'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeOrganization) {
      listBusinesses(activeOrganization.id, { limit: 100 }).then(res => setBusinesses(res.data));
    }
  }, [activeOrganization]);

  useEffect(() => {
    if (activeOrganization && selectedBusiness) {
      listLocations(activeOrganization.id, { businessId: selectedBusiness, limit: 100 }).then(res => setLocations(res.data));
    } else {
      setLocations([]);
    }
  }, [activeOrganization, selectedBusiness]);

  useEffect(() => {
    if (activeOrganization && selectedLocation) {
      listKeywords(activeOrganization.id, { locationId: selectedLocation, limit: 500 }).then(res => setAvailableKeywords(res.data));
    } else {
      setAvailableKeywords([]);
    }
  }, [activeOrganization, selectedLocation]);

  const toggleKeyword = (id: string) => {
    setSelectedKeywords(prev => 
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    );
  };

  const selectAllKeywords = () => {
    setSelectedKeywords(availableKeywords.map(k => k.id));
  };

  const handleCreate = async () => {
    if (!activeOrganization) return;
    try {
      setIsSubmitting(true);
      setError('');
      
      // 1. Create config
      const res = await createRankTrackingConfig(activeOrganization.id, {
        businessId: selectedBusiness,
        locationId: selectedLocation,
        ...config
      });
      const configId = res.data.id;

      // 2. Add keywords
      for (const kwId of selectedKeywords) {
        await addConfigKeyword(activeOrganization.id, configId, kwId);
      }

      // 3. Generate Grid
      await regenerateRankTrackingGrid(activeOrganization.id, configId);

      // Redirect to detail page
      router.push(`/rankings/${configId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Create Ranking Campaign</h1>
      
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {step === 1 && (
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-6">Step 1: Select Business & Location</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input 
                  type="text" 
                  value={config.name} 
                  onChange={e => setConfig({...config, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. Hyderabad Main Clinic Rankings"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business</label>
                <select 
                  value={selectedBusiness} 
                  onChange={e => setSelectedBusiness(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select a business</option>
                  {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select 
                  value={selectedLocation} 
                  onChange={e => setSelectedLocation(e.target.value)}
                  disabled={!selectedBusiness}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                >
                  <option value="">Select a location</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!config.name || !selectedBusiness || !selectedLocation}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Next Step
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-6">Step 2: Select Keywords</h2>
            
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">Selected {selectedKeywords.length} of {availableKeywords.length} keywords</p>
              <button onClick={selectAllKeywords} className="text-sm text-emerald-600 font-medium">Select All</button>
            </div>

            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100">
              {availableKeywords.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No keywords found for this location. Add some first.</div>
              ) : (
                availableKeywords.map(kw => (
                  <div key={kw.id} className="p-3 flex items-center hover:bg-gray-50 cursor-pointer" onClick={() => toggleKeyword(kw.id)}>
                    <input 
                      type="checkbox" 
                      checked={selectedKeywords.includes(kw.id)}
                      onChange={() => {}}
                      className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mr-3"
                    />
                    <span className="text-gray-900 font-medium">{kw.keyword}</span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={selectedKeywords.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Next Step
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-6">Step 3: Ranking Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Engine</label>
                <select 
                  value={config.searchEngine} 
                  onChange={e => setConfig({...config, searchEngine: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                >
                  <option value="GOOGLE">Google Maps</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
                <select 
                  value={config.device} 
                  onChange={e => setConfig({...config, device: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                >
                  <option value="DESKTOP">Desktop</option>
                  <option value="MOBILE">Mobile</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grid Size</label>
                <select 
                  value={config.gridSize} 
                  onChange={e => setConfig({...config, gridSize: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                >
                  <option value={3}>3x3 (9 points)</option>
                  <option value={5}>5x5 (25 points)</option>
                  <option value={7}>7x7 (49 points)</option>
                  <option value={9}>9x9 (81 points)</option>
                  <option value={11}>11x11 (121 points)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Radius (meters)</label>
                <select 
                  value={config.gridRadiusMeters} 
                  onChange={e => setConfig({...config, gridRadiusMeters: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                >
                  <option value={1000}>1 km</option>
                  <option value={2000}>2 km</option>
                  <option value={5000}>5 km</option>
                  <option value={10000}>10 km</option>
                </select>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Estimated Checks</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This campaign will perform <strong>{selectedKeywords.length} keywords &times; {config.gridSize * config.gridSize} points = {selectedKeywords.length * (config.gridSize * config.gridSize)}</strong> ranking checks per run.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button 
                onClick={handleCreate} 
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
