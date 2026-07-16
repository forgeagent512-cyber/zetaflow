create table if not exists ai_agents (
  id uuid primary key,
  organization_id text not null,
  employee_id text not null,
  agent_name text not null,
  agent_role text not null,
  industry text not null,
  system_prompt text not null,
  agent_json jsonb not null,
  status text not null default 'active',
  version text not null default '1.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_agents_employee_id on ai_agents (employee_id);
create index if not exists idx_ai_agents_organization_id on ai_agents (organization_id);
