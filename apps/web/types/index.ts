export type { UserRole, AuthUser, AuthTokens, AuthResponse, LoginCredentials, RegisterCredentials, ResetPasswordData, SessionData } from "./auth";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: PlanTier;
  createdAt: string;
  updatedAt: string;
}

export type PlanTier = "free" | "starter" | "professional" | "enterprise";

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "active" | "archived" | "draft";

export interface Employee {
  id: string;
  name: string;
  role: string;
  status: EmployeeStatus;
  avatar?: string;
  projectId: string;
  createdAt: string;
}

export type EmployeeStatus = "active" | "idle" | "error" | "offline";

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  status: AgentStatus;
  projectId: string;
  createdAt: string;
}

export type AgentType = "chat" | "workflow" | "analysis" | "generator" | "custom";
export type AgentStatus = "running" | "stopped" | "error" | "deploying";

export interface Automation {
  id: string;
  name: string;
  description: string;
  status: AutomationStatus;
  trigger: string;
  projectId: string;
  createdAt: string;
}

export type AutomationStatus = "active" | "inactive" | "draft" | "error";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  popular: boolean;
  installs: number;
  rating: number;
}

export interface Deployment {
  id: string;
  name: string;
  status: DeploymentStatus;
  environment: "production" | "staging" | "development";
  version: string;
  projectId: string;
  createdAt: string;
}

export type DeploymentStatus = "deploying" | "running" | "failed" | "stopped";

export interface AnalyticsMetric {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down";
}

export interface Breadcrumb {
  label: string;
  href: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: PaginationMeta;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavigationItem[];
}

export type Invoice = import("./billing").Invoice;

export type {
  PaymentProvider, BillingInterval, SubscriptionStatus, InvoiceStatus, QuoteStatus,
  UsageMetricType, LimitLevel, TaxType, CouponType, AddOnType,
  BillingPlan, PlanLimits, Subscription, AddOnPurchase,
  Invoice as BillingInvoice, InvoiceLineItem,
  Quote, Quote as BillingQuote, QuoteLineItem,
  UsageRecord, UsageSummary, Coupon, PaymentMethod, PaymentTransaction,
  PaymentWebhook, AICostRecord, AICostSummary, BillingSettings,
} from "./billing";
export { BILLING_PLANS, ADDON_PRICING } from "./billing";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}
