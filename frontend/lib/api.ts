const BASE_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3001` : 'http://127.0.0.1:3001';
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

export interface UserProfile {
  id: string;
  username: string;
  role: string;
  tenantId: string;
  dob?: string | null;
  address?: string | null;
  designation?: string | null;
  salary?: string | number | null;
  pageAccess?: string[] | null;
}

// Global cached token
let jwtToken: string | null = null;

// Get token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  if (!jwtToken) {
    jwtToken = localStorage.getItem('hig_jwt_token');
  }

  return jwtToken;
}

// Save token
export function setAuthToken(token: string): void {
  jwtToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('hig_jwt_token', token);
  }
}

// Clear token
export function logout(): void {
  jwtToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hig_jwt_token');
  }
}

// Fetch with automatic JWT authorization header
export async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  if (!response.ok) {
    // If fetching profile fails due to auth issues (e.g. invalid/expired token, db reset),
    // return null gracefully instead of throwing a crash-inducing error.
    if (path === '/auth/profile' && (response.status === 401 || response.status === 404)) {
      return null;
    }

    if (response.status === 401) {
      logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    const errorText = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
