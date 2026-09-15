const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  options.credentials = 'include';
  if (!options.headers) {
    options.headers = {};
  }
  (options.headers as any)['Content-Type'] = 'application/json';

  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.error || 'API Request Failed');
  }
  return res.json();
}

export const listRankTrackingConfigs = async (organizationId: string, filters: any = {}) => {
  const query = new URLSearchParams(filters).toString();
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/configs?${query}`);
};

export const createRankTrackingConfig = async (organizationId: string, data: any) => {
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/configs`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getRankTrackingConfig = async (organizationId: string, configId: string) => {
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/configs/${configId}`);
};

export const getRankTrackingGrid = async (organizationId: string, configId: string) => {
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/configs/${configId}/grid`);
};

export const regenerateRankTrackingGrid = async (organizationId: string, configId: string) => {
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/configs/${configId}/grid/regenerate`, { method: 'POST' });
};

export const getConfigKeywords = async (organizationId: string, configId: string) => {
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/configs/${configId}/keywords`);
};

export const addConfigKeyword = async (organizationId: string, configId: string, keywordId: string) => {
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/configs/${configId}/keywords`, {
    method: 'POST',
    body: JSON.stringify({ keywordId }),
  });
};

export const runRankTracking = async (organizationId: string, configId: string) => {
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/configs/${configId}/runs`, {
    method: 'POST',
  });
};

export const getRankTrackingRun = async (organizationId: string, runId: string) => {
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/runs/${runId}`);
};

export const getLatestRankings = async (organizationId: string, configId: string) => {
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/configs/${configId}/rankings`);
};

export const getRunsHistory = async (organizationId: string, configId: string) => {
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/configs/${configId}/history`);
};

export const getRunRankings = async (organizationId: string, runId: string) => {
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/runs/${runId}/rankings`);
};

export const updateRankTrackingConfig = async (organizationId: string, configId: string, data: any) => {
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/configs/${configId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteRankTrackingConfig = async (organizationId: string, configId: string) => {
  return fetchWithAuth(`${BASE_URL}/organizations/${organizationId}/rank-tracking/configs/${configId}`, {
    method: 'DELETE',
  });
};
