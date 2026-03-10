const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Custom fetch wrapper that automatically attaches the JWT token
 * from localStorage if it exists.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 204 No Content (e.g. DELETE responses) gracefully
  if (response.status === 204) {
    return {};
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'هناك خطأ في الاتصال بالخادم');
  }

  return data;
}

export const api = {
  get: (endpoint: string, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint: string, body: any, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    
  put: (endpoint: string, body: any, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    
  patch: (endpoint: string, body: any, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    
  delete: (endpoint: string, options?: RequestInit) => 
    apiFetch(endpoint, { ...options, method: 'DELETE' }),

  upload: async (endpoint: string, file: File, options?: RequestInit) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // We intentionally don't use apiFetch because we need to let the browser set the Content-Type with boundary for FormData
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = { ...(options?.headers as Record<string, string>) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data;
  }
};
