import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'campus-lost-found-super-secret-jwt-key-2026';
const JWT_EXPIRES_IN = '24h';

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'items');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Database initialization
const DB_PATH = path.join(process.cwd(), 'campus_lost_found.db');
const db = new DatabaseSync(DB_PATH);

// Initialize schema
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    profile_photo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_type TEXT NOT NULL, -- 'LOST' or 'FOUND'
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_time TEXT,
    location TEXT NOT NULL,
    current_location TEXT,
    additional_details TEXT,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'MATCHED', 'RETURNED', 'CLOSED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS item_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    claimant_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY(claimant_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_items_type ON items(item_type);
  CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
  CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
`);

// Seed default accounts and items if users table is empty
const userCountRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCountRow.count === 0) {
  const hash = bcrypt.hashSync('Password123!', 10);
  const insertUser = db.prepare(`
    INSERT INTO users (full_name, email, student_id, phone, password_hash, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `);
  
  insertUser.run('Alex Chen', 'alex.chen@university.edu', 'STU-2024-8891', '+1 (555) 234-5678', hash);
  insertUser.run('Sarah Jenkins', 'sarah.j@university.edu', 'STU-2023-4102', '+1 (555) 876-5432', hash);

  const insertItem = db.prepare(`
    INSERT INTO items (
      user_id, item_type, item_name, category, description,
      event_date, event_time, location, current_location,
      additional_details, contact_phone, contact_email, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // LOST Items
  insertItem.run(
    1, 'LOST', 'Black Leather Wallet', 'Wallet',
    'Black bifold leather wallet containing student card, transit pass, and debit card. Lost near 2nd floor quiet study area.',
    '2026-09-10', '14:30', 'Library', null,
    'Has a small scratch on the front right corner.', '+1 (555) 234-5678', 'alex.chen@university.edu', 'ACTIVE'
  );
  insertItem.run(
    1, 'LOST', 'University Student ID Card', 'ID Card',
    'Cardholder with blue lanyard and student ID for Alex Chen. Needed for dorm access.',
    '2026-09-11', '10:15', 'Food Court', null,
    'Blue lanyard with university crest.', '+1 (555) 234-5678', 'alex.chen@university.edu', 'ACTIVE'
  );
  insertItem.run(
    2, 'LOST', 'Sony Bluetooth Headphones', 'Headphones',
    'Matte black Sony WH-1000XM4 noise cancelling over-ear headphones in grey zippered protective case.',
    '2026-09-09', '16:00', 'Sports Complex', null,
    'Case has a small silver carabiner attached.', '+1 (555) 876-5432', 'sarah.j@university.edu', 'ACTIVE'
  );

  // FOUND Items
  insertItem.run(
    2, 'FOUND', 'Dark Leather Bifold Wallet', 'Wallet',
    'Found dark brown/black leather wallet left behind on study desk near science journals section.',
    '2026-09-10', '15:10', 'Library', 'Handed to Library Front Desk lost & found bin',
    'Owner can identify cards inside to retrieve.', '+1 (555) 876-5432', 'sarah.j@university.edu', 'ACTIVE'
  );
  insertItem.run(
    1, 'FOUND', 'Hydro Flask Blue Water Bottle', 'Other',
    '32oz Pacific Blue wide-mouth Hydro Flask with stickers (NASA, React logo, mountain silhouette).',
    '2026-09-11', '11:45', 'Classroom', 'Classroom Hall B, podium shelf',
    'Slight dent on bottom rim.', '+1 (555) 234-5678', 'alex.chen@university.edu', 'ACTIVE'
  );
  insertItem.run(
    2, 'FOUND', 'Texas Instruments Scientific Calculator', 'Electronics',
    'TI-84 Plus CE Graphing Calculator in black casing with slide cover.',
    '2026-09-08', '13:00', 'Laboratory', 'Engineering Lab 304, Instructor bench',
    'Initials M.T. faintly etched on back cover.', '+1 (555) 876-5432', 'sarah.j@university.edu', 'ACTIVE'
  );
  insertItem.run(
    1, 'FOUND', 'Black North Face Backpack', 'Bag',
    'Black North Face Borealis backpack containing notebook and USB-C charger found near outdoor benches.',
    '2026-09-07', '17:30', 'Administrative Block', 'Campus Security Office, Admin Ground Floor',
    'Held securely at security office badge desk.', '+1 (555) 234-5678', 'alex.chen@university.edu', 'ACTIVE'
  );
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMime = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unable to upload this file. Please upload PNG, JPG, JPEG or PDF files under 10 MB.'));
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Helper: Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: 'Authentication required. Token missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ detail: 'Invalid or expired authentication token.' });
    }
    req.user = user as { id: number; email: string };
    next();
  });
};

const optionalAuthenticateToken = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (_err, user) => {
    if (user) {
      req.user = user as { id: number; email: string };
    }
    next();
  });
};

// ==========================================
// REST API ROUTES
// ==========================================

// --- AUTH ---
app.post('/api/auth/register', (req, res) => {
  try {
    const { full_name, email, student_id, phone, password, confirm_password } = req.body;

    // Field validation
    if (!full_name || !email || !student_id || !phone || !password || !confirm_password) {
      return res.status(400).json({ detail: 'All fields are required.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ detail: 'Password confirmation must match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ detail: 'Password must be at least 6 characters long.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ detail: 'Please enter a valid university email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanStudentId = student_id.trim();

    // Check unique email
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existingEmail) {
      return res.status(400).json({ detail: 'An account with this university email already exists.' });
    }

    // Check unique student id
    const existingSid = db.prepare('SELECT id FROM users WHERE student_id = ?').get(cleanStudentId);
    if (existingSid) {
      return res.status(400).json({ detail: 'An account with this Student ID already exists.' });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    const insert = db.prepare(`
      INSERT INTO users (full_name, email, student_id, phone, password_hash, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);
    const result = insert.run(full_name.trim(), cleanEmail, cleanStudentId, phone.trim(), passwordHash);
    const userId = Number(result.lastInsertRowid);

    const newUser = db.prepare('SELECT id, full_name, email, student_id, phone, profile_photo, created_at, updated_at, is_active FROM users WHERE id = ?').get(userId);

    const token = jwt.sign({ id: userId, email: cleanEmail }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      access_token: token,
      token_type: 'bearer',
      user: newUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ detail: 'Server error during registration.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ detail: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ detail: 'Invalid email or password. Please check your credentials.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ detail: 'Your account has been deactivated.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      student_id: user.student_id,
      phone: user.phone,
      profile_photo: user.profile_photo,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_active: user.is_active === 1,
    };

    return res.json({
      access_token: token,
      token_type: 'bearer',
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ detail: 'Server error during login.' });
  }
});

app.post('/api/auth/logout', (_req, res) => {
  return res.json({ message: 'Successfully logged out.' });
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = db.prepare('SELECT id, full_name, email, student_id, phone, profile_photo, created_at, updated_at, is_active FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!user) {
    return res.status(404).json({ detail: 'User not found.' });
  }
  user.is_active = user.is_active === 1;
  return res.json(user);
});

// --- USER PROFILE ---
app.get('/api/users/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = db.prepare('SELECT id, full_name, email, student_id, phone, profile_photo, created_at, updated_at, is_active FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!user) return res.status(404).json({ detail: 'User not found.' });
  user.is_active = user.is_active === 1;
  return res.json(user);
});

app.put('/api/users/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { full_name, phone, profile_photo } = req.body;
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!current) return res.status(404).json({ detail: 'User not found.' });

  const updatedName = full_name !== undefined ? full_name.trim() : current.full_name;
  const updatedPhone = phone !== undefined ? phone.trim() : current.phone;
  const updatedPhoto = profile_photo !== undefined ? profile_photo : current.profile_photo;

  db.prepare(`
    UPDATE users SET full_name = ?, phone = ?, profile_photo = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(updatedName, updatedPhone, updatedPhoto, req.user!.id);

  const user = db.prepare('SELECT id, full_name, email, student_id, phone, profile_photo, created_at, updated_at, is_active FROM users WHERE id = ?').get(req.user!.id) as any;
  user.is_active = user.is_active === 1;
  return res.json(user);
});

app.put('/api/users/me/password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ detail: 'Current password and new password are required.' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ detail: 'New password must be at least 6 characters long.' });
  }

  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!user || !bcrypt.compareSync(current_password, user.password_hash)) {
    return res.status(400).json({ detail: 'Current password is incorrect.' });
  }

  const newHash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, req.user!.id);

  return res.json({ message: 'Password updated successfully.' });
});

// --- ITEMS ---
app.post('/api/items/lost', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const {
    item_name, category, description, event_date, event_time,
    location, additional_details, contact_phone, contact_email
  } = req.body;

  if (!item_name || !category || !description || !event_date || !location || !contact_phone || !contact_email) {
    return res.status(400).json({ detail: 'Required fields are missing.' });
  }

  const stmt = db.prepare(`
    INSERT INTO items (
      user_id, item_type, item_name, category, description,
      event_date, event_time, location, current_location,
      additional_details, contact_phone, contact_email, status
    ) VALUES (?, 'LOST', ?, ?, ?, ?, ?, ?, null, ?, ?, ?, 'ACTIVE')
  `);

  const result = stmt.run(
    req.user!.id,
    item_name.trim(),
    category.trim(),
    description.trim(),
    event_date,
    event_time || null,
    location.trim(),
    additional_details ? additional_details.trim() : null,
    contact_phone.trim(),
    contact_email.trim()
  );

  const itemId = Number(result.lastInsertRowid);
  const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  newItem.files = [];
  return res.status(201).json(newItem);
});

app.post('/api/items/found', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const {
    item_name, category, description, event_date, event_time,
    location, current_location, additional_details, contact_phone, contact_email
  } = req.body;

  if (!item_name || !category || !description || !event_date || !location || !contact_phone || !contact_email) {
    return res.status(400).json({ detail: 'Required fields are missing.' });
  }

  const stmt = db.prepare(`
    INSERT INTO items (
      user_id, item_type, item_name, category, description,
      event_date, event_time, location, current_location,
      additional_details, contact_phone, contact_email, status
    ) VALUES (?, 'FOUND', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
  `);

  const result = stmt.run(
    req.user!.id,
    item_name.trim(),
    category.trim(),
    description.trim(),
    event_date,
    event_time || null,
    location.trim(),
    current_location ? current_location.trim() : null,
    additional_details ? additional_details.trim() : null,
    contact_phone.trim(),
    contact_email.trim()
  );

  const itemId = Number(result.lastInsertRowid);
  const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  newItem.files = [];
  return res.status(201).json(newItem);
});

// GET My Reports
app.get('/api/items/my-reports', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const items = db.prepare('SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.id) as any[];
  for (const item of items) {
    item.files = db.prepare('SELECT * FROM item_files WHERE item_id = ?').all(item.id);
  }
  return res.json(items);
});

// Search & Filter items
app.get('/api/items', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : null;
    const item_type = req.query.item_type ? String(req.query.item_type).toUpperCase() : null;
    const category = req.query.category && req.query.category !== 'All' ? String(req.query.category) : null;
    const location = req.query.location && req.query.location !== 'All' ? String(req.query.location) : null;
    const status = req.query.status && req.query.status !== 'All' ? String(req.query.status).toUpperCase() : null;
    const date_from = req.query.date_from ? String(req.query.date_from) : null;
    const date_to = req.query.date_to ? String(req.query.date_to) : null;

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '12'), 10)));
    const offset = (page - 1) * limit;

    let whereClauses: string[] = [];
    let params: any[] = [];

    if (q) {
      whereClauses.push('(item_name LIKE ? OR description LIKE ? OR location LIKE ? OR category LIKE ?)');
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (item_type && (item_type === 'LOST' || item_type === 'FOUND')) {
      whereClauses.push('item_type = ?');
      params.push(item_type);
    }

    if (category) {
      whereClauses.push('category = ?');
      params.push(category);
    }

    if (location) {
      whereClauses.push('location = ?');
      params.push(location);
    }

    if (status) {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (date_from) {
      whereClauses.push('event_date >= ?');
      params.push(date_from);
    }

    if (date_to) {
      whereClauses.push('event_date <= ?');
      params.push(date_to);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM items ${whereSql}`;
    const totalRow = db.prepare(countSql).get(...params) as { total: number };
    const total = totalRow.total;

    const selectSql = `
      SELECT * FROM items
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const items = db.prepare(selectSql).all(...params, limit, offset) as any[];

    // Mask direct phone contact for search cards as required in Section 11
    for (const item of items) {
      item.contact_phone = null;
      item.contact_email = null;
      item.files = db.prepare('SELECT * FROM item_files WHERE item_id = ?').all(item.id);
    }

    const total_pages = Math.max(1, Math.ceil(total / limit));

    return res.json({
      items,
      total,
      page,
      limit,
      total_pages,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return res.status(500).json({ detail: 'Failed to retrieve items.' });
  }
});

// Single Item Detail
app.get('/api/items/:item_id', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const itemId = parseInt(req.params.item_id, 10);
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  if (!item) {
    return res.status(404).json({ detail: 'Item not found.' });
  }

  // Files
  item.files = db.prepare('SELECT * FROM item_files WHERE item_id = ?').all(item.id);

  // User poster info
  const poster = db.prepare('SELECT id, full_name, email, student_id, phone, profile_photo FROM users WHERE id = ?').get(item.user_id) as any;
  item.user = poster;

  // Section 11: Only authenticated users can view contact information on item details
  if (!req.user) {
    item.contact_phone = null;
    item.contact_email = null;
  }

  return res.json(item);
});

// Update Item (Ownership check)
app.put('/api/items/:item_id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const itemId = parseInt(req.params.item_id, 10);
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  if (!item) {
    return res.status(404).json({ detail: 'Item not found.' });
  }

  if (item.user_id !== req.user!.id) {
    return res.status(403).json({ detail: 'Forbidden: You can only edit your own reports.' });
  }

  const {
    item_name, category, description, event_date, event_time,
    location, current_location, additional_details, contact_phone, contact_email, status
  } = req.body;

  db.prepare(`
    UPDATE items SET
      item_name = coalesce(?, item_name),
      category = coalesce(?, category),
      description = coalesce(?, description),
      event_date = coalesce(?, event_date),
      event_time = coalesce(?, event_time),
      location = coalesce(?, location),
      current_location = coalesce(?, current_location),
      additional_details = coalesce(?, additional_details),
      contact_phone = coalesce(?, contact_phone),
      contact_email = coalesce(?, contact_email),
      status = coalesce(?, status),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    item_name || null,
    category || null,
    description || null,
    event_date || null,
    event_time || null,
    location || null,
    current_location || null,
    additional_details || null,
    contact_phone || null,
    contact_email || null,
    status || null,
    itemId
  );

  const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  updated.files = db.prepare('SELECT * FROM item_files WHERE item_id = ?').all(itemId);
  return res.json(updated);
});

// Delete Item (Ownership check)
app.delete('/api/items/:item_id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const itemId = parseInt(req.params.item_id, 10);
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  if (!item) {
    return res.status(404).json({ detail: 'Item not found.' });
  }

  if (item.user_id !== req.user!.id) {
    return res.status(403).json({ detail: 'Forbidden: You can only delete your own reports.' });
  }

  // Delete attached files from disk
  const files = db.prepare('SELECT file_path FROM item_files WHERE item_id = ?').all(itemId) as any[];
  for (const f of files) {
    try {
      const fullPath = path.join(process.cwd(), f.file_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    } catch {}
  }

  db.prepare('DELETE FROM items WHERE id = ?').run(itemId);
  return res.json({ message: 'Report deleted successfully.' });
});

// Mark Item Returned (Section 13)
app.patch('/api/items/:item_id/returned', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const itemId = parseInt(req.params.item_id, 10);
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  if (!item) {
    return res.status(404).json({ detail: 'Item not found.' });
  }

  if (item.user_id !== req.user!.id) {
    return res.status(403).json({ detail: 'Forbidden: Only the item reporter can mark this item returned.' });
  }

  db.prepare("UPDATE items SET status = 'RETURNED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(itemId);
  const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  updated.files = db.prepare('SELECT * FROM item_files WHERE item_id = ?').all(itemId);
  return res.json(updated);
});

// Upload File to Item (Section 8)
app.post('/api/items/:item_id/files', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const itemId = parseInt(req.params.item_id, 10);
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  if (!item) {
    return res.status(404).json({ detail: 'Item not found.' });
  }

  if (item.user_id !== req.user!.id) {
    return res.status(403).json({ detail: 'Forbidden: You can only upload files to your own reports.' });
  }

  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ detail: err.message || 'Error uploading file.' });
    }

    if (!req.file) {
      return res.status(400).json({ detail: 'No file provided.' });
    }

    const relPath = `uploads/items/${req.file.filename}`;
    const insert = db.prepare(`
      INSERT INTO item_files (item_id, file_name, file_path, file_type, file_size)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      itemId,
      req.file.originalname,
      relPath,
      req.file.mimetype,
      req.file.size
    );

    const newFile = db.prepare('SELECT * FROM item_files WHERE id = ?').get(Number(result.lastInsertRowid));
    return res.status(201).json(newFile);
  });
});

// Delete Attached File
app.delete('/api/items/:item_id/files/:file_id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const itemId = parseInt(req.params.item_id, 10);
  const fileId = parseInt(req.params.file_id, 10);

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  if (!item) return res.status(404).json({ detail: 'Item not found.' });

  if (item.user_id !== req.user!.id) {
    return res.status(403).json({ detail: 'Forbidden: You can only delete files from your own reports.' });
  }

  const fileRow = db.prepare('SELECT * FROM item_files WHERE id = ? AND item_id = ?').get(fileId, itemId) as any;
  if (!fileRow) return res.status(404).json({ detail: 'File not found.' });

  try {
    const fullPath = path.join(process.cwd(), fileRow.file_path);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch {}

  db.prepare('DELETE FROM item_files WHERE id = ?').run(fileId);
  return res.json({ message: 'File deleted successfully.' });
});

// --- CLAIMS (Section 12) ---
app.post('/api/items/:item_id/claims', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const itemId = parseInt(req.params.item_id, 10);
  const { message } = req.body;

  if (!message || message.trim().length < 10) {
    return res.status(400).json({ detail: 'Verification message must be at least 10 characters explaining why this item is yours.' });
  }

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  if (!item) return res.status(404).json({ detail: 'Item not found.' });

  if (item.user_id === req.user!.id) {
    return res.status(400).json({ detail: 'You cannot submit a claim on an item you reported.' });
  }

  // Check existing pending claim
  const existing = db.prepare('SELECT id FROM claims WHERE item_id = ? AND claimant_id = ? AND status = "PENDING"').get(itemId, req.user!.id);
  if (existing) {
    return res.status(400).json({ detail: 'You already have an active pending claim on this item.' });
  }

  const insert = db.prepare(`
    INSERT INTO claims (item_id, claimant_id, message, status)
    VALUES (?, ?, ?, 'PENDING')
  `);
  const result = insert.run(itemId, req.user!.id, message.trim());
  const newClaim = db.prepare('SELECT * FROM claims WHERE id = ?').get(Number(result.lastInsertRowid)) as any;
  newClaim.claimant = db.prepare('SELECT id, full_name, email, student_id, phone FROM users WHERE id = ?').get(req.user!.id);

  return res.status(201).json(newClaim);
});

app.get('/api/items/:item_id/claims', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const itemId = parseInt(req.params.item_id, 10);
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  if (!item) return res.status(404).json({ detail: 'Item not found.' });

  let claims: any[];
  if (item.user_id === req.user!.id) {
    // Owner sees all claims
    claims = db.prepare('SELECT * FROM claims WHERE item_id = ? ORDER BY created_at DESC').all(itemId) as any[];
  } else {
    // Claimant only sees their claim
    claims = db.prepare('SELECT * FROM claims WHERE item_id = ? AND claimant_id = ? ORDER BY created_at DESC').all(itemId, req.user!.id) as any[];
  }

  for (const c of claims) {
    c.claimant = db.prepare('SELECT id, full_name, email, student_id, phone FROM users WHERE id = ?').get(c.claimant_id);
  }
  return res.json(claims);
});

app.patch('/api/claims/:claim_id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const claimId = parseInt(req.params.claim_id, 10);
  const { status } = req.body;

  if (!status || !['ACCEPTED', 'REJECTED'].includes(status.toUpperCase())) {
    return res.status(400).json({ detail: 'Invalid claim status. Must be ACCEPTED or REJECTED.' });
  }

  const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(claimId) as any;
  if (!claim) return res.status(404).json({ detail: 'Claim not found.' });

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(claim.item_id) as any;
  if (!item || item.user_id !== req.user!.id) {
    return res.status(403).json({ detail: 'Forbidden: Only the item reporter can accept or reject claims.' });
  }

  const targetStatus = status.toUpperCase();
  db.prepare('UPDATE claims SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(targetStatus, claimId);

  if (targetStatus === 'ACCEPTED') {
    db.prepare("UPDATE items SET status = 'MATCHED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(item.id);
  }

  const updatedClaim = db.prepare('SELECT * FROM claims WHERE id = ?').get(claimId) as any;
  updatedClaim.claimant = db.prepare('SELECT id, full_name, email, student_id, phone FROM users WHERE id = ?').get(claim.claimant_id);
  return res.json(updatedClaim);
});

// --- SMART MATCHING (Section 20) ---
function tokenize(text: string): Set<string> {
  if (!text) return new Set();
  const cleaned = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const stopWords = new Set(['the', 'a', 'an', 'is', 'in', 'at', 'of', 'on', 'and', 'or', 'for', 'with', 'my', 'to', 'this', 'it']);
  return new Set(cleaned.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w)));
}

function jaccardSim(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

app.get('/api/items/:item_id/matches', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const itemId = parseInt(req.params.item_id, 10);
  const targetItem = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  if (!targetItem) {
    return res.status(404).json({ detail: 'Item not found.' });
  }

  const oppositeType = targetItem.item_type === 'LOST' ? 'FOUND' : 'LOST';
  const candidates = db.prepare('SELECT * FROM items WHERE item_type = ?').all(oppositeType) as any[];

  const matches: Array<{ item: any; score: number; reasons: string[] }> = [];

  for (const candidate of candidates) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Category match (35 pts)
    if (targetItem.category.trim().toLowerCase() === candidate.category.trim().toLowerCase()) {
      score += 35;
      reasons.push('Same category');
    }

    // 2. Item name similarity (30 pts)
    const tName = targetItem.item_name.trim().toLowerCase();
    const cName = candidate.item_name.trim().toLowerCase();
    const tTokens = tokenize(tName);
    const cTokens = tokenize(cName);
    const nameSim = jaccardSim(tTokens, cTokens);

    if (tName === cName) {
      score += 30;
      reasons.push('Identical item name');
    } else if (tName.includes(cName) || cName.includes(tName)) {
      score += 25;
      reasons.push('Similar item name');
    } else if (nameSim >= 0.4) {
      score += Math.round(nameSim * 25);
      reasons.push('Similar item name');
    } else if (nameSim > 0.1) {
      score += 10;
      reasons.push('Partial name match');
    }

    // 3. Location match (15 pts)
    const tLoc = targetItem.location.trim().toLowerCase();
    const cLoc = candidate.location.trim().toLowerCase();
    if (tLoc === cLoc) {
      score += 15;
      reasons.push('Same location');
    } else if (
      (candidate.description && candidate.description.toLowerCase().includes(tLoc)) ||
      (targetItem.description && targetItem.description.toLowerCase().includes(cLoc))
    ) {
      score += 10;
      reasons.push('Nearby or mentioned location');
    }

    // 4. Date comparison (10 pts)
    try {
      const tDate = new Date(targetItem.event_date).getTime();
      const cDate = new Date(candidate.event_date).getTime();
      const dayDiff = Math.abs(tDate - cDate) / (1000 * 60 * 60 * 24);
      if (dayDiff <= 1) {
        score += 10;
        reasons.push('Same or consecutive date');
      } else if (dayDiff <= 4) {
        score += 7;
        reasons.push('Similar date (within 4 days)');
      } else if (dayDiff <= 7) {
        score += 4;
        reasons.push('Reported within the same week');
      }
    } catch {}

    // 5. Description similarity (10 pts)
    const tDesc = tokenize(targetItem.description);
    const cDesc = tokenize(candidate.description);
    const descSim = jaccardSim(tDesc, cDesc);
    if (descSim >= 0.3) {
      score += 10;
      reasons.push('Similar description keywords');
    } else if (descSim >= 0.15) {
      score += 6;
      reasons.push('Similar description');
    }

    const finalScore = Math.min(100, score);
    if (finalScore >= 30) {
      candidate.files = db.prepare('SELECT * FROM item_files WHERE item_id = ?').all(candidate.id);
      candidate.contact_phone = null;
      candidate.contact_email = null;
      matches.push({
        item: candidate,
        score: finalScore,
        reasons,
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return res.json(matches);
});

// --- VITE MIDDLEWARE & STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Campus Lost & Found] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
