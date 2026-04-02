"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthUser, UserRole } from "@/lib/types";
import { jwtDecode } from "jwt-decode";
import {
  authLogin,
  authLogout,
  authRegister,
  clearSession,
  getStoredSession,
  refreshAccessToken,
  scheduleTokenRefresh,
} from "@/lib/api";

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    orgName?: string;
    orgId?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  hasMinRole: (role: UserRole) => boolean;
};

const roleOrder: UserRole[] = ["user", "moderator", "admin"];

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  const handleSessionInvalid = useCallback(() => {
    clearSession();
    setUser(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    let cancelRefresh: (() => void) | undefined;

    async function init() {
      const s = getStoredSession();
      if (!s) {
        setReady(true);
        return;
      }

      setUser(s.user);

      try {
        const exp = jwtDecode<{ exp?: number }>(s.accessToken).exp;
        const stale = !exp || exp * 1000 < Date.now() + 90_000;
        if (stale) {
          await refreshAccessToken();
          const updated = getStoredSession();
          if (updated) setUser(updated.user);
        }
      } catch {
        clearSession();
        setUser(null);
      }

      setReady(true);
      cancelRefresh = scheduleTokenRefresh(handleSessionInvalid);
    }

    void init();
    return () => cancelRefresh?.();
  }, [handleSessionInvalid]);

  const login = useCallback(
    async (email: string, password: string) => {
      const u = await authLogin({ email, password });
      setUser(u);
      scheduleTokenRefresh(handleSessionInvalid);
    },
    [handleSessionInvalid],
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      orgName?: string;
      orgId?: string;
    }) => {
      const u = await authRegister(input);
      setUser(u);
      scheduleTokenRefresh(handleSessionInvalid);
    },
    [handleSessionInvalid],
  );

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
    router.push("/");
  }, [router]);

  const hasMinRole = useCallback(
    (role: UserRole) => {
      if (!user) return false;
      return roleOrder.indexOf(user.role) >= roleOrder.indexOf(role);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      hasMinRole,
    }),
    [user, ready, login, register, logout, hasMinRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
