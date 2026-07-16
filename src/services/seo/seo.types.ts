export interface SEOPageData {
  id?: string;
  organizationId: string;
  url: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  robotsMeta?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  schemaMarkup?: any;
  isIndexed?: boolean;
  seoScore?: number;
  recommendations?: any[];
}

export interface SEOAnalysis {
  score: number;
  title: { content: string; length: number; score: number; issues: string[] };
  description: { content: string; length: number; score: number; issues: string[] };
  keywords: { keywords: string[]; density: number; score: number; issues: string[] };
  headings: { structure: string[]; score: number; issues: string[] };
  images: { count: number; withAlt: number; score: number; issues: string[] };
  links: { internal: number; external: number; broken: number; score: number; issues: string[] };
  performance: { score: number; issues: string[] };
  recommendations: string[];
}

export interface GEOEntity {
  id?: string;
  organizationId: string;
  name: string;
  entityType: string;
  description: string;
  attributes?: Record<string, any>;
  relationships?: Record<string, any>;
  context?: string;
}

export interface AEOContent {
  id?: string;
  organizationId: string;
  contentType: string;
  question: string;
  answer: string;
  schemaMarkup?: any;
  keywords?: string[];
  relatedEntities?: any;
}

export interface BlogPost {
  id?: string;
  organizationId: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId?: string;
  categoryId?: string;
  tags?: string[];
  status: string;
  metaTitle?: string;
  metaDescription?: string;
  seoScore?: number;
}

export interface LandingPage {
  id?: string;
  organizationId: string;
  title: string;
  slug: string;
  industry: string;
  targetAudience: string;
  goal: string;
  heroSection?: any;
  featuresSection?: any;
  ctaSection?: any;
  pricingSection?: any;
  testimonialsSection?: any;
  faqsSection?: any;
  schemaMarkup?: any;
  seoMetadata?: any;
  status: string;
}

export interface SchemaMarkup {
  id?: string;
  organizationId: string;
  schemaType: string;
  name: string;
  content: Record<string, any>;
  pageUrl?: string;
  isActive?: boolean;
}

export interface MarketingCampaign {
  id?: string;
  organizationId: string;
  name: string;
  type: string;
  status: string;
  content?: any;
  audience?: any;
  sentCount?: number;
  openCount?: number;
  clickCount?: number;
  conversionCount?: number;
}

export interface Keyword {
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  opportunityScore?: number;
  intent?: string;
  competition?: number;
  relatedKeywords?: string[];
  questions?: string[];
}
