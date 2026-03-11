const API_URL = import.meta.env.VITE_API_URL || '/api';
const AUTH_FREE_ENDPOINTS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
]);

let refreshPromise: Promise<boolean> | null = null;

async function refreshAuthSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/**
 * Custom fetch wrapper that relies on HttpOnly auth cookies and retries once
 * after a silent refresh when an access token expires.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}, allowRefresh = true) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && allowRefresh && !AUTH_FREE_ENDPOINTS.has(endpoint)) {
    const refreshed = await refreshAuthSession();
    if (refreshed) {
      return apiFetch(endpoint, options, false);
    }
  }

  // Handle 204 No Content (e.g. DELETE responses) gracefully
  if (response.status === 204) {
    return {};
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || 'هناك خطأ في الاتصال بالخادم');
  }

  return data;
}

export const api = {
  get: (endpoint: string, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'GET' }),
    
  post: <TBody = unknown>(endpoint: string, body: TBody, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    
  put: <TBody = unknown>(endpoint: string, body: TBody, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    
  patch: <TBody = unknown>(endpoint: string, body: TBody, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    
  delete: (endpoint: string, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'DELETE' }),

  upload: async (endpoint: string, file: File, options?: RequestInit, allowRefresh = true): Promise<unknown> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // We intentionally don't use apiFetch because we need to let the browser set the Content-Type with boundary for FormData
    const headers: Record<string, string> = { ...(options?.headers as Record<string, string>) };

    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (response.status === 401 && allowRefresh) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        return api.upload(endpoint, file, options, false);
      }
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data;
  }
};
