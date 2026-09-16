"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/stores/auth-context';
import { apiClient } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuditDetailPage() {
  const params = useParams();
  const { activeOrganization: currentOrganization } = useAuth();
  
  const [audit, setAudit] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization && params.id) {
      fetchAuditDetails();
    }
  }, [currentOrganization, params.id]);

  const fetchAuditDetails = async () => {
    try {
      setIsLoading(true);
      const [auditData, issuesData, pagesData] = await Promise.all([
        apiClient.get(`/organizations/${currentOrganization?.id}/audits/${params.id}`),
        apiClient.get(`/organizations/${currentOrganization?.id}/audits/${params.id}/issues`),
        apiClient.get(`/organizations/${currentOrganization?.id}/audits/${params.id}/pages`)
      ]);

      setAudit(auditData);
      setIssues(issuesData);
      setPages(pagesData);
      
    } catch (error) {
      console.error('Failed to load details', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading audit data...</div>;
  if (!audit) return <div>Audit not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{audit.target_url}</h1>
          <p className="text-muted-foreground mt-1">
            Ran on {new Date(audit.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{audit.type}</Badge>
          <Badge>{audit.status}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technical SEO Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{audit.score !== null ? audit.score : 'N/A'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{audit.critical_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages Crawled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{audit.pages_crawled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{audit.issues_count}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issues" className="w-full">
        <TabsList>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="pages">Crawled Pages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="issues" className="space-y-4">
          {issues.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border rounded-md">No issues found. Great job!</div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-4">Severity</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Issue</th>
                    <th className="p-4">Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue.id} className="border-t">
                      <td className="p-4">
                        <Badge variant={issue.severity === 'CRITICAL' || issue.severity === 'HIGH' ? 'destructive' : 'secondary'}>
                          {issue.severity}
                        </Badge>
                      </td>
                      <td className="p-4">{issue.category}</td>
                      <td className="p-4 font-medium">{issue.title}</td>
                      <td className="p-4 text-muted-foreground">{issue.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pages" className="space-y-4">
          <div className="rounded-md border">
            <table className="w-full text-sm text-left overflow-hidden">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4">URL</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Load Time</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="border-t">
                    <td className="p-4 max-w-xs truncate" title={page.url}>{page.url}</td>
                    <td className="p-4">{page.status_code}</td>
                    <td className="p-4 max-w-xs truncate">{page.title || '-'}</td>
                    <td className="p-4">{page.load_time_ms ? `${page.load_time_ms}ms` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
