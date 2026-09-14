import { apiClient } from './client';

export interface Business {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  website_url: string | null;
  phone: string | null;
  primary_category: string | null;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
  location_count?: number;
}

export interface PaginatedBusinesses {
  data: Business[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const listBusinesses = async (
  organizationId: string, 
  params?: { page?: number; limit?: number; search?: string; status?: string }
) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);

  const qs = query.toString();
  return apiClient.get<PaginatedBusinesses>(`/organizations/${organizationId}/businesses${qs ? `?${qs}` : ''}`);
};

export const createBusiness = async (organizationId: string, data: any) => {
  return apiClient.post<Business>(`/organizations/${organizationId}/businesses`, data);
};

export const getBusiness = async (organizationId: string, businessId: string) => {
  return apiClient.get<Business>(`/organizations/${organizationId}/businesses/${businessId}`);
};

export const updateBusiness = async (organizationId: string, businessId: string, data: any) => {
  return apiClient.patch<Business>(`/organizations/${organizationId}/businesses/${businessId}`, data);
};

export const archiveBusiness = async (organizationId: string, businessId: string) => {
  return apiClient.delete<Business>(`/organizations/${organizationId}/businesses/${businessId}`);
};
