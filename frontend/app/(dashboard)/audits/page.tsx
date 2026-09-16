"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/stores/auth-context';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Audit {
  id: string;
  target_url: string;
  type: string;
  status: string;
  score: number | null;
  issues_count: number;
  critical_count: number;
  created_at: string;
}

export default function AuditsDashboard() {
  const { activeOrganization: currentOrganization } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization) {
      fetchAudits();
    }
  }, [currentOrganization]);

  const fetchAudits = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get(`/organizations/${currentOrganization?.id}/audits`);
      setAudits(data);
    } catch (error) {
      console.error('Failed to fetch audits', error);
    } finally {
      setIsLoading(false);
    }
  };

  const latestAudit = audits[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">SEO Audits</h1>
        <Link href="/audits/new">
          <Button>New Audit</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestAudit?.score !== null ? latestAudit?.score : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Technical SEO Audit Score v1</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {latestAudit?.critical_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">in latest audit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestAudit?.issues_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total unresolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages Crawled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
               {latestAudit?.status === 'COMPLETED' ? 'Done' : latestAudit?.status || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Status</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Audit History</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : audits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <p>No audits yet</p>
            <Link href="/audits/new" className="mt-4">
              <Button variant="outline">Run your first audit</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 font-medium">Target URL</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Score</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((audit) => (
                <tr key={audit.id} className="border-t hover:bg-muted/50">
                  <td className="p-4 font-medium">{audit.target_url}</td>
                  <td className="p-4">{new Date(audit.created_at).toLocaleDateString()}</td>
                  <td className="p-4"><Badge variant="outline">{audit.type}</Badge></td>
                  <td className="p-4">
                    <Badge variant={
                      audit.status === 'COMPLETED' ? 'default' : 
                      audit.status === 'FAILED' ? 'destructive' : 'secondary'
                    }>
                      {audit.status}
                    </Badge>
                  </td>
                  <td className="p-4">{audit.score !== null ? audit.score : '...'}</td>
                  <td className="p-4">
                    <Link href={`/audits/${audit.id}`}>
                      <Button variant="link" size="sm">View Details</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
