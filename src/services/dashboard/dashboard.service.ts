import type { SupabaseClient } from '@supabase/supabase-js';

export interface ClientDashboardData {
  overview: {
    activeEmployees: number;
    activeWorkflows: number;
    totalDeployments: number;
    monthlyUsage: number;
  };
  recentDeployments: Array<{
    id: string;
    name: string;
    status: string;
    deployedAt: string;
  }>;
  activeEmployees: Array<{
    id: string;
    name: string;
    department: string;
    status: string;
  }>;
  invoices: Array<{
    id: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

export interface AdminDashboardData {
  overview: {
    totalOrganizations: number;
    totalUsers: number;
    totalRevenue: number;
    totalWorkflows: number;
    totalDeployments: number;
    activeSubscriptions: number;
  };
  recentRegistrations: Array<{
    id: string;
    name: string;
    email: string;
    date: string;
  }>;
  revenueByMonth: Array<{
    month: string;
    amount: number;
  }>;
  topPlans: Array<{
    name: string;
    count: number;
  }>;
}

export class DashboardService {
  async getClientDashboard(supabase: SupabaseClient, organizationId: string): Promise<ClientDashboardData> {
    const [employees, workflows, deployments] = await Promise.all([
      supabase.from('ai_employees').select('id, employee_name, department, status').eq('organization_id', organizationId),
      supabase.from('automation_templates').select('id, template_name, status, created_at').eq('organization_id', organizationId).limit(10),
      supabase.from('workflow_deployments').select('id, deployment_status, created_at').eq('organization_id', organizationId).limit(10),
    ]);

    return {
      overview: {
        activeEmployees: employees.data?.filter(e => e.status === 'active').length ?? 0,
        activeWorkflows: workflows.data?.filter(w => w.status === 'active').length ?? 0,
        totalDeployments: deployments.data?.length ?? 0,
        monthlyUsage: 0,
      },
      recentDeployments: (deployments.data ?? []).map(d => ({ id: d.id, name: d.deployment_status, status: d.deployment_status, deployedAt: d.created_at })),
      activeEmployees: (employees.data ?? []).map(e => ({ id: e.id, name: e.employee_name, department: e.department ?? 'General', status: e.status })),
      invoices: [],
    };
  }

  async getAdminDashboard(supabase: SupabaseClient): Promise<AdminDashboardData> {
    const [orgs, users, workflows, deployments] = await Promise.all([
      supabase.from('organizations').select('id, organization_name, created_at', { count: 'exact' }),
      supabase.from('users').select('id, full_name, email, created_at', { count: 'exact' }),
      supabase.from('automation_templates').select('id', { count: 'exact' }),
      supabase.from('workflow_deployments').select('id', { count: 'exact' }),
    ]);

    return {
      overview: {
        totalOrganizations: orgs.count ?? 0,
        totalUsers: users.count ?? 0,
        totalRevenue: 0,
        totalWorkflows: workflows.count ?? 0,
        totalDeployments: deployments.count ?? 0,
        activeSubscriptions: 0,
      },
      recentRegistrations: (orgs.data ?? []).slice(0, 10).map(o => ({ id: o.id, name: o.organization_name, email: '', date: o.created_at })),
      revenueByMonth: [],
      topPlans: [],
    };
  }
}
