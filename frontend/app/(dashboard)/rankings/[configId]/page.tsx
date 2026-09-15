"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/stores/auth-context';
import { getRankTrackingConfig, getRankTrackingGrid, getLatestRankings, runRankTracking, getRankTrackingRun } from '@/lib/api/rankTracking';
import { Button } from '@/components/ui/button';
import { PositionMap, GridPoint } from '@/components/rank-tracking/PositionMap';
import Link from 'next/link';
import { listLocations } from '@/lib/api/locations';

export default function CampaignDetailPage() {
  const { configId } = useParams();
  const { activeOrganization } = useAuth();
  
  const [config, setConfig] = useState<any>(null);
  const [grid, setGrid] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [runningStatus, setRunningStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    if (!activeOrganization || !configId) return;
    try {
      setLoading(true);
      const cRes = await getRankTrackingConfig(activeOrganization.id, configId as string);
      setConfig(cRes.data);
      
      const locRes = await listLocations(activeOrganization.id, { limit: 100 });
      const currentLoc = locRes.data.find((l: any) => l.id === cRes.data.location_id);
      setLocation(currentLoc);

      const gRes = await getRankTrackingGrid(activeOrganization.id, configId as string);
      setGrid(gRes.data);

      const rRes = await getLatestRankings(activeOrganization.id, configId as string);
      setRankings(rRes.data.rankings);
      setAnalytics(rRes.data.analytics);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeOrganization, configId]);

  const handleRunNow = async () => {
    if (!activeOrganization || !configId) return;
    try {
      const res = await runRankTracking(activeOrganization.id, configId as string);
      setRunningStatus({ id: res.data.runId, progress: 0, total: res.data.totalJobs });
      pollRun(res.data.runId);
    } catch (e: any) {
      alert(e.message || 'Failed to start run');
    }
  };

  const pollRun = async (runId: string) => {
    if (!activeOrganization) return;
    try {
      const res = await getRankTrackingRun(activeOrganization.id, runId);
      const run = res.data;
      
      setRunningStatus({
        id: run.id,
        progress: run.completed_jobs + run.failed_jobs,
        total: run.total_jobs,
        status: run.status
      });

      if (['COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED'].includes(run.status)) {
        setTimeout(fetchData, 1000); // refresh data
      } else {
        setTimeout(() => pollRun(runId), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading campaign...</div>;
  if (!config) return <div className="p-8 text-center text-red-500">Campaign not found</div>;

  const mapPoints: GridPoint[] = grid.map(g => {
    // Filter rankings for this specific grid point
    const allPointRankings = rankings.filter(r => r.grid_point_id === g.id);
    const validPointRankings = allPointRankings.filter(r => r.position !== null);
    
    let avgPosition = undefined; // Undefined means "Not checked"
    
    if (validPointRankings.length > 0) {
      avgPosition = Math.round(validPointRankings.reduce((sum, r) => sum + r.position, 0) / validPointRankings.length);
    } else if (allPointRankings.length > 0) {
      // It was checked, but no valid positions found -> "Not ranking"
      avgPosition = null;
    }

    return {
      id: g.id,
      latitude: g.latitude,
      longitude: g.longitude,
      rowIndex: g.row_index,
      columnIndex: g.column_index,
      distanceFromCenterMeters: g.distance_from_center_meters,
      position: avgPosition
    };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{config.name}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              config.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {config.status}
            </span>
          </div>
          <p className="text-gray-500">
            {location?.name || 'Unknown Location'} • {config.grid_size}x{config.grid_size} Grid • {config.search_engine} {config.device}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link href={`/rankings/${configId}/settings`}>
            <Button variant="outline">Settings</Button>
          </Link>
          <Button onClick={handleRunNow} disabled={!!runningStatus && !['COMPLETED', 'PARTIAL', 'FAILED'].includes(runningStatus.status)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {runningStatus && !['COMPLETED', 'PARTIAL', 'FAILED'].includes(runningStatus.status) ? 'Running...' : 'Run Check Now'}
          </Button>
        </div>
      </div>

      {runningStatus && !['COMPLETED', 'PARTIAL', 'FAILED'].includes(runningStatus.status) && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex justify-between text-sm text-blue-800 mb-2">
            <span className="font-medium">Ranking check in progress</span>
            <span>{runningStatus.progress} / {runningStatus.total} checks completed ({Math.round(runningStatus.progress/runningStatus.total*100)}%)</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.round(runningStatus.progress/runningStatus.total*100)}%` }}></div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200 mb-6">
        {['overview', 'position_map', 'keywords', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {tab.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Local Visibility</h4>
              <p className="text-3xl font-bold text-gray-900">{analytics?.visibilityScore || 0}%</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Average Position</h4>
              <p className="text-3xl font-bold text-gray-900">{analytics?.averagePosition || '—'}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Top 3 Rankings</h4>
              <p className="text-3xl font-bold text-emerald-600">{rankings.filter(r => r.position && r.position <= 3).length}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Not Ranking</h4>
              <p className="text-3xl font-bold text-red-500">{analytics?.notFoundCount || 0}</p>
            </div>
          </div>
          
          {rankings.length === 0 && (
            <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">Run a ranking check to collect your first ranking results.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'position_map' && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          {location ? (
            <PositionMap 
              businessLat={parseFloat(location.latitude)} 
              businessLng={parseFloat(location.longitude)} 
              points={mapPoints} 
              gridSize={config.grid_size} 
            />
          ) : (
            <div className="p-12 text-center text-gray-500">Location coordinates unavailable</div>
          )}
        </div>
      )}
      
      {activeTab === 'keywords' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-gray-500">
          <p className="mb-4">Keyword detailed view and metrics will appear here.</p>
        </div>
      )}
      
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-gray-500">
          <p className="mb-4">Historical ranking run logs and analytics are available in the History view.</p>
          <Link href={`/rankings/${configId}/history`}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">View Full History</Button>
          </Link>
        </div>
      )}

    </div>
  );
}
