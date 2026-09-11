import {
  User,
  Item,
  Claim,
  ItemMatch,
  ItemListResponse,
  ItemType
} from '../types';
import { mockStorage } from './mockStorage';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('clf_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function requestWithFallback<T>(
  requestFn: () => Promise<Response>,
  fallbackFn: () => Promise<T> | T
): Promise<T> {
  try {
    const res = await requestFn();
    // If endpoint is not found on host (e.g. static hosting returning 404 or gateway error), use fallback
    if (res.status === 404 || res.status === 502 || res.status === 503 || res.status === 504) {
      return await fallbackFn();
    }
    if (!res.ok) {
      let errorDetail = 'An error occurred';
      try {
        const data = await res.json();
        errorDetail = data.detail || data.message || errorDetail;
      } catch {
        // If response wasn't JSON (e.g. HTML error page from web server)
        return await fallbackFn();
      }
      throw new Error(errorDetail);
    }
    return await res.json();
  } catch (err: any) {
    // If it's a known validation error from backend (e.g. email exists, bad password), rethrow it
    if (err.message && err.message !== 'Failed to fetch' && !err.message.startsWith('Request failed with status')) {
      throw err;
    }
    // Network failure, offline, or static server
    return await fallbackFn();
  }
}

export const api = {
  // Auth
  async register(data: any): Promise<{ access_token: string; user: User }> {
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      () => mockStorage.register(data)
    );
  },

  async login(data: any): Promise<{ access_token: string; user: User }> {
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      () => mockStorage.login(data)
    );
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {}
    localStorage.removeItem('clf_auth_token');
  },

  async getMe(): Promise<User> {
    return requestWithFallback(
      () => fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() }),
      () => mockStorage.getMe()
    );
  },

  // User Profile
  async updateProfile(data: { full_name?: string; phone?: string; profile_photo?: string }): Promise<User> {
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/users/me`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }),
      () => mockStorage.updateProfile(data)
    );
  },

  async changePassword(data: { current_password: string; new_password: string }): Promise<{ message: string }> {
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/users/me/password`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }),
      () => mockStorage.changePassword(data)
    );
  },

  // Items
  async createItem(type: ItemType, data: any): Promise<Item> {
    const endpoint = type === 'LOST' ? '/items/lost' : '/items/found';
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }),
      () => mockStorage.createItem(type, data)
    );
  },

  async getItems(params: {
    q?: string;
    item_type?: string;
    category?: string;
    location?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<ItemListResponse> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.item_type) query.append('item_type', params.item_type);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.location && params.location !== 'All') query.append('location', params.location);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.date_from) query.append('date_from', params.date_from);
    if (params.date_to) query.append('date_to', params.date_to);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/items?${query.toString()}`, {
          headers: getAuthHeaders(),
        }),
      () => mockStorage.getItems(params)
    );
  },

  async getItem(id: number): Promise<Item> {
    return requestWithFallback(
      () => fetch(`${API_BASE}/items/${id}`, { headers: getAuthHeaders() }),
      () => mockStorage.getItem(id)
    );
  },

  async updateItem(id: number, data: any): Promise<Item> {
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/items/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }),
      () => mockStorage.updateItem(id, data)
    );
  },

  async deleteItem(id: number): Promise<{ message: string }> {
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/items/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }),
      () => mockStorage.deleteItem(id)
    );
  },

  async getMyReports(): Promise<Item[]> {
    return requestWithFallback(
      () => fetch(`${API_BASE}/items/my-reports`, { headers: getAuthHeaders() }),
      () => mockStorage.getMyReports()
    );
  },

  async markReturned(id: number): Promise<Item> {
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/items/${id}/returned`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
        }),
      () => mockStorage.markReturned(id)
    );
  },

  async getItemMatches(id: number): Promise<ItemMatch[]> {
    return requestWithFallback(
      () => fetch(`${API_BASE}/items/${id}/matches`, { headers: getAuthHeaders() }),
      () => mockStorage.getItemMatches(id)
    );
  },

  // Files
  async uploadFile(itemId: number, file: File): Promise<any> {
    return requestWithFallback(
      () => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('clf_auth_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(`${API_BASE}/items/${itemId}/files`, {
          method: 'POST',
          headers,
          body: formData,
        });
      },
      () => mockStorage.uploadFile(itemId, file)
    );
  },

  async deleteFile(itemId: number, fileId: number): Promise<any> {
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/items/${itemId}/files/${fileId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }),
      () => mockStorage.deleteFile(itemId, fileId)
    );
  },

  // Claims
  async submitClaim(itemId: number, message: string): Promise<Claim> {
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/items/${itemId}/claims`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ message }),
        }),
      () => mockStorage.submitClaim(itemId, message)
    );
  },

  async getItemClaims(itemId: number): Promise<Claim[]> {
    return requestWithFallback(
      () => fetch(`${API_BASE}/items/${itemId}/claims`, { headers: getAuthHeaders() }),
      () => mockStorage.getItemClaims(itemId)
    );
  },

  async updateClaimStatus(claimId: number, status: 'ACCEPTED' | 'REJECTED'): Promise<Claim> {
    return requestWithFallback(
      () =>
        fetch(`${API_BASE}/claims/${claimId}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status }),
        }),
      () => mockStorage.updateClaimStatus(claimId, status)
    );
  },
};
