"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../stores/auth-context';
import { getBusiness, Business } from '../../../../lib/api/businesses';
import { listLocations, archiveLocation, Location } from '../../../../lib/api/locations';
import { Button } from '../../../../components/ui/button';

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;
  const { activeOrganization } = useAuth();
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!activeOrganization || !businessId) return;
    try {
      setLoading(true);
      const bData = await getBusiness(activeOrganization.id, businessId);
      setBusiness(bData);
      
      const lData = await listLocations(activeOrganization.id, { businessId });
      setLocations(lData.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeOrganization, businessId]);

  const handleArchiveLocation = async (locId: string) => {
    if (!activeOrganization) return;
    if (!confirm('Are you sure you want to archive this location?')) return;
    try {
      await archiveLocation(activeOrganization.id, locId);
      fetchData(); // refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to archive location');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading business details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!business) return <div className="p-8 text-center text-gray-500">Business not found.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-4">
        <Link href="/businesses" className="text-emerald-600 hover:underline text-sm font-medium">
          ← Back to Businesses
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                business.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {business.status}
              </span>
              {business.primary_category && (
                <span className="text-sm text-gray-500">{business.primary_category}</span>
              )}
            </div>
          </div>
          <Link href={`/businesses/${business.id}/edit`}>
            <Button variant="outline" className="text-gray-600">Edit Business</Button>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Website</h3>
            <p className="mt-1 text-sm text-gray-900">
              {business.website_url ? (
                <a href={business.website_url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                  {business.website_url}
                </a>
              ) : 'Not provided'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
            <p className="mt-1 text-sm text-gray-900">{business.phone || 'Not provided'}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{business.description || 'No description provided.'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created</h3>
            <p className="mt-1 text-sm text-gray-900">{new Date(business.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <p className="mt-1 text-sm text-gray-900">{new Date(business.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Locations</h2>
          <Link href={`/businesses/${business.id}/locations/new`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
              <span className="mr-2">+</span> Add Location
            </Button>
          </Link>
        </div>

        {locations.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-base font-medium text-gray-900 mb-1">No locations found</h3>
            <p className="text-sm text-gray-500 mb-4">Add a location to start managing its local SEO presence.</p>
            <Link href={`/businesses/${business.id}/locations/new`}>
              <Button variant="outline">Add Location</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/locations/${loc.id}`} className="font-medium text-emerald-600 hover:underline">
                        {loc.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{loc.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{loc.state || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        loc.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {loc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link href={`/locations/${loc.id}`} className="text-gray-600 hover:text-gray-900">
                          View
                        </Link>
                        <Link href={`/locations/${loc.id}/edit`} className="text-blue-600 hover:text-blue-900">
                          Edit
                        </Link>
                        <button onClick={() => handleArchiveLocation(loc.id)} className="text-red-600 hover:text-red-900">
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
