"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth";
import { authService } from "@/services/auth.service";
import { injectAuthDeps } from "@/services/api/client";
import type { LoginCredentials, RegisterCredentials } from "@/types";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const { user, tokens, isAuthenticated, isLoading, setSession, setTokens, setIsLoading, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    injectAuthDeps(
      () => {
        storeLogout();
        router.push("/login");
      },
      () => useAuthStore.getState().tokens?.accessToken ?? null,
      async () => {
        const refreshToken = useAuthStore.getState().tokens?.refreshToken;
        if (!refreshToken) return null;
        try {
          const response = await authService.refreshToken(refreshToken);
          if (response.success && response.data) {
            setTokens(response.data.tokens);
            return response.data.tokens.accessToken;
          }
        } catch {
          storeLogout();
        }
        return null;
      }
    );
  }, [router, setTokens, storeLogout]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true);
        const response = await authService.login(credentials);
        if (response.success && response.data) {
          setSession(response.data.user, response.data.tokens);
          toast.success("Welcome back!");
          router.push("/dashboard");
        } else {
          toast.error(response.message || "Login failed");
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Invalid credentials";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [router, setSession, setIsLoading]
  );

  const signup = useCallback(
    async (data: RegisterCredentials) => {
      try {
        setIsLoading(true);
        const response = await authService.register(data);
        if (response.success && response.data) {
          setSession(response.data.user, response.data.tokens);
          toast.success("Account created successfully!");
          router.push("/dashboard");
        } else {
          toast.error(response.message || "Registration failed");
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Registration failed";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [router, setSession, setIsLoading]
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = tokens?.refreshToken;
      await authService.logout(refreshToken);
    } catch {
    } finally {
      storeLogout();
      router.push("/login");
      toast.success("Logged out successfully");
    }
  }, [tokens, storeLogout, router]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      toast.success("Check your email for reset instructions");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send reset email";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const resetPassword = useCallback(
    async (data: { token: string; password: string }) => {
      try {
        setIsLoading(true);
        await authService.resetPassword(data);
        toast.success("Password reset successfully");
        router.push("/login");
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to reset password";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [router, setIsLoading]
  );

  const googleLogin = useCallback(async () => {
    try {
      await authService.googleLogin();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Google login failed";
      toast.error(message);
    }
  }, []);

  const githubLogin = useCallback(async () => {
    try {
      await authService.githubLogin();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "GitHub login failed";
      toast.error(message);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    googleLogin,
    githubLogin,
  };
}
