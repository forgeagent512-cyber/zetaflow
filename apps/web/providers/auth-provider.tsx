"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/use-auth";
import type { AuthUser } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading, setUser, setIsLoading, logout } =
    useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("buildagent-token");
        if (token) {
          // Future: validate token with API
        }
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [setIsLoading, logout]);

  const login = async (email: string, password: string) => {
    // Future: implement API login
    console.log("Login:", email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    // Future: implement API signup
    console.log("Signup:", email, password, name);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}