import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, AuthTokens, SessionData } from "@/types";

const SESSION_KEY = "buildagent-session";

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (user: AuthUser, tokens: AuthTokens) => void;
  setUser: (user: AuthUser) => void;
  setTokens: (tokens: AuthTokens) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
  getAccessToken: () => string | null;
}

function loadSession(): SessionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: SessionData = JSON.parse(raw);
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function saveSession(user: AuthUser, tokens: AuthTokens): void {
  const session: SessionData = {
    user,
    tokens,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const session = loadSession();

  return {
    user: session?.user ?? null,
    tokens: session?.tokens ?? null,
    isAuthenticated: !!session,
    isLoading: !session,

    setSession: (user, tokens) => {
      saveSession(user, tokens);
      set({ user, tokens, isAuthenticated: true, isLoading: false });
    },

    setUser: (user) => {
      const current = get();
      if (current.tokens) {
        saveSession(user, current.tokens);
      }
      set({ user });
    },

    setTokens: (tokens) => {
      const current = get();
      if (current.user) {
        saveSession(current.user, tokens);
      }
      set({ tokens });
    },

    setIsLoading: (isLoading) => set({ isLoading }),

    logout: () => {
      clearSession();
      set({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
    },

    getAccessToken: () => {
      return get().tokens?.accessToken ?? null;
    },
  };
});
