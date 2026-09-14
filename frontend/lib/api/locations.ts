import { apiClient } from './client';

export interface Location {
  id: string;
  organization_id: string;
  business_id: string;
  name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  phone: string | null;
  website_url: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface PaginatedLocations {
  data: Location[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const listLocations = async (
  organizationId: string, 
  params?: { page?: number; limit?: number; search?: string; status?: string; businessId?: string }
) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);

  const qs = query.toString();
  
  if (params?.businessId) {
    return apiClient.get<PaginatedLocations>(`/organizations/${organizationId}/businesses/${params.businessId}/locations${qs ? `?${qs}` : ''}`);
  }
  return apiClient.get<PaginatedLocations>(`/organizations/${organizationId}/locations${qs ? `?${qs}` : ''}`);
};

export const createLocation = async (organizationId: string, businessId: string, data: any) => {
  return apiClient.post<Location>(`/organizations/${organizationId}/businesses/${businessId}/locations`, data);
};

export const getLocation = async (organizationId: string, locationId: string) => {
  return apiClient.get<Location>(`/organizations/${organizationId}/locations/${locationId}`);
};

export const updateLocation = async (organizationId: string, locationId: string, data: any) => {
  return apiClient.patch<Location>(`/organizations/${organizationId}/locations/${locationId}`, data);
};

export const archiveLocation = async (organizationId: string, locationId: string) => {
  return apiClient.delete<Location>(`/organizations/${organizationId}/locations/${locationId}`);
};
