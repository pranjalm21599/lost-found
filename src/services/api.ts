import {
  User,
  Item,
  Claim,
  ItemMatch,
  ItemListResponse,
  ItemType
} from '../types';

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

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'An error occurred';
    try {
      const data = await res.json();
      errorDetail = data.detail || data.message || errorDetail;
    } catch {
      errorDetail = `Request failed with status ${res.status}`;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Auth
  async register(data: any): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async login(data: any): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
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
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // User Profile
  async updateProfile(data: { full_name?: string; phone?: string; profile_photo?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async changePassword(data: { current_password: string; new_password: string }): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/users/me/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Items
  async createItem(type: ItemType, data: any): Promise<Item> {
    const endpoint = type === 'LOST' ? '/items/lost' : '/items/found';
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
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

    const res = await fetch(`${API_BASE}/items?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getItem(id: number): Promise<Item> {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateItem(id: number, data: any): Promise<Item> {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteItem(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getMyReports(): Promise<Item[]> {
    const res = await fetch(`${API_BASE}/items/my-reports`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async markReturned(id: number): Promise<Item> {
    const res = await fetch(`${API_BASE}/items/${id}/returned`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getItemMatches(id: number): Promise<ItemMatch[]> {
    const res = await fetch(`${API_BASE}/items/${id}/matches`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Files
  async uploadFile(itemId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('clf_auth_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/items/${itemId}/files`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(res);
  },

  async deleteFile(itemId: number, fileId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/items/${itemId}/files/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Claims
  async submitClaim(itemId: number, message: string): Promise<Claim> {
    const res = await fetch(`${API_BASE}/items/${itemId}/claims`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    return handleResponse(res);
  },

  async getItemClaims(itemId: number): Promise<Claim[]> {
    const res = await fetch(`${API_BASE}/items/${itemId}/claims`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateClaimStatus(claimId: number, status: 'ACCEPTED' | 'REJECTED'): Promise<Claim> {
    const res = await fetch(`${API_BASE}/claims/${claimId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
};
