"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../../stores/auth-context';
import { getBusiness, updateBusiness } from '../../../../../lib/api/businesses';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';

export default function EditBusinessPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;
  const { activeOrganization } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    websiteUrl: '',
    phone: '',
    primaryCategory: '',
    description: '',
    status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!activeOrganization || !businessId) return;
      try {
        const data = await getBusiness(activeOrganization.id, businessId);
        setFormData({
          name: data.name,
          websiteUrl: data.website_url || '',
          phone: data.phone || '',
          primaryCategory: data.primary_category || '',
          description: data.description || '',
          status: data.status
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load business');
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [activeOrganization, businessId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization) return;

    try {
      setSaving(true);
      setError('');
      await updateBusiness(activeOrganization.id, businessId, formData);
      router.push(`/businesses/${businessId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update business');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/businesses/${businessId}`} className="text-emerald-600 hover:underline text-sm font-medium">
          ← Back to Business
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Business</h1>
        <p className="text-gray-500 mt-1">Update the profile details for this business.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="primaryCategory">Primary Category</Label>
                <Input
                  id="primaryCategory"
                  name="primaryCategory"
                  value={formData.primaryCategory}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[100px]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => router.push(`/businesses/${businessId}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
