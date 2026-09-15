"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/stores/auth-context';
import { getRunsHistory, runRankTracking } from '@/lib/api/rankTracking';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HistoryListPage() {
  const { configId } = useParams();
  const { activeOrganization, hasPermission } = useAuth();
  
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const canRun = hasPermission('ranking.run');

  const fetchData = async () => {
    if (!activeOrganization || !configId) return;
    try {
      setLoading(true);
      const res = await getRunsHistory(activeOrganization.id, configId as string);
      setRuns(res.data);
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
      setRunning(true);
      await runRankTracking(activeOrganization.id, configId as string);
      // Wait a bit and refresh
      setTimeout(fetchData, 2000);
    } catch (e: any) {
      alert(e.message || 'Failed to start run');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href={`/rankings/${configId}`} className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block">
          &larr; Back to Campaign
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ranking History</h1>
            <p className="text-gray-500 mt-1">View past ranking checks and analytics.</p>
          </div>
          {canRun && (
            <Button onClick={handleRunNow} disabled={running} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {running ? 'Starting...' : 'Run Ranking Check'}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading history...</div>
        ) : runs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No ranking runs yet.</p>
            {canRun && (
              <Button onClick={handleRunNow} disabled={running} variant="outline">
                Run First Check
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Checks</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed / Failed</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Position</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local Visibility</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(run.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        run.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 
                        run.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                        run.status === 'QUEUED' || run.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {run.total_jobs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-emerald-600">{run.completed_jobs}</span> / <span className="text-red-500">{run.failed_jobs}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {run.analytics?.averagePosition ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {run.analytics ? `${run.analytics.visibilityScore}%` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/rankings/${configId}/history/${run.id}`} className="text-indigo-600 hover:text-indigo-900">
                        View Details
                      </Link>
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
