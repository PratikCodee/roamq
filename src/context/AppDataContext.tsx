import {
  createContext, useCallback, useContext, useMemo, useState, type ReactNode,
} from 'react';
import {
  getPlaces, savePlace, updatePlace, deletePlace,
  getUsers, saveUser, updateUser, deleteUser,
  getBusinesses, saveBusiness, updateBusiness, deleteBusiness,
  getCategories, saveCategory, updateCategory, deleteCategory,
  generateId,
} from '@/store/db';
import type { AppPlace, AppUser, AppBusiness, AppCategory } from '@/store/types';

interface AppDataContextValue {
  // Places
  places:         AppPlace[];
  addPlace:       (p: Omit<AppPlace, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editPlace:      (id: string, patch: Partial<AppPlace>) => void;
  removePlace:    (id: string) => void;
  refreshPlaces:  () => void;

  // Users
  users:          AppUser[];
  addUser:        (u: Omit<AppUser, 'id' | 'createdAt'>) => void;
  editUser:       (id: string, patch: Partial<AppUser>) => void;
  removeUser:     (id: string) => void;
  refreshUsers:   () => void;

  // Businesses
  businesses:     AppBusiness[];
  addBusiness:    (b: Omit<AppBusiness, 'id' | 'createdAt'>) => void;
  editBusiness:   (id: string, patch: Partial<AppBusiness>) => void;
  removeBusiness: (id: string) => void;
  refreshBusinesses: () => void;

  // Categories
  categories:      AppCategory[];
  addCategory:     (name: string) => void;
  renameCategory:  (id: string, name: string) => void;
  removeCategory:  (id: string) => void;
  refreshCategories: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [places,     setPlaces]     = useState<AppPlace[]>(() => getPlaces());
  const [users,      setUsers]      = useState<AppUser[]>(() => getUsers());
  const [businesses, setBusinesses] = useState<AppBusiness[]>(() => getBusinesses());
  const [categories, setCategories] = useState<AppCategory[]>(() => getCategories());

  // ── Places ────────────────────────────────────────────────────────────────
  const addPlace = useCallback((p: Omit<AppPlace, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const place: AppPlace = { ...p, id: generateId(), createdAt: now, updatedAt: now };
    savePlace(place);
    setPlaces(getPlaces());
  }, []);

  const editPlace = useCallback((id: string, patch: Partial<AppPlace>) => {
    updatePlace(id, patch);
    setPlaces(getPlaces());
  }, []);

  const removePlace = useCallback((id: string) => {
    deletePlace(id);
    setPlaces(getPlaces());
  }, []);

  const refreshPlaces = useCallback(() => setPlaces(getPlaces()), []);

  // ── Users ─────────────────────────────────────────────────────────────────
  const addUser = useCallback((u: Omit<AppUser, 'id' | 'createdAt'>) => {
    const user: AppUser = { ...u, id: generateId(), createdAt: new Date().toISOString() };
    saveUser(user);
    setUsers(getUsers());
  }, []);

  const editUser = useCallback((id: string, patch: Partial<AppUser>) => {
    updateUser(id, patch);
    setUsers(getUsers());
  }, []);

  const removeUser = useCallback((id: string) => {
    deleteUser(id);
    setUsers(getUsers());
  }, []);

  const refreshUsers = useCallback(() => setUsers(getUsers()), []);

  // ── Businesses ────────────────────────────────────────────────────────────
  const addBusiness = useCallback((b: Omit<AppBusiness, 'id' | 'createdAt'>) => {
    const biz: AppBusiness = { ...b, id: generateId(), createdAt: new Date().toISOString() };
    saveBusiness(biz);
    setBusinesses(getBusinesses());
  }, []);

  const editBusiness = useCallback((id: string, patch: Partial<AppBusiness>) => {
    updateBusiness(id, patch);
    setBusinesses(getBusinesses());
  }, []);

  const removeBusiness = useCallback((id: string) => {
    deleteBusiness(id);
    setBusinesses(getBusinesses());
  }, []);

  const refreshBusinesses = useCallback(() => setBusinesses(getBusinesses()), []);

  // ── Categories ────────────────────────────────────────────────────────────
  const addCategory = useCallback((name: string) => {
    const cat: AppCategory = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
    };
    saveCategory(cat);
    setCategories(getCategories());
  }, []);

  const renameCategory = useCallback((id: string, name: string) => {
    updateCategory(id, name);
    setCategories(getCategories());
  }, []);

  const removeCategory = useCallback((id: string) => {
    deleteCategory(id);
    setCategories(getCategories());
  }, []);

  const refreshCategories = useCallback(() => setCategories(getCategories()), []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      places, addPlace, editPlace, removePlace, refreshPlaces,
      users, addUser, editUser, removeUser, refreshUsers,
      businesses, addBusiness, editBusiness, removeBusiness, refreshBusinesses,
      categories, addCategory, renameCategory, removeCategory, refreshCategories,
    }),
    [places, users, businesses, categories,
     addPlace, editPlace, removePlace, refreshPlaces,
     addUser, editUser, removeUser, refreshUsers,
     addBusiness, editBusiness, removeBusiness, refreshBusinesses,
     addCategory, renameCategory, removeCategory, refreshCategories],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
