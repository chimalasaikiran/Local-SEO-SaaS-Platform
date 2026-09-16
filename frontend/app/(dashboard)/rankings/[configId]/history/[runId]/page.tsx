"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/stores/auth-context';
import { getRankTrackingRun, getRunRankings, getRankTrackingConfig, getRankTrackingGrid } from '@/lib/api/rankTracking';
import { listLocations } from '@/lib/api/locations';
import { PositionMap, GridPoint } from '@/components/rank-tracking/PositionMap';
import Link from 'next/link';

export default function RunDetailPage() {
  const { configId, runId } = useParams();
  const { activeOrganization } = useAuth();
  
  const [run, setRun] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [grid, setGrid] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!activeOrganization || !configId || !runId) return;
      try {
        setLoading(true);
        
        const [runRes, rankRes, configRes, gridRes] = await Promise.all([
          getRankTrackingRun(activeOrganization.id, runId as string),
          getRunRankings(activeOrganization.id, runId as string),
          getRankTrackingConfig(activeOrganization.id, configId as string),
          getRankTrackingGrid(activeOrganization.id, configId as string)
        ]);
        
        setRun(runRes.data);
        setRankings(rankRes.data.rankings);
        setAnalytics(rankRes.data.analytics);
        setConfig(configRes.data);
        setGrid(gridRes.data);

        const locRes = await listLocations(activeOrganization.id, { limit: 100 });
        const currentLoc = locRes.data.find((l: any) => l.id === configRes.data.location_id);
        setLocation(currentLoc);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeOrganization, configId, runId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading run details...</div>;
  if (!run || !config) return <div className="p-8 text-center text-red-500">Run or Config not found</div>;

  const noProviderData = rankings.length === 0 && run.status === 'FAILED';

  const mapPoints: GridPoint[] = grid.map(g => {
    const allPointRankings = rankings.filter(r => r.grid_point_id === g.id);
    const validPointRankings = allPointRankings.filter(r => r.position !== null);
    
    let avgPosition = undefined;
    if (validPointRankings.length > 0) {
      avgPosition = Math.round(validPointRankings.reduce((sum, r) => sum + r.position, 0) / validPointRankings.length);
    } else if (allPointRankings.length > 0) {
      avgPosition = null;
    }

    const sampleRanking = allPointRankings[0];

    return {
      id: g.id,
      latitude: g.latitude,
      longitude: g.longitude,
      rowIndex: g.row_index,
      columnIndex: g.column_index,
      distanceFromCenterMeters: g.distance_from_center_meters,
      position: avgPosition,
      keyword: sampleRanking?.keyword || config?.keyword || config?.search_query,
      timestamp: sampleRanking?.created_at || sampleRanking?.checked_at || sampleRanking?.timestamp || run.created_at
    };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href={`/rankings/${configId}/history`} className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block">
          &larr; Back to History
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Run Details</h1>
        <div className="flex space-x-4 text-sm text-gray-500">
          <p>Run ID: <span className="font-mono bg-gray-100 px-1 rounded">{run.id}</span></p>
          <p>Date: {new Date(run.created_at).toLocaleString()}</p>
          <p>Status: <span className="font-semibold">{run.status}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Job Statistics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total Jobs</span><span className="font-medium text-gray-900">{run.total_jobs}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Completed</span><span className="font-medium text-emerald-600">{run.completed_jobs}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Failed</span><span className="font-medium text-red-500">{run.failed_jobs}</span></div>
          </div>
        </div>

        {analytics && !noProviderData && (
          <>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Ranking Analytics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Average Position</span><span className="font-medium text-gray-900">{analytics.averagePosition ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Best Position</span><span className="font-medium text-emerald-600">{analytics.bestPosition ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Worst Position</span><span className="font-medium text-red-500">{analytics.worstPosition ?? '—'}</span></div>
                <div className="flex justify-between mt-2 pt-2 border-t"><span className="text-gray-500">Local Visibility</span><span className="font-bold text-gray-900">{analytics.visibilityScore}%</span></div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Ranking Distribution</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Top 3 (1-3)</span><span className="font-medium text-emerald-600">{rankings.filter(r => r.position >= 1 && r.position <= 3).length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Page 1 (4-10)</span><span className="font-medium text-blue-600">{rankings.filter(r => r.position >= 4 && r.position <= 10).length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Not Ranking</span><span className="font-medium text-red-500">{analytics.notFoundCount}</span></div>
              </div>
            </div>
          </>
        )}
      </div>

      {noProviderData && (
        <div className="p-8 mb-8 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Provider Not Configured</h3>
          <p className="text-yellow-700">No ranking data was collected because a ranking provider was not configured.</p>
        </div>
      )}

      {location && !noProviderData && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4 ml-2">Position Map</h3>
          <PositionMap 
            businessLat={parseFloat(location.latitude)} 
            businessLng={parseFloat(location.longitude)} 
            points={mapPoints} 
            gridSize={config.grid_size} 
            hasRankingData={rankings.length > 0}
            isLoading={false}
          />
        </div>
      )}

    </div>
  );
}
