"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, ApiError } from "@/lib/api";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/auth";
import type { User } from "@/lib/types";

const DEFAULT_EMAIL = process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL || "default@zoomclone.dev";
const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_DEFAULT_USER_PASSWORD || "DefaultPass123!";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  loginAsDefaultUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loginAsDefaultUser() {
    const res = await api.login(DEFAULT_EMAIL, DEFAULT_PASSWORD);
    setStoredToken(res.access_token);
    setUser(res.user);
  }

  useEffect(() => {
    async function resolveAuth() {
      const token = getStoredToken();
      if (token) {
        try {
          const me = await api.me();
          setUser(me);
          setIsLoading(false);
          return;
        } catch {
          clearStoredToken();
        }
      }

      try {
        await loginAsDefaultUser();
      } catch (err) {
        console.error("Failed to auto-login as default user", err);
      } finally {
        setIsLoading(false);
      }
    }

    resolveAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const res = await api.login(email, password);
    setStoredToken(res.access_token);
    setUser(res.user);
  }

  async function signup(email: string, name: string, password: string) {
    const res = await api.signup(email, name, password);
    setStoredToken(res.access_token);
    setUser(res.user);
  }

  function logout() {
    clearStoredToken();
    setUser(null);
    loginAsDefaultUser().catch((err) => console.error("Failed to fall back to default user", err));
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, loginAsDefaultUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { ApiError };
