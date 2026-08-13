"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { ROLE } from "@/domain/enums";
import type { Role, User } from "@/domain/types";

interface AuthState {
  user: User | null;
  roles: Role[];
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (user: User, roles: Role[]) => void;
  signOut: () => void;
  hasRole: (role: Role) => boolean;
  canAccessWorkspace: (workspace: "candidate" | "recruiter" | "admin") => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "tm-auth-session";

type Session = { user: User; roles: Role[] } | null;

let currentSession: Session = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  currentSession = readSession();
}

function readSession(): Session {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Session {
  return currentSession;
}

function emit() {
  for (const listener of listeners) listener();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  const session = useSyncExternalStore(
    (onStoreChange) => {
      setLoading(false);
      return subscribe(onStoreChange);
    },
    getSnapshot,
    () => null,
  );

  const signIn = useCallback((user: User, roles: Role[]) => {
    const next = { user, roles };
    currentSession = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
    emit();
  }, []);

  const signOut = useCallback(() => {
    currentSession = null;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    emit();
  }, []);

  const value = useMemo<AuthState>(() => {
    const roles = session?.roles ?? [];
    return {
      user: session?.user ?? null,
      roles,
      isAuthenticated: Boolean(session),
      loading,
      signIn,
      signOut,
      hasRole: (role: Role) => roles.includes(role),
      canAccessWorkspace: (workspace: "candidate" | "recruiter" | "admin") => {
        switch (workspace) {
          case "candidate":
            return roles.includes(ROLE.CANDIDATE);
          case "recruiter":
            return roles.includes(ROLE.RECRUITER) || roles.includes(ROLE.HIRING_MANAGER);
          case "admin":
            return roles.includes(ROLE.ADMIN);
          default:
            return false;
        }
      },
    };
  }, [session, loading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
