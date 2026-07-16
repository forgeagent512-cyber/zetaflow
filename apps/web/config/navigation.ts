import type { NavigationItem } from "@/types";

export const publicNavigation: NavigationItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Pricing", href: "/pricing", icon: "dollar-sign" },
  { label: "Automation Store", href: "/automation-store", icon: "store" },
  { label: "Industries", href: "/industries", icon: "building" },
  { label: "Documentation", href: "/documentation", icon: "book-open" },
  { label: "Enterprise", href: "/enterprise", icon: "building-2" },
  { label: "Contact", href: "/contact", icon: "mail" },
];

export const dashboardNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
  { label: "Projects", href: "/dashboard/projects", icon: "folder" },
  { label: "Employees", href: "/dashboard/employees", icon: "users" },
  { label: "Agents", href: "/dashboard/agents", icon: "bot" },
  { label: "Automations", href: "/dashboard/automations", icon: "workflow" },
  { label: "Store", href: "/dashboard/automation-store", icon: "shopping-cart" },
  { label: "Deployments", href: "/dashboard/automation-store/deployments", icon: "rocket" },
  { label: "My Purchases", href: "/dashboard/automation-store/purchases", icon: "dollar-sign" },
  { label: "Build Wizard", href: "/dashboard/automation-store/build-wizard", icon: "wand" },
  { label: "Billing", href: "/dashboard/billing", icon: "credit-card" },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: "settings",
    children: [
      { label: "General", href: "/dashboard/settings", icon: "settings" },
      { label: "Team", href: "/dashboard/settings/team", icon: "users" },
      { label: "API Keys", href: "/dashboard/settings/api-keys", icon: "key" },
    ],
  },
];

export const adminNavigation: NavigationItem[] = [
  // Platform Management
  { label: "Admin Dashboard", href: "/dashboard/admin", icon: "layout-dashboard" },
  { label: "Organizations", href: "/dashboard/admin/organization-manager", icon: "building" },
  { label: "Client Management", href: "/dashboard/admin/client-management", icon: "users" },
  { label: "Deployment Manager", href: "/dashboard/admin/deployment-manager", icon: "rocket" },
  { label: "Provisioning", href: "/dashboard/admin/provisioning", icon: "zap" },
  { label: "White Label", href: "/dashboard/admin/white-label", icon: "flag" },
  // AI Engine
  { label: "Model Router", href: "/dashboard/admin/model-router", icon: "cpu" },
  { label: "AI Playground", href: "/dashboard/admin/ai-playground", icon: "wand" },
  { label: "Prompt Manager", href: "/dashboard/admin/prompt-manager", icon: "file-text" },
  { label: "Provider Health", href: "/dashboard/admin/provider-health", icon: "activity" },
  { label: "Cost Dashboard", href: "/dashboard/admin/cost-dashboard", icon: "dollar-sign" },
  { label: "Knowledge Manager", href: "/dashboard/admin/knowledge-manager", icon: "book-open" },
  { label: "Memory Manager", href: "/dashboard/admin/memory-manager", icon: "database" },
  // SEO & Marketing
  { label: "SEO Center", href: "/dashboard/admin/seo", icon: "globe" },
  { label: "GEO Center", href: "/dashboard/admin/geo", icon: "search" },
  { label: "AEO Center", href: "/dashboard/admin/aeo", icon: "help-circle" },
  { label: "Content Studio", href: "/dashboard/admin/content-studio", icon: "pen-square" },
  { label: "Blog CMS", href: "/dashboard/admin/blog-cms", icon: "file-text" },
  { label: "Marketing Center", href: "/dashboard/admin/marketing-center", icon: "megaphone" },
  // DevOps & Security
  { label: "Monitoring", href: "/dashboard/admin/monitoring", icon: "activity" },
  { label: "Security", href: "/dashboard/admin/security", icon: "shield" },
  { label: "Credential Vault", href: "/dashboard/admin/credential-vault", icon: "lock" },
  { label: "API Keys", href: "/dashboard/admin/api-keys", icon: "key" },
  { label: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: "clipboard-list" },
  { label: "Backups", href: "/dashboard/admin/backup-manager", icon: "hard-drive" },
  { label: "Notifications", href: "/dashboard/admin/notifications", icon: "bell" },
  // Enterprise
  { label: "License Manager", href: "/dashboard/admin/license-manager", icon: "key" },
  { label: "Feature Flags", href: "/dashboard/admin/feature-flags", icon: "flag" },
  { label: "Launch Center", href: "/dashboard/admin/launch-center", icon: "rocket" },
  { label: "Import & Export", href: "/dashboard/admin/import-export", icon: "upload" },
  // CMS
  { label: "Website CMS", href: "/dashboard/admin/website-cms", icon: "globe" },
  { label: "Automation Store CMS", href: "/dashboard/admin/automation-store-cms", icon: "shopping-cart" },
  { label: "Pricing CMS", href: "/dashboard/admin/pricing-cms", icon: "dollar-sign" },
  { label: "Billing Admin", href: "/dashboard/admin/billing-admin", icon: "credit-card" },
  { label: "Plans Manager", href: "/dashboard/admin/plans-manager", icon: "file-text" },
  { label: "Theme Manager", href: "/dashboard/admin/theme-manager", icon: "palette" },
  { label: "Media Library", href: "/dashboard/admin/media-library", icon: "image" },
  { label: "Docs CMS", href: "/dashboard/admin/docs-cms", icon: "book-open" },
  { label: "Navigation Builder", href: "/dashboard/admin/nav-builder", icon: "menu" },
  { label: "Forms Builder", href: "/dashboard/admin/forms-builder", icon: "clipboard-list" },
  { label: "Email Templates", href: "/dashboard/admin/template-manager", icon: "file-text" },
  { label: "Announcements", href: "/dashboard/admin/announcements", icon: "megaphone" },
  { label: "Version Control", href: "/dashboard/admin/version-control", icon: "git-branch" },
  { label: "Template Engine", href: "/dashboard/admin/template-engine", icon: "sparkles" },
  { label: "Admin Templates", href: "/dashboard/admin/admin-templates", icon: "file-text" },
  { label: "Store Admin", href: "/dashboard/admin/store-admin", icon: "settings" },
  { label: "Build Wizard", href: "/dashboard/admin/build-wizard", icon: "wand" },
  { label: "Publish to Store", href: "/dashboard/admin/publish-to-store", icon: "globe" },
  { label: "Analytics", href: "/dashboard/admin/analytics", icon: "bar-chart-3" },
  { label: "Settings", href: "/dashboard/admin/settings", icon: "settings" },
];

export const clientNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
  { label: "Employees", href: "/dashboard/employees", icon: "users" },
  { label: "Agents", href: "/dashboard/agents", icon: "bot" },
  { label: "Automations", href: "/dashboard/automations", icon: "workflow" },
  { label: "SEO", href: "/dashboard/seo", icon: "globe" },
  { label: "Content", href: "/dashboard/content", icon: "pen-square" },
  { label: "Campaigns", href: "/dashboard/campaigns", icon: "megaphone" },
  { label: "Knowledge", href: "/dashboard/knowledge", icon: "book-open" },
  { label: "Deployments", href: "/dashboard/deployments", icon: "rocket" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "bar-chart-3" },
  { label: "Support", href: "/dashboard/support", icon: "life-buoy" },
];