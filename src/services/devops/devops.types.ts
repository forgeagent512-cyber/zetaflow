export interface WhiteLabelSettings {
  id?: string;
  organizationId: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  customDomain?: string;
  customEmailDomain?: string;
  loginBackground?: string;
  loginLogo?: string;
  footerText?: string;
  footerLinks?: Record<string, any>;
  hideBranding?: boolean;
  customCss?: string;
  customJs?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeploymentConfig {
  id?: string;
  organizationId: string;
  name: string;
  type: 'railway' | 'docker' | 'vps' | 'n8n' | 'database' | 'storage';
  status: 'pending' | 'deploying' | 'running' | 'paused' | 'failed' | 'stopped';
  version?: string;
  environment?: 'production' | 'staging' | 'development';
  config?: Record<string, any>;
  url?: string;
  region?: string;
  healthStatus?: string;
  lastHealthCheck?: string;
}

export interface ProvisioningRequest {
  organizationId: string;
  plan: string;
  features?: string[];
  whiteLabel?: boolean;
}

export interface ProvisioningStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  steps: Array<{name: string; status: string; completedAt?: string}>;
  currentStep: number;
  progress: number;
  error?: string;
}

export interface MonitoringMetric {
  metricType: 'cpu' | 'ram' | 'disk' | 'queue' | 'database' | 'api' | 'workers' | 'deployments' | 'errors' | 'latency' | 'health';
  value: number;
  unit: string;
  tags?: Record<string, any>;
  recordedAt?: string;
}

export interface SystemHealth {
  component: 'overall' | 'provider' | 'deployment' | 'billing' | 'database' | 'queue' | 'worker';
  status: 'healthy' | 'degraded' | 'error';
  message?: string;
  metrics?: Record<string, any>;
}

export interface FeatureFlag {
  id?: string;
  name: string;
  key: string;
  description?: string;
  isEnabled: boolean;
  isBeta?: boolean;
  organizations?: string[];
}

export interface LicenseData {
  id?: string;
  organizationId: string;
  licenseKey: string;
  plan: string;
  status: 'active' | 'expired' | 'revoked' | 'suspended';
  seats?: number;
  features?: string[];
  validFrom?: string;
  validUntil?: string;
  autoRenew?: boolean;
  lastValidated?: string;
}

export interface BackupRecord {
  id?: string;
  organizationId: string;
  type: 'auto_daily' | 'auto_weekly' | 'auto_monthly' | 'manual';
  status: 'running' | 'completed' | 'failed';
  sizeBytes?: number;
  location?: string;
  includes?: string[];
  version?: string;
  checksum?: string;
}

export interface NotificationData {
  channel: 'email' | 'dashboard' | 'slack' | 'discord' | 'whatsapp' | 'telegram' | 'webhook';
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditLogEntry {
  userId: string;
  organizationId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity?: 'info' | 'warn' | 'critical';
}
