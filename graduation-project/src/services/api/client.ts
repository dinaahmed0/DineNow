export const API_BASE_URL = 'https://reservationproj.runasp.net';

interface ErrorPayload {
  message?: string;
  errors?: string[];
  Message?: string;
  Errors?: string[];
}

interface StoredUser {
  email: string;
  displayName: string;
  token: string;
  refreshToken: string;
  accessToken?: string;
  refresh?: string;
}

interface RefreshResponse {
  succeeded: boolean;
  message?: string;
  data?: {
    email?: string;
    displayName?: string;
    token?: string;
    refreshToken?: string;
  };
}

const getStoredUser = (): StoredUser | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as StoredUser;
  } catch {
    return null;
  }
};

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const user = getStoredUser();
  return user?.token || user?.accessToken || null;
};

const toError = (status: number, statusText: string, payload?: ErrorPayload): Error => {
  const errorList = payload?.errors || payload?.Errors;
  const firstApiError = errorList?.[0];
  const message = payload?.message || payload?.Message || firstApiError || `Request failed: ${status} - ${statusText}`;
  return new Error(message);
};

const parseErrorPayload = async (response: Response): Promise<ErrorPayload | undefined> => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json().catch(() => undefined) as Promise<ErrorPayload | undefined>;
  }

  const text = await response.text().catch(() => '');
  if (!text) return undefined;
  return { message: text };
};

const refreshAccessToken = async (): Promise<boolean> => {
  const user = getStoredUser();
  const currentToken = user?.token || user?.accessToken || '';
  const currentRefreshToken = user?.refreshToken || user?.refresh || '';
  if (!currentRefreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/Account/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: currentToken,
        refreshToken: currentRefreshToken,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as RefreshResponse;
    const nextToken = payload.data?.token || payload.data?.accessToken;
    const nextRefresh = payload.data?.refreshToken || currentRefreshToken;
    if (!payload.succeeded || !nextToken) {
      return false;
    }

    const updatedUser: StoredUser = {
      email: payload.data.email || user.email,
      displayName: payload.data.displayName || user.displayName,
      token: nextToken,
      refreshToken: nextRefresh,
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    return true;
  } catch {
    return false;
  }
};

const request = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  data?: unknown,
  hasRetried = false
): Promise<T> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  if (method !== 'DELETE' || data !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });

  if (!response.ok) {
    if (response.status === 401 && !hasRetried && path !== '/api/Account/refresh') {
      console.log('401 detected, attempting token refresh');
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request<T>(method, path, data, true);
      }
    }

    const rawErrorBody = await response.clone().text().catch(() => '');
    if (response.status >= 500) {
      console.error('API server error', {
        method,
        path,
        status: response.status,
        statusText: response.statusText,
        requestData: data,
        responseBody: rawErrorBody,
      });
    }

    const payload = await parseErrorPayload(response);
    throw toError(response.status, response.statusText, payload);
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    return text as T;
  }

  return response.json() as Promise<T>;
};

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>('GET', path);
}

export async function apiPost<T>(path: string, data: unknown): Promise<T> {
  return request<T>('POST', path, data);
}

export async function apiPatch<T>(path: string, data: unknown): Promise<T> {
  return request<T>('PATCH', path, data);
}

export async function apiPut<T>(path: string, data: unknown): Promise<T> {
  return request<T>('PUT', path, data);
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>('DELETE', path);
}

