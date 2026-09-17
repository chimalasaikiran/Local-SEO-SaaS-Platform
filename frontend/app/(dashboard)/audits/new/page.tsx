"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/auth-context';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewAuditWizard() {
  const router = useRouter();
  const { activeOrganization: currentOrganization } = useAuth();
  
  const [businessId, setBusinessId] = useState('');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const [auditType, setAuditType] = useState('FULL_AUDIT');
  const [maxPages, setMaxPages] = useState(100);
  const [crawlDepth, setCrawlDepth] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentOrganization) {
      apiClient.get(`/organizations/${currentOrganization.id}/businesses`)
        .then(response => {
          const fetchedBusinesses = response?.data || [];
          setBusinesses(fetchedBusinesses);
          if (fetchedBusinesses.length > 0) setBusinessId(fetchedBusinesses[0].id);
          setIsLoadingBusinesses(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingBusinesses(false);
        });
    }
  }, [currentOrganization]);

  const handleStartAudit = async () => {
    if (!currentOrganization) return;
    setIsSubmitting(true);
    setError('');

    try {
      if (!businessId) {
        throw new Error("You must select a business first");
      }
      const bId = businessId;

      await apiClient.post(`/organizations/${currentOrganization.id}/audits`, {
        business_id: bId,
        type: auditType,
        target_url: targetUrl,
        max_pages: maxPages,
        crawl_depth: crawlDepth,
      });

      router.push('/audits');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 mt-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New SEO Audit</h1>
        <p className="text-muted-foreground mt-2">Configure and start a new audit for your website.</p>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Business</Label>
          <Select value={businessId} onValueChange={(val) => setBusinessId(val || '')} disabled={isLoadingBusinesses}>
            <SelectTrigger>
              <SelectValue placeholder="Select a business" />
            </SelectTrigger>
            <SelectContent>
              {businesses.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {businesses.length === 0 && !isLoadingBusinesses && (
            <p className="text-sm text-red-500">You must create a business first before running an audit.</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetUrl">Target Website URL</Label>
          <Input 
            id="targetUrl" 
            value={targetUrl} 
            onChange={(e) => setTargetUrl(e.target.value)} 
            placeholder="https://example.com" 
          />
        </div>

        <div className="space-y-2">
          <Label>Audit Type</Label>
          <Select value={auditType} onValueChange={(val) => setAuditType(val || 'FULL_AUDIT')}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_AUDIT">Full Audit (Technical + Content + Local)</SelectItem>
              <SelectItem value="TECHNICAL_AUDIT">Technical SEO Only</SelectItem>
              <SelectItem value="LOCAL_AUDIT">Local SEO Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxPages">Max Pages to Crawl</Label>
            <Input 
              id="maxPages" 
              type="number" 
              value={maxPages} 
              onChange={(e) => setMaxPages(parseInt(e.target.value))} 
              min={1} 
              max={1000} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crawlDepth">Max Crawl Depth</Label>
            <Input 
              id="crawlDepth" 
              type="number" 
              value={crawlDepth} 
              onChange={(e) => setCrawlDepth(parseInt(e.target.value))} 
              min={1} 
              max={10} 
            />
          </div>
        </div>

        <div className="pt-6 border-t">
          <Button onClick={handleStartAudit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Starting...' : 'Start Audit'}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            This will initiate a background crawl. We will only fetch publicly accessible pages.
          </p>
        </div>
      </div>
    </div>
  );
}
