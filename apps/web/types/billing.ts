export type PaymentProvider = "stripe" | "lemon-squeezy" | "payoneer" | "paypal" | "wise" | "bank-transfer" | "crypto";
export type BillingInterval = "monthly" | "yearly" | "one-time" | "custom";
export type SubscriptionStatus = "active" | "trialing" | "past-due" | "paused" | "cancelled" | "expired" | "grace";
export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue" | "cancelled" | "refunded";
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "negotiating" | "converted";
export type UsageMetricType = "workflow-runs" | "ai-requests" | "storage-gb" | "voice-minutes" | "api-calls" | "employees" | "agents" | "automations" | "knowledge-base-size";
export type LimitLevel = "normal" | "warning-80" | "warning-90" | "grace" | "paused";
export type TaxType = "vat" | "gst" | "sales-tax" | "none";
export type CouponType = "percentage" | "fixed";
export type AddOnType = "extra-workflow-runs" | "extra-employees" | "extra-agents" | "extra-storage" | "extra-voice-minutes" | "priority-support";

export interface BillingPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  tier: "starter" | "professional" | "business" | "enterprise";
  monthlyPrice: number;
  yearlyPrice: number;
  featured: boolean;
  limits: PlanLimits;
  features: string[];
}

export interface PlanLimits {
  employees: number;
  agents: number;
  automations: number;
  workflowRuns: number;
  storageGB: number;
  support: "email" | "priority" | "dedicated" | "white-glove";
  updates: boolean;
  maintenance: boolean;
  apiCalls: number;
  voiceMinutes: number;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  interval: BillingInterval;
  provider: PaymentProvider;
  providerSubscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelledAt?: string;
  pausedAt?: string;
  autoRenew: boolean;
  price: number;
  currency: string;
  addOns: AddOnPurchase[];
}

export interface AddOnPurchase {
  type: AddOnType;
  label: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  number: string;
  type: "subscription" | "one-time" | "addon" | "overage" | "quote";
  status: InvoiceStatus;
  amount: number;
  currency: string;
  tax: number;
  taxType: TaxType;
  discount: number;
  couponId?: string;
  subtotal: number;
  total: number;
  items: InvoiceLineItem[];
  customerName: string;
  customerEmail: string;
  companyName: string;
  address?: string;
  dueDate: string;
  issuedAt: string;
  paidAt?: string;
  pdfUrl?: string;
  provider: PaymentProvider;
  providerInvoiceId?: string;
}

export interface InvoiceLineItem {
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  number: string;
  status: QuoteStatus;
  customerName: string;
  customerEmail: string;
  companyName: string;
  items: QuoteLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  notes: string;
  validUntil: string;
  createdAt: string;
  acceptedAt?: string;
  convertedInvoiceId?: string;
}

export interface QuoteLineItem {
  label: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
  type: "one-time" | "monthly" | "yearly";
}

export interface UsageRecord {
  metric: UsageMetricType;
  label: string;
  used: number;
  limit: number;
  unit: string;
}

export interface UsageSummary {
  period: string;
  records: UsageRecord[];
  overage: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  description: string;
  expiresAt?: string;
  maxUses: number;
  currentUses: number;
  planIds: string[];
  productIds: string[];
  active: boolean;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  provider: PaymentProvider;
  type: "card" | "bank" | "wallet" | "crypto";
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

export interface PaymentTransaction {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: "succeeded" | "failed" | "pending" | "refunded";
  failureReason?: string;
  processedAt: string;
}

export interface PaymentWebhook {
  id: string;
  provider: PaymentProvider;
  event: string;
  payload: Record<string, unknown>;
  processed: boolean;
  receivedAt: string;
}

export interface AICostRecord {
  provider: "openai" | "claude" | "gemini" | "groq" | "ollama" | "openrouter";
  model: string;
  costPerRequest: number;
  costPerToken: number;
  totalCost: number;
  totalRequests: number;
  totalTokens: number;
  clientId?: string;
  workflowId?: string;
  date: string;
}

export interface AICostSummary {
  totalCost: number;
  costByProvider: Record<string, number>;
  costByClient: Record<string, number>;
  costByWorkflow: Record<string, number>;
  costByEmployee: Record<string, number>;
  costByAgent: Record<string, number>;
  profitMargin: number;
  period: string;
}

export interface BillingSettings {
  taxType: TaxType;
  taxRate: number;
  currency: string;
  autoInvoiceOverage: boolean;
  gracePeriodDays: number;
  pauseOnExceeded: boolean;
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    slug: "starter",
    description: "For small teams getting started with AI automation.",
    tier: "starter",
    monthlyPrice: 99,
    yearlyPrice: 990,
    featured: false,
    limits: {
      employees: 5,
      agents: 3,
      automations: 10,
      workflowRuns: 5000,
      storageGB: 10,
      support: "email",
      updates: true,
      maintenance: true,
      apiCalls: 10000,
      voiceMinutes: 100,
    },
    features: [
      "Up to 5 AI Employees",
      "Up to 3 AI Agents",
      "10 Active Automations",
      "5,000 Workflow Runs/mo",
      "10 GB Storage",
      "Email Support",
      "Community Access",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    slug: "professional",
    description: "For growing businesses scaling their AI workforce.",
    tier: "professional",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    featured: true,
    limits: {
      employees: 25,
      agents: 15,
      automations: 50,
      workflowRuns: 25000,
      storageGB: 100,
      support: "priority",
      updates: true,
      maintenance: true,
      apiCalls: 100000,
      voiceMinutes: 1000,
    },
    features: [
      "Up to 25 AI Employees",
      "Up to 15 AI Agents",
      "50 Active Automations",
      "25,000 Workflow Runs/mo",
      "100 GB Storage",
      "Priority Support",
      "API Access",
      "Custom Integrations",
    ],
  },
  {
    id: "business",
    name: "Business",
    slug: "business",
    description: "For organizations requiring advanced AI capabilities.",
    tier: "business",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    featured: false,
    limits: {
      employees: 100,
      agents: 50,
      automations: 200,
      workflowRuns: 100000,
      storageGB: 500,
      support: "dedicated",
      updates: true,
      maintenance: true,
      apiCalls: 500000,
      voiceMinutes: 5000,
    },
    features: [
      "Up to 100 AI Employees",
      "Up to 50 AI Agents",
      "200 Active Automations",
      "100,000 Workflow Runs/mo",
      "500 GB Storage",
      "Dedicated Support Manager",
      "SSO & SAML",
      "Audit Logs",
      "Advanced Analytics",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    slug: "enterprise",
    description: "For enterprises needing custom AI solutions at scale.",
    tier: "enterprise",
    monthlyPrice: 0,
    yearlyPrice: 0,
    featured: false,
    limits: {
      employees: 9999,
      agents: 9999,
      automations: 9999,
      workflowRuns: 999999,
      storageGB: 9999,
      support: "white-glove",
      updates: true,
      maintenance: true,
      apiCalls: 9999999,
      voiceMinutes: 99999,
    },
    features: [
      "Unlimited AI Employees",
      "Unlimited AI Agents",
      "Unlimited Automations",
      "Unlimited Workflow Runs",
      "Unlimited Storage",
      "White-Glove Support",
      "Custom SLA",
      "On-Premise Deployment",
      "Dedicated Infrastructure",
      "Custom AI Model Training",
    ],
  },
];

export const ADDON_PRICING: Record<AddOnType, { label: string; unitPrice: number; unit: string }> = {
  "extra-workflow-runs": { label: "Extra Workflow Runs", unitPrice: 0.01, unit: "1,000 runs" },
  "extra-employees": { label: "Extra AI Employees", unitPrice: 49, unit: "per employee" },
  "extra-agents": { label: "Extra AI Agents", unitPrice: 29, unit: "per agent" },
  "extra-storage": { label: "Extra Storage", unitPrice: 5, unit: "per GB" },
  "extra-voice-minutes": { label: "Extra Voice Minutes", unitPrice: 0.02, unit: "per minute" },
  "priority-support": { label: "Priority Support", unitPrice: 199, unit: "per month" },
};
