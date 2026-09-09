import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  getSession, saveSession, clearSession,
  findUserByEmail, findBusinessByEmail,
  getUsers, updateUser,
} from '@/store/db';
import type { Session } from '@/store/db';
import type { UserRole } from '@/store/types';

interface AuthContextValue {
  session: Session | null;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  isAdmin: boolean;
  isCustomer: boolean;
  isBusiness: boolean;
}

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'wrong_password' | 'pending' | 'rejected' };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => getSession());

  const login = useCallback((email: string, password: string): LoginResult => {
    // ── Admin hardcoded check ────────────────────────────────────────────────
    if (email.toLowerCase() === 'admin@roamiq.in') {
      const adminUser = getUsers().find((u) => u.email.toLowerCase() === 'admin@roamiq.in');
      if (!adminUser || adminUser.password !== password) {
        return { ok: false, reason: 'wrong_password' };
      }
      const s: Session = { userId: adminUser.id, role: 'admin', name: adminUser.name, email: adminUser.email };
      saveSession(s);
      setSession(s);
      return { ok: true };
    }

    // ── Customer lookup ──────────────────────────────────────────────────────
    const user = findUserByEmail(email);
    if (user) {
      if (user.password !== password) return { ok: false, reason: 'wrong_password' };
      if (user.role !== 'customer') {
        if (user.status === 'pending')  return { ok: false, reason: 'pending' };
        if (user.status === 'rejected') return { ok: false, reason: 'rejected' };
      } else if (user.status !== 'approved') {
        // Auto-approve existing customer accounts
        user.status = 'approved';
        updateUser(user.id, { status: 'approved' });
      }
      const s: Session = { userId: user.id, role: user.role as UserRole, name: user.name, email: user.email };
      saveSession(s);
      setSession(s);
      return { ok: true };
    }

    // ── Business lookup ──────────────────────────────────────────────────────
    const biz = findBusinessByEmail(email);
    if (biz) {
      // Business password is stored in business record (set during registration)
      // We check it from users store (business owner has a user record)
      // For businesses we stored a user record too during registration:
      const bizUser = getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase() && u.role === 'business');
      if (!bizUser || bizUser.password !== password) return { ok: false, reason: 'wrong_password' };
      if (biz.status === 'pending')  return { ok: false, reason: 'pending' };
      if (biz.status === 'rejected') return { ok: false, reason: 'rejected' };
      const s: Session = { userId: bizUser.id, role: 'business', name: biz.businessName, email: biz.email };
      saveSession(s);
      setSession(s);
      return { ok: true };
    }

    return { ok: false, reason: 'not_found' };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      login,
      logout,
      isAdmin:    session?.role === 'admin',
      isCustomer: session?.role === 'customer',
      isBusiness: session?.role === 'business',
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
