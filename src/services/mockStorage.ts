import { User, Item, Claim, ItemMatch, ItemListResponse, ItemType } from '../types';

const USERS_KEY = 'clf_local_users';
const ITEMS_KEY = 'clf_local_items';
const CLAIMS_KEY = 'clf_local_claims';
const FILES_KEY = 'clf_local_files';

interface StoredUser extends User {
  password_hash: string;
}

const DEFAULT_USERS: StoredUser[] = [
  {
    id: 1,
    full_name: 'Alex Chen',
    email: 'alex.chen@university.edu',
    student_id: 'STU-2024-8891',
    phone: '+1 (555) 234-5678',
    password_hash: 'Password123!',
    profile_photo: null,
    created_at: '2026-09-10 10:00:00',
    updated_at: '2026-09-10 10:00:00',
    is_active: true,
  },
  {
    id: 2,
    full_name: 'Sarah Jenkins',
    email: 'sarah.j@university.edu',
    student_id: 'STU-2023-4102',
    phone: '+1 (555) 876-5432',
    password_hash: 'Password123!',
    profile_photo: null,
    created_at: '2026-09-10 10:00:00',
    updated_at: '2026-09-10 10:00:00',
    is_active: true,
  },
];

const DEFAULT_ITEMS: Item[] = [
  {
    id: 1,
    user_id: 1,
    item_type: 'LOST',
    item_name: 'Black Leather Wallet',
    category: 'Wallet',
    description: 'Black bifold leather wallet containing student card, transit pass, and debit card. Lost near 2nd floor quiet study area.',
    event_date: '2026-09-10',
    event_time: '14:30',
    location: 'Library',
    current_location: null,
    additional_details: 'Has a small scratch on the front right corner.',
    contact_phone: '+1 (555) 234-5678',
    contact_email: 'alex.chen@university.edu',
    status: 'ACTIVE',
    created_at: '2026-09-11 10:00:00',
    updated_at: '2026-09-11 10:00:00',
    files: [],
  },
  {
    id: 2,
    user_id: 1,
    item_type: 'LOST',
    item_name: 'University Student ID Card',
    category: 'ID Card',
    description: 'Cardholder with blue lanyard and student ID for Alex Chen. Needed for dorm access.',
    event_date: '2026-09-11',
    event_time: '10:15',
    location: 'Food Court',
    current_location: null,
    additional_details: 'Blue lanyard with university crest.',
    contact_phone: '+1 (555) 234-5678',
    contact_email: 'alex.chen@university.edu',
    status: 'ACTIVE',
    created_at: '2026-09-11 10:30:00',
    updated_at: '2026-09-11 10:30:00',
    files: [],
  },
  {
    id: 3,
    user_id: 2,
    item_type: 'LOST',
    item_name: 'Sony Bluetooth Headphones',
    category: 'Headphones',
    description: 'Matte black Sony WH-1000XM4 noise cancelling over-ear headphones in grey zippered protective case.',
    event_date: '2026-09-09',
    event_time: '16:00',
    location: 'Sports Complex',
    current_location: null,
    additional_details: 'Case has a small silver carabiner attached.',
    contact_phone: '+1 (555) 876-5432',
    contact_email: 'sarah.j@university.edu',
    status: 'ACTIVE',
    created_at: '2026-09-10 11:00:00',
    updated_at: '2026-09-10 11:00:00',
    files: [],
  },
  {
    id: 4,
    user_id: 2,
    item_type: 'FOUND',
    item_name: 'Dark Leather Bifold Wallet',
    category: 'Wallet',
    description: 'Found dark brown/black leather wallet left behind on study desk near science journals section.',
    event_date: '2026-09-10',
    event_time: '15:10',
    location: 'Library',
    current_location: 'Handed to Library Front Desk lost & found bin',
    additional_details: 'Owner can identify cards inside to retrieve.',
    contact_phone: '+1 (555) 876-5432',
    contact_email: 'sarah.j@university.edu',
    status: 'ACTIVE',
    created_at: '2026-09-10 15:30:00',
    updated_at: '2026-09-10 15:30:00',
    files: [],
  },
  {
    id: 5,
    user_id: 1,
    item_type: 'FOUND',
    item_name: 'Hydro Flask Blue Water Bottle',
    category: 'Other',
    description: '32oz Pacific Blue wide-mouth Hydro Flask with stickers (NASA, React logo, mountain silhouette).',
    event_date: '2026-09-11',
    event_time: '11:45',
    location: 'Classroom',
    current_location: 'Classroom Hall B, podium shelf',
    additional_details: 'Slight dent on bottom rim.',
    contact_phone: '+1 (555) 234-5678',
    contact_email: 'alex.chen@university.edu',
    status: 'ACTIVE',
    created_at: '2026-09-11 12:00:00',
    updated_at: '2026-09-11 12:00:00',
    files: [],
  },
  {
    id: 6,
    user_id: 2,
    item_type: 'FOUND',
    item_name: 'Texas Instruments Scientific Calculator',
    category: 'Electronics',
    description: 'TI-84 Plus CE Graphing Calculator in black casing with slide cover.',
    event_date: '2026-09-08',
    event_time: '13:00',
    location: 'Laboratory',
    current_location: 'Engineering Lab 304, Instructor bench',
    additional_details: 'Initials M.T. faintly etched on back cover.',
    contact_phone: '+1 (555) 876-5432',
    contact_email: 'sarah.j@university.edu',
    status: 'ACTIVE',
    created_at: '2026-09-09 14:00:00',
    updated_at: '2026-09-09 14:00:00',
    files: [],
  },
  {
    id: 7,
    user_id: 1,
    item_type: 'FOUND',
    item_name: 'Black North Face Backpack',
    category: 'Bag',
    description: 'Black North Face Borealis backpack containing notebook and USB-C charger found near outdoor benches.',
    event_date: '2026-09-07',
    event_time: '17:30',
    location: 'Administrative Block',
    current_location: 'Campus Security Office, Admin Ground Floor',
    additional_details: 'Held securely at security office badge desk.',
    contact_phone: '+1 (555) 234-5678',
    contact_email: 'alex.chen@university.edu',
    status: 'ACTIVE',
    created_at: '2026-09-08 09:00:00',
    updated_at: '2026-09-08 09:00:00',
    files: [],
  },
];

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

function saveUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

function getStoredItems(): Item[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (!raw) {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(DEFAULT_ITEMS));
      return DEFAULT_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ITEMS;
  }
}

function saveItems(items: Item[]): void {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {}
}

function getStoredClaims(): Claim[] {
  try {
    const raw = localStorage.getItem(CLAIMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveClaims(claims: Claim[]): void {
  try {
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
  } catch {}
}

function getCurrentUserId(): number | null {
  try {
    const token = localStorage.getItem('clf_auth_token');
    if (!token) return null;
    const parts = token.split(':');
    if (parts.length >= 2 && parts[0] === 'mock_token') {
      return parseInt(parts[1], 10);
    }
    // Fallback: decode basic payload if mock
    return 1;
  } catch {
    return null;
  }
}

function createMockToken(user: StoredUser): string {
  return `mock_token:${user.id}:${Date.now()}`;
}

function tokenize(text: string): Set<string> {
  if (!text) return new Set();
  const stopWords = new Set(['the', 'and', 'with', 'for', 'this', 'that', 'from', 'near', 'left', 'found', 'lost']);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  return new Set(words);
}

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export const mockStorage = {
  // Auth
  register(data: any): { access_token: string; user: User } {
    const { full_name, email, student_id, phone, password, confirm_password } = data;
    if (!full_name || !email || !student_id || !phone || !password) {
      throw new Error('All fields are required.');
    }
    if (confirm_password && password !== confirm_password) {
      throw new Error('Password confirmation must match.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanStudentId = student_id.trim();
    const users = getStoredUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }
    if (users.some(u => u.student_id === cleanStudentId)) {
      throw new Error('An account with this student ID already exists.');
    }

    const newUser: StoredUser = {
      id: Date.now(),
      full_name: full_name.trim(),
      email: cleanEmail,
      student_id: cleanStudentId,
      phone: phone.trim(),
      password_hash: password,
      profile_photo: null,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      is_active: true,
    };

    users.push(newUser);
    saveUsers(users);

    const token = createMockToken(newUser);
    localStorage.setItem('clf_auth_token', token);

    const { password_hash, ...publicUser } = newUser;
    return { access_token: token, user: publicUser };
  },

  login(data: any): { access_token: string; user: User } {
    const { email, password } = data;
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user || user.password_hash !== password) {
      throw new Error('Invalid email or password.');
    }

    const token = createMockToken(user);
    localStorage.setItem('clf_auth_token', token);

    const { password_hash, ...publicUser } = user;
    return { access_token: token, user: publicUser };
  },

  getMe(): User {
    const currentId = getCurrentUserId();
    const users = getStoredUsers();
    const user = users.find(u => u.id === currentId) || users[0];
    if (!user) throw new Error('Not authenticated');
    const { password_hash, ...publicUser } = user;
    return publicUser;
  },

  updateProfile(data: { full_name?: string; phone?: string; profile_photo?: string }): User {
    const currentId = getCurrentUserId();
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === currentId);
    if (idx === -1) throw new Error('User not found');

    const updated = {
      ...users[idx],
      full_name: data.full_name || users[idx].full_name,
      phone: data.phone || users[idx].phone,
      profile_photo: data.profile_photo !== undefined ? data.profile_photo : users[idx].profile_photo,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    users[idx] = updated;
    saveUsers(users);

    const { password_hash, ...publicUser } = updated;
    return publicUser;
  },

  changePassword(data: { current_password: string; new_password: string }): { message: string } {
    const currentId = getCurrentUserId();
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === currentId);
    if (idx === -1) throw new Error('User not found');

    if (users[idx].password_hash !== data.current_password) {
      throw new Error('Current password does not match.');
    }
    if (data.new_password.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    users[idx].password_hash = data.new_password;
    saveUsers(users);
    return { message: 'Password updated successfully' };
  },

  // Items
  createItem(type: ItemType, data: any): Item {
    const currentId = getCurrentUserId() || 1;
    const items = getStoredItems();
    const users = getStoredUsers();
    const user = users.find(u => u.id === currentId);

    const newItem: Item = {
      id: Date.now(),
      user_id: currentId,
      item_type: type,
      item_name: data.item_name.trim(),
      category: data.category,
      description: data.description.trim(),
      event_date: data.event_date,
      event_time: data.event_time || null,
      location: data.location,
      current_location: data.current_location?.trim() || null,
      additional_details: data.additional_details?.trim() || null,
      contact_phone: user?.phone || '+1 (555) 234-5678',
      contact_email: user?.email || 'student@university.edu',
      status: 'ACTIVE',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      files: [],
    };

    items.unshift(newItem);
    saveItems(items);
    return newItem;
  },

  getItems(params: any): ItemListResponse {
    let items = getStoredItems();
    const currentId = getCurrentUserId();

    if (params.q) {
      const q = params.q.toLowerCase();
      items = items.filter(
        i =>
          i.item_name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q)
      );
    }
    if (params.item_type && params.item_type !== 'All') {
      items = items.filter(i => i.item_type === params.item_type);
    }
    if (params.category && params.category !== 'All') {
      items = items.filter(i => i.category === params.category);
    }
    if (params.location && params.location !== 'All') {
      items = items.filter(i => i.location === params.location);
    }
    if (params.status && params.status !== 'All') {
      items = items.filter(i => i.status === params.status);
    }
    if (params.date_from) {
      items = items.filter(i => i.event_date >= params.date_from);
    }
    if (params.date_to) {
      items = items.filter(i => i.event_date <= params.date_to);
    }

    const page = params.page ? parseInt(String(params.page), 10) : 1;
    const limit = params.limit ? parseInt(String(params.limit), 10) : 10;
    const total = items.length;
    const total_pages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const pagedItems = items.slice(startIndex, startIndex + limit).map(item => {
      if (!currentId) {
        return { ...item, contact_phone: null, contact_email: null };
      }
      return item;
    });

    return {
      items: pagedItems,
      total,
      page,
      limit,
      total_pages,
    };
  },

  getItem(id: number): Item {
    const items = getStoredItems();
    const item = items.find(i => i.id === id);
    if (!item) throw new Error('Item not found');

    const currentId = getCurrentUserId();
    if (!currentId) {
      return { ...item, contact_phone: null, contact_email: null };
    }
    return item;
  },

  updateItem(id: number, data: any): Item {
    const items = getStoredItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Item not found');

    items[idx] = {
      ...items[idx],
      ...data,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    saveItems(items);
    return items[idx];
  },

  deleteItem(id: number): { message: string } {
    let items = getStoredItems();
    items = items.filter(i => i.id !== id);
    saveItems(items);
    return { message: 'Item deleted' };
  },

  getMyReports(): Item[] {
    const currentId = getCurrentUserId() || 1;
    const items = getStoredItems();
    return items.filter(i => i.user_id === currentId);
  },

  markReturned(id: number): Item {
    const items = getStoredItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Item not found');

    items[idx].status = 'RETURNED';
    items[idx].updated_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
    saveItems(items);
    return items[idx];
  },

  getItemMatches(id: number): ItemMatch[] {
    const items = getStoredItems();
    const target = items.find(i => i.id === id);
    if (!target) return [];

    const oppositeType = target.item_type === 'LOST' ? 'FOUND' : 'LOST';
    const candidates = items.filter(i => i.item_type === oppositeType && i.status !== 'RETURNED');
    const matches: ItemMatch[] = [];

    for (const cand of candidates) {
      let score = 0;
      const reasons: string[] = [];

      if (target.category === cand.category) {
        score += 35;
        reasons.push('Same category');
      }

      const tNameTokens = tokenize(target.item_name);
      const cNameTokens = tokenize(cand.item_name);
      const nameSim = jaccardSimilarity(tNameTokens, cNameTokens);
      if (nameSim >= 0.5) {
        score += 25;
        reasons.push('High title keyword match');
      } else if (nameSim >= 0.2) {
        score += 15;
        reasons.push('Similar item name');
      }

      if (target.location === cand.location) {
        score += 20;
        reasons.push('Same campus location');
      }

      try {
        const d1 = new Date(target.event_date).getTime();
        const d2 = new Date(cand.event_date).getTime();
        const diffDays = Math.abs(d1 - d2) / (1000 * 3600 * 24);
        if (diffDays <= 1) {
          score += 10;
          reasons.push('Same or consecutive date');
        } else if (diffDays <= 4) {
          score += 7;
          reasons.push('Reported within 4 days');
        }
      } catch {}

      const tDescTokens = tokenize(target.description);
      const cDescTokens = tokenize(cand.description);
      const descSim = jaccardSimilarity(tDescTokens, cDescTokens);
      if (descSim >= 0.2) {
        score += 10;
        reasons.push('Similar description');
      }

      const finalScore = Math.min(100, score);
      if (finalScore >= 30) {
        matches.push({
          item: { ...cand, contact_phone: null, contact_email: null },
          score: finalScore,
          reasons,
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  },

  submitClaim(itemId: number, message: string): Claim {
    const currentId = getCurrentUserId() || 1;
    const users = getStoredUsers();
    const claimant = users.find(u => u.id === currentId);
    const claims = getStoredClaims();

    const newClaim: Claim = {
      id: Date.now(),
      item_id: itemId,
      claimant_id: currentId,
      message: message.trim(),
      status: 'PENDING',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      claimant: claimant ? { ...claimant } : null,
    };

    claims.push(newClaim);
    saveClaims(claims);
    return newClaim;
  },

  getItemClaims(itemId: number): Claim[] {
    const claims = getStoredClaims();
    return claims.filter(c => c.item_id === itemId);
  },

  updateClaimStatus(claimId: number, status: 'ACCEPTED' | 'REJECTED'): Claim {
    const claims = getStoredClaims();
    const idx = claims.findIndex(c => c.id === claimId);
    if (idx === -1) throw new Error('Claim not found');

    claims[idx].status = status;
    claims[idx].updated_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
    saveClaims(claims);
    return claims[idx];
  },

  async uploadFile(itemId: number, file: File): Promise<any> {
    const items = getStoredItems();
    const idx = items.findIndex(i => i.id === itemId);
    if (idx === -1) throw new Error('Item not found');

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileObj = {
          id: Date.now(),
          item_id: itemId,
          file_name: file.name,
          file_path: reader.result as string,
          file_type: file.type,
          file_size: file.size,
          created_at: new Date().toISOString(),
        };
        if (!items[idx].files) items[idx].files = [];
        items[idx].files!.push(fileObj);
        saveItems(items);
        resolve(fileObj);
      };
      reader.onerror = () => {
        resolve({ id: Date.now(), item_id: itemId, file_name: file.name, file_path: '', file_type: file.type, file_size: file.size });
      };
      reader.readAsDataURL(file);
    });
  },

  deleteFile(itemId: number, fileId: number): any {
    const items = getStoredItems();
    const idx = items.findIndex(i => i.id === itemId);
    if (idx !== -1 && items[idx].files) {
      items[idx].files = items[idx].files!.filter(f => f.id !== fileId);
      saveItems(items);
    }
    return { message: 'File deleted' };
  }
};
