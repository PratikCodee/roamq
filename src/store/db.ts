/**
 * db.ts — The ONLY file that touches localStorage.
 * Swap these functions for API calls when connecting a real backend.
 */

import type { AppUser, AppBusiness, AppPlace, AppCategory } from './types';

const KEYS = {
  users:      'roamiq_users',
  businesses: 'roamiq_businesses',
  places:     'roamiq_places',
  categories: 'roamiq_categories',
  session:    'roamiq_session',
  seeded:     'roamiq_seeded',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[localStorage write error for ${key}]: Quota exceeded. Attempting auto-cleanup...`, err);

    // ── Emergency recovery: strip ALL large base64 images across the whole places store ──
    const FALLBACK_IMG = 'https://images.pexels.com/photos/3974375/pexels-photo-3974375.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

    // Strip base64 images in current data
    let cleanedData: T[] = data;
    if (key === KEYS.places) {
      cleanedData = (data as unknown as AppPlace[]).map((p) =>
        p.image && p.image.startsWith('data:') && p.image.length > 100000
          ? { ...p, image: FALLBACK_IMG }
          : p,
      ) as unknown as T[];
    }

    // Also strip base64 images from the existing stored places (not just the current write)
    try {
      const storedRaw = localStorage.getItem(KEYS.places);
      if (storedRaw) {
        const stored = JSON.parse(storedRaw) as AppPlace[];
        const strippedStored = stored.map((p) =>
          p.image && p.image.startsWith('data:') && p.image.length > 100000
            ? { ...p, image: FALLBACK_IMG }
            : p,
        );
        localStorage.setItem(KEYS.places, JSON.stringify(strippedStored));
      }
    } catch (_) { /* ignore if this also fails */ }

    // Retry writing the current data (cleaned)
    try {
      localStorage.setItem(key, JSON.stringify(cleanedData));
      return;
    } catch (e2) {
      console.error('Secondary storage write failed even after cleanup:', e2);
      // Throw so the caller (PlaceEditor handleSave) can show a real error toast
      throw new Error(
        'Storage is full even after cleanup. Please click "Reset Cache" in the Admin header to clear old data, then try again.',
      );
    }
  }
}


export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Seeded flag ──────────────────────────────────────────────────────────────
export function isSeeded(): boolean {
  return localStorage.getItem(KEYS.seeded) === 'true';
}
export function markSeeded(): void {
  localStorage.setItem(KEYS.seeded, 'true');
}
export function resetAll(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

// ─── Users ────────────────────────────────────────────────────────────────────
export function getUsers(): AppUser[] { return read<AppUser>(KEYS.users); }

export function saveUser(user: AppUser): void {
  const list = getUsers();
  list.push(user);
  write(KEYS.users, list);
}

export function updateUser(id: string, patch: Partial<AppUser>): void {
  const list = getUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  write(KEYS.users, list);
}

export function deleteUser(id: string): void {
  write(KEYS.users, getUsers().filter((u) => u.id !== id));
}

export function findUserByEmail(email: string): AppUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function emailExists(email: string): boolean {
  const inUsers = getUsers().some((u) => u.email.toLowerCase() === email.toLowerCase());
  const inBiz   = getBusinesses().some((b) => b.email.toLowerCase() === email.toLowerCase());
  return inUsers || inBiz;
}

// ─── Businesses ───────────────────────────────────────────────────────────────
export function getBusinesses(): AppBusiness[] { return read<AppBusiness>(KEYS.businesses); }

export function saveBusiness(biz: AppBusiness): void {
  const list = getBusinesses();
  list.push(biz);
  write(KEYS.businesses, list);
}

export function updateBusiness(id: string, patch: Partial<AppBusiness>): void {
  const list = getBusinesses().map((b) => (b.id === id ? { ...b, ...patch } : b));
  write(KEYS.businesses, list);
}

export function deleteBusiness(id: string): void {
  write(KEYS.businesses, getBusinesses().filter((b) => b.id !== id));
}

export function findBusinessByEmail(email: string): AppBusiness | undefined {
  return getBusinesses().find((b) => b.email.toLowerCase() === email.toLowerCase());
}

// ─── Seeding Auth Bypass ────────────────────────────────────────────────────────
let isSeedingActive = false;
export function setSeedingActive(active: boolean): void {
  isSeedingActive = active;
}

function requireAdminPermission(): void {
  if (isSeedingActive) return;
  const session = getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized: Only administrators are permitted to create, edit, or delete places and seasonal recommendations.');
  }
}

// ─── Places ───────────────────────────────────────────────────────────────────
export function getPlaces(): AppPlace[] { return read<AppPlace>(KEYS.places); }

export function savePlace(place: AppPlace): void {
  requireAdminPermission();
  const list = getPlaces();
  list.push(place);
  write(KEYS.places, list);
}

export function updatePlace(id: string, patch: Partial<AppPlace>): void {
  requireAdminPermission();
  const list = getPlaces().map((p) =>
    p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
  );
  write(KEYS.places, list);
}

export function deletePlace(id: string): void {
  requireAdminPermission();
  write(KEYS.places, getPlaces().filter((p) => p.id !== id));
}

// ─── Categories ───────────────────────────────────────────────────────────────
export function getCategories(): AppCategory[] { return read<AppCategory>(KEYS.categories); }

export function saveCategory(cat: AppCategory): void {
  const list = getCategories();
  list.push(cat);
  write(KEYS.categories, list);
}

export function updateCategory(id: string, name: string): void {
  const list = getCategories().map((c) => (c.id === id ? { ...c, name } : c));
  write(KEYS.categories, list);
}

export function deleteCategory(id: string): void {
  write(KEYS.categories, getCategories().filter((c) => c.id !== id));
}

// ─── Session ──────────────────────────────────────────────────────────────────
export interface Session {
  userId: string;
  role: 'admin' | 'customer' | 'business';
  name: string;
  email: string;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEYS.session);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(KEYS.session, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(KEYS.session);
}
