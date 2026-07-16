export type UserRole = "public" | "client" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId: string;
  organizationName?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: AuthUser;
    tokens: AuthTokens;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  organizationName?: string;
  industry?: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface SessionData {
  user: AuthUser;
  tokens: AuthTokens;
  expiresAt: number;
}
