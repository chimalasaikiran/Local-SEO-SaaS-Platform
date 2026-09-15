"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/stores/auth-context';
import { getRankTrackingConfig, updateRankTrackingConfig, deleteRankTrackingConfig, regenerateRankTrackingGrid } from '@/lib/api/rankTracking';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SettingsPage() {
  const { configId } = useParams();
  const router = useRouter();
  const { activeOrganization, hasPermission } = useAuth();
  
  const [config, setConfig] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canUpdate = hasPermission('ranking.update');
  const canDelete = hasPermission('ranking.delete');

  useEffect(() => {
    const fetchData = async () => {
      if (!activeOrganization || !configId) return;
      try {
        setLoading(true);
        const res = await getRankTrackingConfig(activeOrganization.id, configId as string);
        setConfig(res.data);
        setFormData({
          name: res.data.name,
          status: res.data.status,
          frequency: res.data.frequency
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeOrganization, configId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!activeOrganization || !configId || !canUpdate) return;
    try {
      setSaving(true);
      await updateRankTrackingConfig(activeOrganization.id, configId as string, formData);
      alert('Settings saved successfully.');
      router.push(`/rankings/${configId}`);
    } catch (e: any) {
      alert(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!activeOrganization || !configId || !canDelete) return;
    if (confirm('Are you sure you want to archive this campaign?')) {
      try {
        setSaving(true);
        await deleteRankTrackingConfig(activeOrganization.id, configId as string);
        router.push('/rankings');
      } catch (e: any) {
        alert(e.message || 'Failed to archive campaign');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleRegenerateGrid = async () => {
    if (!activeOrganization || !configId || !canUpdate) return;
    if (confirm('Regenerating the grid will reset all grid points. Continue?')) {
      try {
        setSaving(true);
        await regenerateRankTrackingGrid(activeOrganization.id, configId as string);
        alert('Grid regenerated successfully.');
      } catch (e: any) {
        alert(e.message || 'Failed to regenerate grid');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  if (!config) return <div className="p-8 text-center text-red-500">Campaign not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href={`/rankings/${configId}`} className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block">
          &larr; Back to Campaign
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Campaign Settings</h1>
        <p className="text-gray-500 mt-1">Manage configuration for {config.name}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name || ''} 
              onChange={handleChange}
              disabled={!canUpdate}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:bg-gray-100" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                name="status" 
                value={formData.status || ''} 
                onChange={handleChange}
                disabled={!canUpdate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100"
              >
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Frequency</label>
              <select 
                name="frequency" 
                value={formData.frequency || ''} 
                onChange={handleChange}
                disabled={!canUpdate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100"
              >
                <option value="MANUAL">Manual</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>
          
          <hr />
          
          <h3 className="text-lg font-medium text-gray-900">Immutable Settings</h3>
          <p className="text-sm text-gray-500 mb-4">These properties cannot be changed after creation.</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div><span className="font-medium">Search Engine:</span> {config.search_engine}</div>
            <div><span className="font-medium">Device:</span> {config.device}</div>
            <div><span className="font-medium">Country / Language:</span> {config.country_code} / {config.language_code}</div>
            <div><span className="font-medium">Max Rank:</span> {config.max_rank}</div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Grid Configuration</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
              <div><span className="font-medium">Grid Size:</span> {config.grid_size}x{config.grid_size}</div>
              <div><span className="font-medium">Radius:</span> {config.grid_radius_meters}m</div>
            </div>
            {canUpdate && (
              <Button onClick={handleRegenerateGrid} disabled={saving} variant="outline" size="sm">
                Regenerate Grid Points
              </Button>
            )}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          {canDelete ? (
            <Button onClick={handleArchive} disabled={saving} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              Archive Campaign
            </Button>
          ) : <div></div>}
          
          <div className="space-x-3">
            <Link href={`/rankings/${configId}`}>
              <Button variant="ghost">Cancel</Button>
            </Link>
            {canUpdate && (
              <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
