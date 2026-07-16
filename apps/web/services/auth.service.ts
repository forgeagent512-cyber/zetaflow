import { apiClient } from "@/services/api/client";
import type { AuthResponse, LoginCredentials, RegisterCredentials, ResetPasswordData, AuthUser } from "@/types";

class AuthService {
  private readonly basePath = "/api/auth";

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${this.basePath}/login`, {
      email: credentials.email,
      password: credentials.password,
    });
    return response.data;
  }

  async register(data: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${this.basePath}/register`, data);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${this.basePath}/refresh`, { refreshToken });
    return response.data;
  }

  async logout(refreshToken?: string): Promise<void> {
    await apiClient.post(`${this.basePath}/logout`, { refreshToken });
  }

  async getMe(): Promise<AuthUser> {
    const response = await apiClient.get<{ success: boolean; data: AuthUser }>(`${this.basePath}/me`);
    return response.data.data;
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(`${this.basePath}/forgot-password`, { email });
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    await apiClient.post(`${this.basePath}/reset-password`, data);
  }

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post(`${this.basePath}/verify-email`, { token });
  }

  async googleLogin(): Promise<void> {
    const response = await apiClient.get<{ url: string }>(`${this.basePath}/google`);
    window.location.href = response.data.url;
  }

  async githubLogin(): Promise<void> {
    const response = await apiClient.get<{ url: string }>(`${this.basePath}/github`);
    window.location.href = response.data.url;
  }

  handleOAuthCallback(code: string, provider: "google" | "github"): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(`${this.basePath}/oauth/callback`, { code, provider }).then((r) => r.data);
  }
}

export const authService = new AuthService();
