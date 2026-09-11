export type ItemType = 'LOST' | 'FOUND';

export type ItemStatus = 'ACTIVE' | 'MATCHED' | 'RETURNED' | 'CLOSED';

export type ClaimStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface User {
  id: number;
  full_name: string;
  email: string;
  student_id: string;
  phone: string;
  profile_photo?: string | null;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

export interface ItemFile {
  id: number;
  item_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface Item {
  id: number;
  user_id: number;
  item_type: ItemType;
  item_name: string;
  category: string;
  description: string;
  event_date: string;
  event_time?: string | null;
  location: string;
  current_location?: string | null;
  additional_details?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at?: string;
  files?: ItemFile[];
  user?: User | null;
}

export interface Claim {
  id: number;
  item_id: number;
  claimant_id: number;
  message: string;
  status: ClaimStatus;
  created_at: string;
  updated_at?: string;
  claimant?: User | null;
}

export interface ItemMatch {
  item: Item;
  score: number;
  reasons: string[];
}

export interface ItemListResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const CATEGORIES = [
  'Electronics',
  'Mobile Phone',
  'Laptop',
  'Headphones',
  'Earphones',
  'Wallet',
  'ID Card',
  'Keys',
  'Books',
  'Documents',
  'Clothing',
  'Bag',
  'Accessories',
  'Other'
] as const;

export const CAMPUS_LOCATIONS = [
  'Library',
  'Classroom',
  'Hostel',
  'Food Court',
  'Parking',
  'Sports Complex',
  'Administrative Block',
  'Laboratory',
  'Auditorium',
  'Other'
] as const;
