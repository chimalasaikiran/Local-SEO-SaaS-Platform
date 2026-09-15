import { apiClient } from './client';

export interface KeywordRanking {
  id: string;
  position: number | null;
  visibility_score: number | null;
  checked_at: string;
}

export interface Keyword {
  id: string;
  organization_id: string;
  business_id: string;
  location_id: string;
  keyword: string;
  normalized_keyword: string;
  search_engine: string;
  country_code: string;
  language_code: string;
  device: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
  
  business?: { id: string; name: string };
  location?: { id: string; name: string };
  currentRanking?: KeywordRanking | null;
  previousRanking?: KeywordRanking | null;
  rankingChange?: number | null;
  lastCheckedAt?: string | null;
}

export interface KeywordLocation {
  id: string;
  organization_id: string;
  keyword_id: string;
  latitude: number;
  longitude: number;
  radius_meters: number | null;
  label: string | null;
  created_at: string;
}

export interface PaginatedKeywords {
  data: Keyword[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const listKeywords = async (
  organizationId: string, 
  params?: { page?: number; limit?: number; search?: string; status?: string; businessId?: string; locationId?: string; searchEngine?: string; device?: string }
) => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  if (params?.businessId) query.append('businessId', params.businessId);
  if (params?.locationId) query.append('locationId', params.locationId);
  if (params?.searchEngine) query.append('searchEngine', params.searchEngine);
  if (params?.device) query.append('device', params.device);

  const qs = query.toString();
  return apiClient.get<PaginatedKeywords>(`/organizations/${organizationId}/keywords${qs ? `?${qs}` : ''}`);
};

export const getKeyword = async (organizationId: string, keywordId: string) => {
  return apiClient.get<Keyword>(`/organizations/${organizationId}/keywords/${keywordId}`);
};

export const createKeyword = async (organizationId: string, data: any) => {
  return apiClient.post<Keyword>(`/organizations/${organizationId}/keywords`, data);
};

export const bulkCreateKeywords = async (organizationId: string, data: any) => {
  return apiClient.post<{ created: number, skipped: number, invalid: number, duplicates: string[] }>(`/organizations/${organizationId}/keywords/bulk`, data);
};

export const updateKeyword = async (organizationId: string, keywordId: string, data: any) => {
  return apiClient.patch<Keyword>(`/organizations/${organizationId}/keywords/${keywordId}`, data);
};

export const archiveKeyword = async (organizationId: string, keywordId: string) => {
  return apiClient.delete<Keyword>(`/organizations/${organizationId}/keywords/${keywordId}`);
};

export const listKeywordLocations = async (organizationId: string, keywordId: string) => {
  return apiClient.get<KeywordLocation[]>(`/organizations/${organizationId}/keywords/${keywordId}/locations`);
};

export const addKeywordLocation = async (organizationId: string, keywordId: string, data: any) => {
  return apiClient.post<KeywordLocation>(`/organizations/${organizationId}/keywords/${keywordId}/locations`, data);
};

export const removeKeywordLocation = async (organizationId: string, keywordId: string, locationId: string) => {
  return apiClient.delete<any>(`/organizations/${organizationId}/keywords/${keywordId}/locations/${locationId}`);
};
