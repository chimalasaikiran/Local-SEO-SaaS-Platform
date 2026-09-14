const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export const apiClient = {
  async fetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Important for sending/receiving cookies
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || (data && data.success === false)) {
      const errorMsg = data?.error?.message || 'An unexpected error occurred';
      const errorCode = data?.error?.code || 'UNKNOWN_ERROR';
      const errorDetails = data?.error?.details;
      throw new ApiError(errorMsg, errorCode, errorDetails);
    }

    // The backend returns { success: true, data: T } for most responses
    // Or sometimes just { success: true, message: string }
    return data?.data !== undefined ? data.data : data;
  },

  get<T = any>(endpoint: string, options?: RequestInit) {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return this.fetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  },

  patch<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return this.fetch<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) });
  },

  delete<T = any>(endpoint: string, options?: RequestInit) {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  }
};
