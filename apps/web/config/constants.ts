export const APP_NAME = "BUILDAGENT";
export const APP_TAGLINE = "Build. Deploy. Scale. Intelligence.";
export const APP_DESCRIPTION = "Enterprise AI Workforce Operating System";

export const PAGES = {
  HOME: "/",
  PRICING: "/pricing",
  AUTOMATION_STORE: "/automation-store",
  INDUSTRIES: "/industries",
  DOCUMENTATION: "/documentation",
  ENTERPRISE: "/enterprise",
  CONTACT: "/contact",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  DASHBOARD: "/dashboard",
  PROJECTS: "/dashboard/projects",
  EMPLOYEES: "/dashboard/employees",
  AGENTS: "/dashboard/agents",
  AUTOMATIONS: "/dashboard/automations",
  TEMPLATES: "/dashboard/templates",
  DEPLOYMENTS: "/dashboard/deployments",
  ANALYTICS: "/dashboard/analytics",
  BILLING: "/dashboard/billing",
  SETTINGS: "/dashboard/settings",
  ADMIN: "/dashboard/admin",
  // Sprint 5 - AI Orchestrator
  AI_PLAYGROUND: "/dashboard/admin/ai-playground",
  MODEL_ROUTER: "/dashboard/admin/model-router",
  PROMPT_MANAGER: "/dashboard/admin/prompt-manager",
  PROVIDER_HEALTH: "/dashboard/admin/provider-health",
  COST_DASHBOARD: "/dashboard/admin/cost-dashboard",
  KNOWLEDGE_MANAGER: "/dashboard/admin/knowledge-manager",
  MEMORY_MANAGER: "/dashboard/admin/memory-manager",
  // Sprint 6 - SEO & Marketing
  SEO: "/dashboard/admin/seo",
  GEO: "/dashboard/admin/geo",
  AEO: "/dashboard/admin/aeo",
  CONTENT_STUDIO: "/dashboard/admin/content-studio",
  MARKETING_CENTER: "/dashboard/admin/marketing-center",
  // Sprint 7 - DevOps
  ORGANIZATIONS: "/dashboard/admin/organizations",
  PROVISIONING: "/dashboard/admin/provisioning",
  WHITE_LABEL: "/dashboard/admin/white-label",
  MONITORING: "/dashboard/admin/monitoring",
  SECURITY: "/dashboard/admin/security",
  CREDENTIAL_VAULT: "/dashboard/admin/credential-vault",
  API_KEYS: "/dashboard/admin/api-keys",
  AUDIT_LOGS: "/dashboard/admin/audit-logs",
  BACKUPS: "/dashboard/admin/backups",
  NOTIFICATIONS: "/dashboard/admin/notifications",
  LICENSE_MANAGER: "/dashboard/admin/license-manager",
  FEATURE_FLAGS: "/dashboard/admin/feature-flags",
  LAUNCH_CENTER: "/dashboard/admin/launch-center",
  IMPORT_EXPORT: "/dashboard/admin/import-export",
  // Client Pages
  CLIENT_SEO: "/dashboard/seo",
  CLIENT_CONTENT: "/dashboard/content",
  CLIENT_CAMPAIGNS: "/dashboard/campaigns",
  CLIENT_KNOWLEDGE: "/dashboard/knowledge",
  CLIENT_DEPLOYMENTS: "/dashboard/deployments",
  CLIENT_SUPPORT: "/dashboard/support",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100],
} as const;

export const THEME = {
  STORAGE_KEY: "buildagent-theme",
  DEFAULT_THEME: "dark",
} as const;