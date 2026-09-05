"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { formatApiError } from "@/src/lib/utils";
import { User } from "@/src/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; user?: User; error?: string }>;
  register: (payload: { email: string; password: string; name: string; phone?: string }) => Promise<{ ok: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();

    const onExpired = () => {
      setUser(null);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    };

    window.addEventListener("royalcars-auth-expired", onExpired);
    return () => window.removeEventListener("royalcars-auth-expired", onExpired);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post<{ user: User }>("/auth/login", { email, password });
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (e: any) {
      return { ok: false, error: formatApiError(e) };
    }
  };

  const register = async (payload: { email: string; password: string; name: string; phone?: string }) => {
    try {
      const { data } = await api.post<{ user: User }>("/auth/register", payload);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (e: any) {
      return { ok: false, error: formatApiError(e) };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
