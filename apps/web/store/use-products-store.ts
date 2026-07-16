"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoreProduct, ProductStatus } from "@/types/cms";

interface ProductsStore {
  products: StoreProduct[];
  selectedProductId: string | null;
  searchQuery: string;
  selectedCategory: string;
  selectedIndustry: string;
  viewMode: "grid" | "list";
  setProducts: (products: StoreProduct[]) => void;
  addProduct: (product: StoreProduct) => void;
  updateProduct: (id: string, data: Partial<StoreProduct>) => void;
  deleteProduct: (id: string) => void;
  setSelectedProductId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedIndustry: (industry: string) => void;
  setViewMode: (mode: "grid" | "list") => void;
  getProductBySlug: (slug: string) => StoreProduct | undefined;
  getFeatured: () => StoreProduct[];
  getByCategory: (category: string) => StoreProduct[];
  getByIndustry: (industry: string) => StoreProduct[];
  getPopular: () => StoreProduct[];
  getTrending: () => StoreProduct[];
  getRecommended: () => StoreProduct[];
  search: (query: string) => StoreProduct[];
}

const sampleProducts: StoreProduct[] = [
  {
    id: "1",
    name: "Sales Pro AI",
    slug: "sales-pro-ai",
    tagline: "Your 24/7 enterprise sales representative",
    description: "Sales Pro AI is a full-time AI employee that handles end-to-end sales processes. It qualifies leads, sends personalized follow-ups, schedules meetings, and closes deals autonomously. Integrates with your existing CRM and communication tools.",
    category: "sales-ai",
    subcategory: "Sales Representative",
    industry: ["Real Estate", "Finance", "Insurance"],
    pricing: { monthly: 299, yearly: 2990, enterpriseQuote: true, customQuote: false, maintenance: 49, currency: "USD" },
    license: "single-company",
    media: {
      image: "/store/sales-pro-hero.jpg",
      icon: "/store/icons/sales-pro.svg",
      screenshots: ["/store/sales-pro-1.jpg", "/store/sales-pro-2.jpg", "/store/sales-pro-3.jpg"],
      video: "/store/sales-pro-demo.mp4",
    },
    features: [
      "AI-powered lead qualification and scoring",
      "Automated multi-channel follow-up sequences",
      "Smart meeting scheduling with calendar sync",
      "Real-time conversation coaching",
      "Automated proposal generation",
      "Predictive sales analytics dashboard",
      "CRM auto-sync and enrichment",
      "Multi-language sales outreach",
    ],
    modules: ["Lead Engine", "Communication Hub", "Analytics Suite", "CRM Sync", "Proposal Builder"],
    integrations: ["Salesforce", "HubSpot", "Slack", "Google Workspace", "Microsoft 365", "Zoom"],
    supportedApps: ["Salesforce", "HubSpot CRM", "Pipedrive", "Zoho CRM", "Slack", "Google Calendar"],
    requirements: ["Active API key", "CRM access", "Email configuration", "2GB RAM minimum"],
    version: "3.2.0",
    rating: 4.8,
    reviewCount: 342,
    downloadCount: 12890,
    difficulty: "intermediate",
    setupTime: "15 minutes",
    estimatedAICost: "$0.003 per conversation",
    developer: "BUILDAGENT",
    developerWebsite: "https://buildagent.ai",
    status: "published",
    featured: true,
    publishedAt: "2026-01-15T00:00:00Z",
    createdAt: "2025-11-01T00:00:00Z",
    updatedAt: "2026-06-20T00:00:00Z",
  },
  {
    id: "2",
    name: "Customer Support AI",
    slug: "customer-support-ai",
    tagline: "Enterprise-grade AI support team",
    description: "Deploy a complete customer support department powered by AI. Handles tickets, live chat, email support, and phone calls with human-like accuracy. Reduces response time by 90%.",
    category: "customer-support-ai",
    subcategory: "Support Team",
    industry: ["E-commerce", "SaaS", "Healthcare"],
    pricing: { monthly: 199, yearly: 1990, enterpriseQuote: true, customQuote: false, maintenance: 35, currency: "USD" },
    license: "agency",
    media: {
      image: "/store/support-hero.jpg",
      icon: "/store/icons/support.svg",
      screenshots: ["/store/support-1.jpg", "/store/support-2.jpg"],
    },
    features: [
      "24/7 multi-channel support handling",
      "Smart ticket routing and prioritization",
      "Knowledge base auto-suggestion",
      "Sentiment analysis and escalation",
      "Automated response generation",
      "Performance analytics dashboard",
    ],
    modules: ["Ticket System", "Live Chat", "Email Handler", "Phone Agent", "Analytics"],
    integrations: ["Zendesk", "Intercom", "Freshdesk", "Slack", "Email", "Twilio"],
    supportedApps: ["Zendesk", "Intercom", "Freshdesk", "Help Scout", "Slack", "Twilio"],
    requirements: ["Support platform access", "Knowledge base setup", "Phone number (optional)"],
    version: "2.1.0",
    rating: 4.9,
    reviewCount: 567,
    downloadCount: 23400,
    difficulty: "beginner",
    setupTime: "10 minutes",
    estimatedAICost: "$0.002 per interaction",
    developer: "BUILDAGENT",
    developerWebsite: "https://buildagent.ai",
    status: "published",
    featured: true,
    publishedAt: "2026-02-01T00:00:00Z",
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2026-06-18T00:00:00Z",
  },
  {
    id: "3",
    name: "Real Estate AI Pack",
    slug: "real-estate-ai-pack",
    tagline: "Complete AI solution for real estate",
    description: "An industry-specific AI pack covering lead generation, property matching, virtual tours, document processing, and client communication for real estate businesses.",
    category: "industry-packs",
    subcategory: "Real Estate",
    industry: ["Real Estate"],
    pricing: { oneTime: 1499, enterpriseQuote: true, customQuote: true, maintenance: 99, currency: "USD" },
    license: "single-company",
    media: {
      image: "/store/realestate-hero.jpg",
      icon: "/store/icons/realestate.svg",
      screenshots: ["/store/realestate-1.jpg", "/store/realestate-2.jpg", "/store/realestate-3.jpg"],
    },
    features: [
      "AI property matching engine",
      "Automated lead qualification",
      "Virtual tour generation",
      "Document auto-processing",
      "Client communication automation",
      "Market analysis reports",
    ],
    modules: ["Lead Gen", "Property Matcher", "Doc Processor", "Virtual Tours", "Client Hub", "Analytics"],
    integrations: ["MLS", "Salesforce", "Slack", "Google Workspace", "DocuSign"],
    supportedApps: ["MLS", "Zillow", "Realtor.com", "Salesforce", "DocuSign"],
    requirements: ["MLS access", "Property database", "API configuration"],
    version: "1.5.0",
    rating: 4.7,
    reviewCount: 189,
    downloadCount: 5670,
    difficulty: "intermediate",
    setupTime: "30 minutes",
    estimatedAICost: "$0.005 per inquiry",
    developer: "BUILDAGENT",
    status: "published",
    featured: true,
    publishedAt: "2026-03-10T00:00:00Z",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-06-15T00:00:00Z",
  },
  {
    id: "4",
    name: "Workflow Automation Engine",
    slug: "workflow-automation-engine",
    tagline: "Build complex automations without code",
    description: "Enterprise workflow automation engine with 1000+ pre-built templates. Connect any app, automate any process. Features visual builder, conditional logic, and real-time monitoring.",
    category: "automation-templates",
    subcategory: "Workflow Engine",
    industry: ["Technology", "Finance", "Healthcare", "Manufacturing"],
    pricing: { monthly: 499, yearly: 4990, enterpriseQuote: true, customQuote: false, maintenance: 79, currency: "USD" },
    license: "unlimited",
    media: {
      image: "/store/workflow-hero.jpg",
      icon: "/store/icons/workflow.svg",
      screenshots: ["/store/workflow-1.jpg", "/store/workflow-2.jpg", "/store/workflow-3.jpg"],
    },
    features: [
      "Visual workflow builder with drag-and-drop",
      "1000+ pre-built automation templates",
      "Conditional logic and branching",
      "Real-time monitoring and alerts",
      "Error handling and retry logic",
      "API and webhook support",
    ],
    modules: ["Visual Builder", "Template Library", "Monitor", "Scheduler", "API Gateway"],
    integrations: ["Zapier", "n8n", "Slack", "Google", "Microsoft", "Salesforce", "HubSpot"],
    supportedApps: ["All major apps via API"],
    requirements: ["API access for integrations"],
    version: "4.0.0",
    rating: 4.6,
    reviewCount: 891,
    downloadCount: 34500,
    difficulty: "intermediate",
    setupTime: "20 minutes",
    estimatedAICost: "N/A",
    developer: "BUILDAGENT",
    status: "published",
    featured: false,
    publishedAt: "2026-01-01T00:00:00Z",
    createdAt: "2025-09-01T00:00:00Z",
    updatedAt: "2026-06-22T00:00:00Z",
  },
  {
    id: "5",
    name: "Marketing AI Suite",
    slug: "marketing-ai-suite",
    tagline: "Full-stack AI marketing department",
    description: "Deploy a complete AI marketing team: content writer, SEO specialist, social media manager, email marketer, and analytics expert. Works 24/7 across all channels.",
    category: "marketing-ai",
    subcategory: "Marketing Team",
    industry: ["All Industries"],
    pricing: { monthly: 399, yearly: 3990, enterpriseQuote: true, customQuote: false, maintenance: 59, currency: "USD" },
    license: "agency",
    media: {
      image: "/store/marketing-hero.jpg",
      icon: "/store/icons/marketing.svg",
      screenshots: ["/store/marketing-1.jpg", "/store/marketing-2.jpg"],
    },
    features: [
      "AI content generation and optimization",
      "Automated social media management",
      "SEO analysis and recommendations",
      "Email campaign automation",
      "Performance analytics and reporting",
      "Multi-channel campaign orchestration",
    ],
    modules: ["Content Studio", "Social Hub", "SEO Analyzer", "Email Engine", "Analytics"],
    integrations: ["WordPress", "Shopify", "HubSpot", "Mailchimp", "Google Analytics", "Meta"],
    supportedApps: ["WordPress", "Shopify", "HubSpot", "Mailchimp", "Google Analytics", "Meta Ads"],
    requirements: ["Marketing platform access", "Content guidelines"],
    version: "2.3.0",
    rating: 4.5,
    reviewCount: 423,
    downloadCount: 15670,
    difficulty: "beginner",
    setupTime: "15 minutes",
    estimatedAICost: "$0.004 per campaign",
    developer: "BUILDAGENT",
    status: "published",
    featured: true,
    publishedAt: "2026-04-01T00:00:00Z",
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-06-19T00:00:00Z",
  },
  {
    id: "6",
    name: "Knowledge Base AI",
    slug: "knowledge-base-ai",
    tagline: "Intelligent knowledge management",
    description: "AI-powered knowledge base that auto-organizes, updates, and serves information. Supports documents, FAQs, internal wikis, and customer-facing help centers.",
    category: "knowledge-bases",
    subcategory: "Knowledge Management",
    industry: ["All Industries"],
    pricing: { monthly: 149, yearly: 1490, enterpriseQuote: true, customQuote: false, maintenance: 25, currency: "USD" },
    license: "single-company",
    media: {
      image: "/store/kb-hero.jpg",
      icon: "/store/icons/kb.svg",
      screenshots: ["/store/kb-1.jpg", "/store/kb-2.jpg"],
    },
    features: [
      "Auto-categorization and tagging",
      "Semantic search across all content",
      "Automated content updates from sources",
      "Multi-format support (docs, video, links)",
      "Analytics and usage insights",
      "Role-based access control",
    ],
    modules: ["Knowledge Hub", "Search Engine", "Content Manager", "Analytics", "Access Control"],
    integrations: ["Google Drive", "Notion", "Confluence", "Slack", "SharePoint"],
    supportedApps: ["Google Drive", "Notion", "Confluence", "SharePoint", "Slack"],
    requirements: ["Content sources configured"],
    version: "1.8.0",
    rating: 4.4,
    reviewCount: 234,
    downloadCount: 8900,
    difficulty: "beginner",
    setupTime: "10 minutes",
    estimatedAICost: "$0.001 per search query",
    developer: "BUILDAGENT",
    status: "published",
    featured: false,
    publishedAt: "2026-03-15T00:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-06-10T00:00:00Z",
  },
];

export const useProductsStore = create<ProductsStore>()(
  persist(
    (set, get) => ({
      products: sampleProducts,
      selectedProductId: null,
      searchQuery: "",
      selectedCategory: "",
      selectedIndustry: "",
      viewMode: "grid",

      setProducts: (products) => set({ products }),
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deleteProduct: (id) => set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
      setSelectedProductId: (id) => set({ selectedProductId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSelectedIndustry: (industry) => set({ selectedIndustry: industry }),
      setViewMode: (mode) => set({ viewMode: mode }),

      getProductBySlug: (slug) => get().products.find((p) => p.slug === slug),
      getFeatured: () => get().products.filter((p) => p.featured && p.status === "published"),
      getByCategory: (category) => get().products.filter((p) => p.category === category && p.status === "published"),
      getByIndustry: (industry) =>
        get().products.filter((p) => p.industry.includes(industry) && p.status === "published"),
      getPopular: () =>
        [...get().products].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 8),
      getTrending: () =>
        [...get().products]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 8),
      getRecommended: () =>
        get()
          .products.filter((p) => p.status === "published" && p.rating >= 4.5)
          .slice(0, 8),
      search: (query) => {
        const q = query.toLowerCase();
        return get().products.filter(
          (p) =>
            p.status === "published" &&
            (p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.tagline.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.industry.some((i) => i.toLowerCase().includes(q)) ||
              (p as StoreProduct & { tags?: string[] }).tags?.some((t: string) => t.toLowerCase().includes(q)))
        );
      },
    }),
    { name: "buildagent-store-products" }
  )
);
