export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: "draft" | "published" | "archived";
  sections: CMSSection[];
  seo: SEOData;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CMSSection {
  id: string;
  type: SectionType;
  label: string;
  visible: boolean;
  order: number;
  content: Record<string, unknown>;
  styles: SectionStyles;
}

export type SectionType =
  | "hero"
  | "features"
  | "pricing"
  | "cards"
  | "cta"
  | "timeline"
  | "stats"
  | "faq"
  | "testimonials"
  | "video"
  | "gallery"
  | "partners"
  | "clients"
  | "case-studies"
  | "newsletter"
  | "contact-form"
  | "map"
  | "footer"
  | "custom";

export interface SectionStyles {
  padding: string;
  background: string;
  backgroundColor: string;
  textAlign: "left" | "center" | "right";
  maxWidth: string;
  glassEffect: boolean;
  darkMode?: Record<string, string>;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  schemaMarkup?: string;
}

export interface ThemeConfig {
  brand: BrandConfig;
  colors: ColorConfig;
  typography: TypographyConfig;
  buttons: ButtonConfig;
  effects: EffectConfig;
  layout: LayoutConfig;
  darkMode: DarkModeConfig;
  animations: AnimationConfig;
  cursor: CursorConfig;
}

export interface BrandConfig {
  name: string;
  logo: string;
  favicon: string;
  tagline: string;
}

export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  ring: string;
  gradientPrimary: string;
  gradientSecondary: string;
}

export interface TypographyConfig {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  baseSize: number;
  scale: number;
  headingWeight: number;
  bodyWeight: number;
  letterSpacing: string;
  lineHeight: number;
}

export interface ButtonConfig {
  borderRadius: string;
  paddingX: string;
  paddingY: string;
  fontSize: string;
  fontWeight: number;
  transitionDuration: string;
  variant: "filled" | "outline" | "ghost" | "glass";
}

export interface EffectConfig {
  glassBlur: string;
  glassOpacity: string;
  shadowSize: string;
  shadowOpacity: string;
  borderRadius: string;
  blurStrength: string;
}

export interface LayoutConfig {
  maxWidth: string;
  containerPadding: string;
  sectionGap: string;
  gridGap: string;
}

export interface DarkModeConfig {
  enabled: boolean;
  defaultMode: "light" | "dark";
  primary: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
}

export interface AnimationConfig {
  enablePageTransitions: boolean;
  enableScrollAnimations: boolean;
  enableHoverEffects: boolean;
  duration: string;
  easing: string;
  staggerDelay: number;
}

export interface CursorConfig {
  customCursor: boolean;
  color: string;
  size: number;
  trail: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children: NavItem[];
  order: number;
  visible: boolean;
  roles: string[];
  megaMenu: boolean;
  megaMenuColumns?: NavColumn[];
}

export interface NavColumn {
  id: string;
  title: string;
  items: NavItem[];
}

export interface FooterConfig {
  columns: FooterColumn[];
  bottomText: string;
  showSocialIcons: boolean;
  socialLinks: SocialLink[];
  showNewsletter: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: { label: string; href: string }[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  size: number;
  width?: number;
  height?: number;
  folder: string;
  tags: string[];
  alt: string;
  createdAt: string;
  updatedAt: string;
}

export type MediaType = "image" | "video" | "pdf" | "svg" | "icon" | "lottie" | "spline" | "glb" | "hdr" | "3d" | "other";

export interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
  children: MediaFolder[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  categories: string[];
  tags: string[];
  author: BlogAuthor;
  status: "draft" | "published" | "scheduled";
  publishedAt?: string;
  scheduledAt?: string;
  seo: SEOData;
  readTime: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface DocPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  order: number;
  status: "draft" | "published" | "archived";
  version: number;
  versionHistory: DocVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface DocVersion {
  id: string;
  version: number;
  content: string;
  notes: string;
  createdAt: string;
  author: string;
}

export interface DocCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  icon: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "announcement" | "banner" | "popup" | "maintenance" | "feature-release" | "promotion";
  status: "draft" | "active" | "scheduled" | "expired";
  priority: "low" | "medium" | "high" | "critical";
  placement: "top" | "bottom" | "center" | "sidebar";
  startAt?: string;
  endAt?: string;
  dismissible: boolean;
  linkUrl?: string;
  linkText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormDefinition {
  id: string;
  name: string;
  description: string;
  type: "lead" | "contact" | "booking" | "support" | "newsletter" | "custom";
  fields: FormField[];
  settings: FormSettings;
  status: "draft" | "active" | "archived";
  submissions: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "radio" | "date" | "file" | "hidden";
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
  validation: Record<string, unknown>;
  order: number;
  conditionalLogic?: ConditionalLogic;
}

export interface ConditionalLogic {
  fieldId: string;
  operator: "equals" | "not-equals" | "contains" | "greater-than" | "less-than";
  value: string;
  action: "show" | "hide";
}

export interface FormSettings {
  submitLabel: string;
  successMessage: string;
  redirectUrl?: string;
  sendEmailNotification: boolean;
  notificationEmail?: string;
  storeSubmissions: boolean;
  captchaEnabled: boolean;
  allowedDomains?: string[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailTemplateType;
  subject: string;
  previewText: string;
  content: string;
  variables: string[];
  status: "draft" | "active";
  createdAt: string;
  updatedAt: string;
}

export type EmailTemplateType = "welcome" | "verification" | "password-reset" | "invoice" | "deployment-success" | "deployment-failed" | "marketing" | "newsletter" | "custom";

export interface CMSVersion {
  id: string;
  entityType: "page" | "theme" | "blog" | "doc" | "form" | "email" | "announcement";
  entityId: string;
  version: number;
  data: Record<string, unknown>;
  notes: string;
  author: string;
  createdAt: string;
}

export interface CMSSearchResult {
  id: string;
  type: "page" | "blog" | "media" | "template" | "product" | "doc";
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
}

export type StoreCategory =
  | "ai-employees"
  | "ai-agents"
  | "ai-workflows"
  | "automation-templates"
  | "industry-packs"
  | "business-packs"
  | "voice-ai"
  | "chat-ai"
  | "email-ai"
  | "marketing-ai"
  | "sales-ai"
  | "hr-ai"
  | "finance-ai"
  | "customer-support-ai"
  | "knowledge-bases"
  | "prompt-packs"
  | "mcp-servers"
  | "integrations";

export type ProductLicense = "single-company" | "agency" | "unlimited" | "enterprise";
export type ProductStatus = "draft" | "published" | "archived" | "featured" | "hidden";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type InstallStep = "payment" | "configuration" | "generating" | "deploying" | "success";

export interface ProductPricing {
  oneTime?: number;
  monthly?: number;
  yearly?: number;
  enterpriseQuote: boolean;
  customQuote: boolean;
  maintenance: number;
  currency: string;
}

export interface ProductMedia {
  image: string;
  icon: string;
  screenshots: string[];
  video?: string;
  thumbnail?: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: StoreCategory;
  subcategory: string;
  industry: string[];
  pricing: ProductPricing;
  license: ProductLicense;
  media: ProductMedia;
  features: string[];
  modules: string[];
  integrations: string[];
  supportedApps: string[];
  requirements: string[];
  version: string;
  rating: number;
  reviewCount: number;
  downloadCount: number;
  difficulty: DifficultyLevel;
  setupTime: string;
  estimatedAICost: string;
  developer: string;
  developerWebsite?: string;
  status: ProductStatus;
  featured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  verified: boolean;
  adminReply?: string;
  createdAt: string;
}

export interface ProductVersion {
  version: string;
  notes: string;
  releasedAt: string;
}

export interface StoreDeployment {
  id: string;
  productId: string;
  productName: string;
  productIcon: string;
  status: "installing" | "running" | "paused" | "failed" | "stopped";
  config: Record<string, unknown>;
  logs: DeploymentLog[];
  startedAt: string;
  completedAt?: string;
}

export interface DeploymentLog {
  id: string;
  message: string;
  level: "info" | "warn" | "error";
  timestamp: string;
}

export interface PurchasedProduct {
  id: string;
  productId: string;
  productName: string;
  productIcon: string;
  license: ProductLicense;
  price: number;
  currency: string;
  purchasedAt: string;
  expiresAt?: string;
  deployments: StoreDeployment[];
  updates: number;
}

export interface TemplateMetadata {
  industry: string;
  category: string;
  tags: string[];
  apps: string[];
  difficulty: DifficultyLevel;
  dependencies: string[];
  estimatedSetupTime: string;
  features: string[];
  useCases: string[];
  targetIndustry: string;
  recommendedPlan: string;
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  summary: string;
  description: string;
  thumbnail: string;
  category: StoreCategory;
  industry: string[];
  tags: string[];
  apps: string[];
  difficulty: DifficultyLevel;
  dependencies: string[];
  version: string;
  status: "draft" | "published" | "archived";
  metadata: TemplateMetadata;
  content: Record<string, unknown>;
  importCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface BuildWizardState {
  step: number;
  business: {
    name: string;
    industry: string;
    employees: string;
    country: string;
    language: string;
    timezone: string;
  };
  goals: {
    description: string;
    problems: string[];
    currentSoftware: string[];
    requiredAutomations: string[];
  };
  apps: {
    google: boolean;
    microsoft: boolean;
    hubspot: boolean;
    salesforce: boolean;
    whatsapp: boolean;
    slack: boolean;
    discord: boolean;
    zapier: boolean;
    n8n: boolean;
    crm: boolean;
    erp: boolean;
    customApis: string[];
  };
  choices: {
    aiEmployees: string[];
    aiAgents: string[];
    workflows: string[];
    voice: boolean;
    vision: boolean;
    knowledgeBase: boolean;
  };
  review: {
    estimatedPrice: number;
    estimatedMaintenance: number;
    accepted: boolean;
  };
}

export interface IndustryInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  productCount: number;
  templateCount: number;
}

export const STORE_CATEGORIES: { value: StoreCategory; label: string; description: string }[] = [
  { value: "ai-employees", label: "AI Employees", description: "Full-time AI workforce members" },
  { value: "ai-agents", label: "AI Agents", description: "Autonomous task-completing agents" },
  { value: "ai-workflows", label: "AI Workflows", description: "Pre-built automation workflows" },
  { value: "automation-templates", label: "Automation Templates", description: "Ready-to-use automation blueprints" },
  { value: "industry-packs", label: "Industry Packs", description: "Industry-specific solution bundles" },
  { value: "business-packs", label: "Business Packs", description: "Business function solution bundles" },
  { value: "voice-ai", label: "Voice AI", description: "Voice-powered AI solutions" },
  { value: "chat-ai", label: "Chat AI", description: "Conversational AI solutions" },
  { value: "email-ai", label: "Email AI", description: "Email automation and AI" },
  { value: "marketing-ai", label: "Marketing AI", description: "AI-powered marketing tools" },
  { value: "sales-ai", label: "Sales AI", description: "AI-powered sales solutions" },
  { value: "hr-ai", label: "HR AI", description: "AI for human resources" },
  { value: "finance-ai", label: "Finance AI", description: "AI for finance and accounting" },
  { value: "customer-support-ai", label: "Customer Support AI", description: "AI-powered support solutions" },
  { value: "knowledge-bases", label: "Knowledge Bases", description: "Intelligent knowledge management" },
  { value: "prompt-packs", label: "Prompt Packs", description: "Curated prompt collections" },
  { value: "mcp-servers", label: "MCP Servers", description: "Model Context Protocol servers" },
  { value: "integrations", label: "Integrations", description: "Third-party integrations" },
];

export const INDUSTRIES: IndustryInfo[] = [
  { id: "real-estate", name: "Real Estate", slug: "real-estate", description: "Property and real estate solutions", icon: "Building", color: "#6366f1", productCount: 0, templateCount: 0 },
  { id: "healthcare", name: "Healthcare", slug: "healthcare", description: "Medical and healthcare solutions", icon: "Heart", color: "#ef4444", productCount: 0, templateCount: 0 },
  { id: "education", name: "Education", slug: "education", description: "Educational institution solutions", icon: "GraduationCap", color: "#f59e0b", productCount: 0, templateCount: 0 },
  { id: "restaurants", name: "Restaurants", slug: "restaurants", description: "Food service and restaurant solutions", icon: "UtensilsCrossed", color: "#10b981", productCount: 0, templateCount: 0 },
  { id: "construction", name: "Construction", slug: "construction", description: "Construction and contracting solutions", icon: "HardHat", color: "#f97316", productCount: 0, templateCount: 0 },
  { id: "finance", name: "Finance", slug: "finance", description: "Financial services solutions", icon: "Wallet", color: "#06b6d4", productCount: 0, templateCount: 0 },
  { id: "insurance", name: "Insurance", slug: "insurance", description: "Insurance industry solutions", icon: "Shield", color: "#8b5cf6", productCount: 0, templateCount: 0 },
  { id: "travel", name: "Travel", slug: "travel", description: "Travel and hospitality solutions", icon: "Plane", color: "#3b82f6", productCount: 0, templateCount: 0 },
  { id: "legal", name: "Legal", slug: "legal", description: "Legal services solutions", icon: "Scale", color: "#64748b", productCount: 0, templateCount: 0 },
  { id: "manufacturing", name: "Manufacturing", slug: "manufacturing", description: "Manufacturing industry solutions", icon: "Factory", color: "#84cc16", productCount: 0, templateCount: 0 },
  { id: "retail", name: "Retail", slug: "retail", description: "Retail and e-commerce solutions", icon: "ShoppingBag", color: "#ec4899", productCount: 0, templateCount: 0 },
  { id: "automotive", name: "Automotive", slug: "automotive", description: "Automotive industry solutions", icon: "Car", color: "#14b8a6", productCount: 0, templateCount: 0 },
];
