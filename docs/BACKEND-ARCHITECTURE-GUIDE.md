# AI Real Estate Sales Employee v3.0 — Backend Architecture Guide

> **Codename:** AI Factory  
> **Version:** 3.0  
> **Platform:** Node.js / TypeScript / Express.js  
> **Database:** Supabase (PostgreSQL + pgvector)  
> **AI Gateway:** OpenRouter (with OpenAI, Anthropic, Gemini fallback)  
> **Workflow Engine:** n8n (self-hosted)  
> **Last Updated:** July 2026

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Modules — Core AI Factory](#3-modules--core-ai-factory)
   - 3.1 Business Analyzer
   - 3.2 Employee Generator
   - 3.3 Agent Generator
   - 3.4 Workflow Generator
   - 3.5 Workflow Analyzer
   - 3.6 Prompt Generator
   - 3.7 Knowledge Generator
   - 3.8 QA Engine
   - 3.9 Solution Architect
   - 3.10 Deployment Manager
   - 3.11 Marketplace Publisher
   - 3.12 Integration Manager
4. [API Endpoints](#4-api-endpoints)
5. [Integrations](#5-integrations)
   - 5.1 OpenRouter / AI Providers
   - 5.2 Supabase (PostgreSQL + pgvector)
   - 5.3 n8n Workflow Engine
   - 5.4 Marketplace
   - 5.5 Template Library
   - 5.6 Credential Sync
6. [Communication Flows](#6-communication-flows)
   - 6.1 AI Factory ↔ n8n
   - 6.2 AI Factory ↔ Supabase
   - 6.3 AI Factory ↔ OpenRouter
7. [Complete Customer Journey](#7-complete-customer-journey)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Database Schema](#9-database-schema)
10. [AI Prompts Reference](#10-ai-prompts-reference)
11. [Background Processes](#11-background-processes)
12. [Production Flows](#12-production-flows)
13. [Architecture Diagrams](#13-architecture-diagrams)
14. [Security Assessment & Scores](#14-security-assessment--scores)

---

## 1. Architecture Overview

The AI Factory is a **modular, AI-powered automation platform** that converts natural-language business requirements into fully deployed enterprise automation. It functions as a **generative pipeline**:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Business │───▶│ Solution │───▶│ Employee │───▶│  Agent   │───▶│ Workflow │
│ Analysis │    │Architect │    │ Generator│    │ Generator│    │ Generator│
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └─────┬────┘
                                                                     │
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  Prompt  │◀───│Knowledge │◀───│    QA    │◀───│   Deploy │◀────────┘
│ Generator│    │ Generator│    │  Engine  │    │  Manager │
└──────────┘    └──────────┘    └──────────┘    └─────┬────┘
                                                       │
                                              ┌────────▼────────┐
                                              │  n8n · Supabase │
                                              │  · Marketplace  │
                                              └─────────────────┘
```

**Key design principles:**
- **Separation of concerns** — each AI module has its own service, provider, repository, DTOs, and validators
- **Provider abstraction** — all AI calls go through a unified `AIProvider` interface; actual provider (OpenRouter, OpenAI, Anthropic, Gemini) is swappable at runtime
- **Repository pattern** — data access is abstracted behind `Repository<T>`; implementations can be in-memory (development) or Supabase-backed (production)
- **Pipeline orchestration** — modules are designed to be called sequentially, each building on the previous output
- **Extensibility** — new AI modules, providers, and deployment targets can be added without modifying existing code

---

## 2. Project Structure

```
AI-Real-Estate-Sales-Employee-v3.0/
├── src/
│   ├── ai-factory/                  # Core AI business logic
│   │   ├── index.ts                 # Re-exports all modules
│   │   ├── shared/                  # Shared contracts, repositories, utilities
│   │   │   ├── contracts.ts         # Identifiable, Auditable, AiFactoryRequest/Response
│   │   │   ├── repositories.ts      # Repository<T>, InMemoryRepository<T>
│   │   │   ├── crypto.ts            # AES-256-GCM encryption/decryption
│   │   │   ├── cache.ts             # Simple in-memory cache
│   │   │   ├── semantic-search.ts   # Embedding similarity search
│   │   │   ├── prompt-versioning.ts # Prompt version management
│   │   │   ├── cost-optimizer.ts    # Cost estimation & optimization
│   │   │   └── conversation-memory.ts # Conversation history management
│   │   ├── business-analyzer/       # Business analysis module
│   │   ├── solution-architect/      # Solution architecture design
│   │   ├── employee-generator/      # AI employee definition generation
│   │   ├── agent-generator/         # Multi-agent system generation
│   │   ├── workflow-generator/      # n8n-compatible workflow generation
│   │   ├── prompt-generator/        # AI prompt package generation
│   │   ├── knowledge-generator/     # Knowledge base generation
│   │   ├── qa-engine/              # Quality assurance & validation
│   │   ├── deployment-manager/      # Multi-target deployment orchestration
│   │   ├── workflow-analyzer/       # Existing workflow analysis & indexing
│   │   ├── marketplace-publisher/   # Marketplace listing & publishing
│   │   └── integration-manager/     # Third-party integration management
│   ├── api/                         # Express.js API layer
│   │   ├── server.ts                # Express app setup, middleware, route mounting
│   │   ├── health.ts                # Health check endpoints
│   │   ├── supabase.ts              # Supabase health check
│   │   ├── ai-provider.ts           # AI provider health check
│   │   ├── n8n.ts                   # n8n integration REST endpoints
│   │   ├── marketplace.ts           # Marketplace publish & recommend
│   │   ├── qa-engine.ts             # QA evaluation endpoint
│   │   ├── solution-architect.ts    # Solution architecture endpoint
│   │   ├── template-library.ts      # Template library scan & stats
│   │   ├── admin/import-workflows.ts # Admin workflow import
│   │   └── ai-factory/              # AI Factory route handlers
│   │       ├── business-analyzer.ts
│   │       ├── employee-generator.ts
│   │       ├── agent-generator.ts
│   │       ├── prompt-generator.ts
│   │       ├── knowledge-generator.ts
│   │       ├── deployment-manager.ts
│   │       ├── workflow-analyzer.ts
│   │       ├── template-search.ts
│   │       └── workflow-generate.ts
│   ├── cli/                         # Command-line tools
│   │   ├── analyze-workflows.ts     # CLI: analyze workflow JSON files
│   │   ├── generate-workflow.ts     # CLI: generate a workflow
│   │   ├── import-workflows.ts      # CLI: bulk import workflows
│   │   └── search-workflow.ts       # CLI: search workflow templates
│   └── services/                    # Infrastructure services
│       ├── ai-provider/             # AI provider abstraction layer
│       │   ├── index.ts             # AIProvider interface
│       │   ├── openrouter.ts        # OpenRouter HTTP client
│       │   ├── openai.ts            # OpenAI client (extends OpenRouter)
│       │   ├── anthropic.ts         # Anthropic client (extends OpenRouter)
│       │   ├── gemini.ts            # Gemini client (extends OpenRouter)
│       │   ├── provider-factory.ts  # Singleton provider factory
│       │   ├── model-registry.ts    # Model definitions, costs, fallbacks
│       │   ├── model-selector.ts    # Model selection by criteria
│       │   └── config.ts            # Provider-specific config from env
│       ├── n8n/                     # n8n REST API integration
│       │   ├── index.ts             # N8nClient class
│       │   ├── deployment-service.ts # Workflow deployment wrapper
│       │   ├── credential-sync.ts   # Credential sync service
│       │   └── config.ts            # n8n config from env
│       ├── supabase/                # Supabase database integration
│       │   └── index.ts             # createSupabaseClient(), config
│       └── automation-import/       # Workflow import & continuous learning
│           ├── workflow-import.ts    # WorkflowImportService
│           ├── continuous-learning.ts # ContinuousLearningService
│           └── template-indexer.ts  # TemplateIndexerService
├── database/                        # SQL schema & migration files
├── workflows/                       # 21 n8n workflow JSON templates
├── template-library/                # Template library source files
├── prompts/                         # AI prompt definitions
├── docs/                            # Documentation
├── integrations/                    # Docker, Railway, HuggingFace configs
├── .env                             # Environment configuration
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # Project README
```

---

## 3. Modules — Core AI Factory

### 3.1 Business Analyzer

**Purpose:** Analyze a real estate business or any business domain to identify automation opportunities, AI use cases, and generate a comprehensive digital-transformation roadmap.

**Why it exists:** Before building AI employees or workflows, the platform must understand the customer's business — their industry, departments, pain points, and goals. This module performs that strategic analysis using AI.

**How it works:**
1. Receives `BusinessAnalyzerRequestDto` (industry, businessName, goal, requirements)
2. `BusinessAnalyzerService` creates a validated request context
3. Delegates to `GeminiBusinessAnalyzer` which sends an extensive structured prompt to Gemini API
4. Parses the JSON response into a `BusinessAnalyzerAnalysisDto`
5. `SupabaseBusinessAnalysisRepository` persists the result to the `business_analysis` table
6. Returns `BusinessAnalyzerResponseDto`

**Input DTO:**
```typescript
interface BusinessAnalyzerRequestDto {
  industry: string;          // e.g., "Real Estate"
  businessName: string;      // e.g., "Acme Properties"
  goal: string;              // e.g., "Automate lead follow-up"
  requirements?: string;     // Additional context
}
```

**Output DTO (`BusinessAnalyzerAnalysisDto`):**
- `company_summary` — high-level summary
- `industry` — detected/verified industry
- `department_analysis` — per-department breakdown
- `pain_points` — identified business pain points
- `automation_opportunities` — specific automation candidates
- `ai_opportunities` — AI-specific opportunities
- `suggested_employees` — recommended AI employee types
- `suggested_agents` — recommended AI agent types
- `suggested_workflows` — recommended workflow types
- `suggested_integrations` — recommended third-party integrations
- `kpis` — measurable KPIs
- `roi_estimate` — estimated ROI
- `complexity` — low/medium/high
- `estimated_build_time` — build time estimate
- `estimated_cost` — cost estimate
- `confidence` — AI confidence score

**API:** `POST /api/ai-factory/business-analyzer`

**Database table:** `business_analysis`

**Dependencies:** Gemini AI provider, Supabase repository

**Error handling:** Returns 400 for validation errors, 500 for provider/DB failures.

---

### 3.2 Employee Generator

**Purpose:** Generate a complete AI employee definition from business requirements — including personality, skills, tools, system prompts, integrations, security rules, and KPIs.

**Why it exists:** The core value proposition of the platform is creating AI "employees" that can be deployed to work alongside human teams. This module generates the full specification for such an employee.

**How it works:**
1. Receives `EmployeeGeneratorInputDto`
2. `EmployeeGeneratorService` validates input, checks for duplicates via `SupabaseEmployeeRepository`
3. `PromptBuilder` constructs a detailed prompt based on input parameters
4. `GeminiEmployeeGenerator` calls Gemini API with the prompt, expects 27 structured fields
5. `KnowledgeBuilder` assembles knowledge base requirements
6. `EmployeeSerializer` normalizes the response
7. Saves to database via `SupabaseEmployeeRepository`
8. Returns `EmployeeGeneratorResponseDto`

**Input DTO:**
```typescript
interface EmployeeGeneratorInputDto {
  industry: string;
  automation_type: string;
  business_name?: string;
  requirements?: string;
}
```

**Output DTO (27 fields including):**
- `employee_name`, `department`, `role`, `description`
- `system_prompt` — base system prompt
- `personality` — tone, style, behavior
- `skills`, `goals`, `responsibilities`, `limitations`
- `knowledge_base` — required knowledge references
- `required_tools`, `required_integrations`, `required_agents`, `required_workflows`
- `memory` — memory configuration
- `recommended_models` — preferred AI models
- `openai_settings`, `gemini_settings`, `claude_settings`
- `tools`, `function_calls` — tool definitions
- `vector_search_settings` — RAG configuration
- `security_rules`, `permissions`
- `kpis`, `escalation_rules`

**API:** `POST /api/ai-factory/employee-generator`

**Database table:** `ai_employees`

**Dependencies:** Gemini AI provider, Supabase repository

---

### 3.3 Agent Generator

**Purpose:** Generate a multi-agent system with defined roles, communication plans, hierarchy, and individual agent configurations that work together under a parent AI employee.

**Why it exists:** Complex automation requires specialized agents working together. This module creates the agent team — each with its own prompt, tools, memory, permissions, and communication rules — plus the coordination layer between them.

**How it works:**
1. Receives `AgentGeneratorInputDto`
2. `AgentGeneratorService` validates input
3. `AgentPromptBuilder` constructs a prompt requesting an array of agent configurations
4. `GeminiAgentGenerator` calls Gemini API
5. `AgentValidator` validates the agent collection
6. `CommunicationPlanner` builds inter-agent communication rules
7. `HierarchyBuilder` establishes agent hierarchy
8. Each agent is saved as an individual record
9. Returns `AgentGeneratorResponseDto`

**Input DTO:**
```typescript
interface AgentGeneratorInputDto {
  employee_name: string;
  industry: string;
  department?: string;
  required_workflows?: string[];
  required_integrations?: string[];
  required_tools?: string[];
}
```

**Output DTO (per agent):**
- `agent_name`, `role`, `description`, `system_prompt`
- `goals`, `tools`, `permissions`
- `memory` config, `llm` model assignment
- `trigger_events`, `required_workflows`, `required_integrations`
- `personality`, `communication_rules`
- `error_handling`, `retry_logic`

**API:** `POST /api/ai-factory/agent-generator`

**Database table:** `ai_employees` (agents stored as employee records with agent-type flag)

**Dependencies:** Gemini AI provider, Supabase repository

---

### 3.4 Workflow Generator

**Purpose:** Generate production-ready n8n-compatible workflow JSON from business requirements, including nodes, connections, expressions, credentials, and deployment strategy.

**Why it exists:** n8n workflows are the execution layer of the platform. This module bridges the gap between AI-designed logic and actual automation execution by generating valid n8n workflow definitions.

**How it works:**
1. Receives `WorkflowGeneratorInputDto`
2. `WorkflowGeneratorService` validates and prepares context (employee, agents, etc.)
3. `NodeBuilder` creates standard node structure:
   - Node 1: Webhook trigger (receives incoming data)
   - Node 2: Set context (prepares execution context)
   - Node 3: If/decision node (conditional branching)
   - Node 4: HTTP Request action (external API call)
   - Node 5: Code persist (data persistence)
4. `ConnectionBuilder` wires node connections
5. `ExpressionBuilder` builds n8n expressions for dynamic values
6. `CredentialBuilder` extracts required credential types
7. `WorkflowValidator` validates workflow structure
8. `WorkflowSerializer` outputs n8n-compatible JSON
9. `DeploymentPlanner` recommends cloud/self-hosted/hybrid strategy
10. Saves to database

**Input DTO:**
```typescript
interface WorkflowGeneratorInputDto {
  organizationId: string;
  employeeId?: string;
  employee?: any;
  agents?: any[];
  requirements?: string;
  industry?: string;
  workflowType?: string;
}
```

**Output DTO:**
- `workflow_name`, `version`, `description`
- `workflow_json` — complete n8n-compatible JSON
- `required_credentials` — credential types needed
- `required_nodes` — n8n node packages needed
- `required_integrations` — external integrations
- `deployment_strategy` — cloud | self_hosted | hybrid

**API:** `POST /api/workflow-generate`

**Template search companion:** `POST /api/template-search` — loads existing templates, scores them for relevance, returns reuse/merge/generate decision.

**Dependencies:** Gemini AI provider, template library

---

### 3.5 Workflow Analyzer

**Purpose:** Analyze existing n8n workflow JSON to extract metadata — node types, business purpose, industry, complexity scores, automation scores, reusability scores, integrations, credentials, AI providers, and generate embeddings for semantic search.

**Why it exists:** To power the template library and enable intelligent search/reuse of existing workflows rather than generating from scratch every time.

**How it works:**
1. Receives `WorkflowAnalyzerInputDto` (workflow JSON + optional ID)
2. `WorkflowAnalyzerService` inspects every node and its parameters
3. Infers business purpose, industry, category, trigger type from node structure
4. Calculates complexity, automation, reusability scores (0–1)
5. Extracts integrations, credentials, AI providers used
6. `EmbeddingService` generates hash-based embeddings (not true vector embeddings)
7. Saves to `InMemoryWorkflowAnalysisRepository`

**Input DTO:**
```typescript
interface WorkflowAnalyzerInputDto {
  workflow_json: object;
  workflow_id?: string;
}
```

**Output DTO (35+ fields):**
- `workflow_id`, `name`, `description`
- `node_count`, `node_types`, `trigger_type`
- `business_purpose`, `industry`, `category`
- `complexity_score`, `automation_score`, `reusability_score`
- `integrations[]`, `credentials[]`, `ai_providers[]`
- `estimated_execution_time`, `recommended_triggers[]`

**API:** `POST /api/workflow-analyzer`

**Used by:** TemplateIndexerService, TemplateSearchService

---

### 3.6 Prompt Generator

**Purpose:** Generate a complete AI prompt package — system prompt, developer prompt, assistant prompt, prompt JSON — optimized for a specific model and use case.

**Why it exists:** Different AI models and use cases require differently structured prompts. This module creates production-ready prompt packages with versioning, model optimization, and validation.

**How it works:**
1. Receives `PromptGeneratorInputDto`
2. `PromptBuilder` constructs a prompt package tailored to the target employee/agent
3. `PromptOptimizer` applies model-specific optimizations (token limits, formatting)
4. `ModelOptimizer` selects optimal model parameters
5. `PromptValidator` validates prompt structure and token count
6. `PromptSerializer` formats into output package
7. Saves to `InMemoryPromptRepository`

**Input DTO:**
```typescript
interface PromptGeneratorInputDto {
  organizationId: string;
  employee?: any;
  agent?: any;
  promptType?: string;
  model?: string;
  language?: string;
  tone?: string;
  requirements?: string;
}
```

**Output DTO:**
- `prompt_name`, `prompt_type`
- `system_prompt`, `developer_prompt`, `assistant_prompt`
- `prompt_json` — structured JSON representation
- `version`, `status`

**API:** `POST /api/ai-factory/prompt-generator`

---

### 3.7 Knowledge Generator

**Purpose:** Generate knowledge bases from business content — supports auto-generation (FAQ, SOP, documentation, AI context, training material) and manual document processing (parse, chunk, embed, extract metadata).

**Why it exists:** AI employees need knowledge to be effective. This module creates structured, searchable knowledge bases that feed into RAG (Retrieval-Augmented Generation) pipelines.

**How it works:**
1. Receives `KnowledgeGeneratorInputDto`
2. **Auto-generation mode:** If `autoGenerate=true`, `DocumentParser` creates documents from AI-generated content
3. **Manual mode:** If files are provided, `DocumentParser` parses them, `ChunkService` splits into chunks, `MetadataExtractor` extracts metadata
4. `EmbeddingService` generates embeddings for semantic search
5. `SearchService` enables querying the knowledge base
6. Saves to `InMemoryKnowledgeRepository`

**Input DTO:**
```typescript
interface KnowledgeGeneratorInputDto {
  organizationId: string;
  title?: string;
  content?: string;
  files?: any[];
  contentType?: string;
  autoGenerate?: boolean;
  requirements?: string;
}
```

**Output DTO:**
- `id`, `organizationId`, `title`
- `documents[]`, `tags`, `metadata`
- `status`

**API:** `POST /api/ai-factory/knowledge-generator`

---

### 3.8 QA Engine

**Purpose:** Validate generated artifacts — workflows, prompts, integrations — for correctness, completeness, security, and consistency before deployment.

**Why it exists:** AI-generated code/configuration can contain errors. This module catches issues before they reach production, ensuring quality and reliability.

**How it works:**
1. Receives `QaRequestDto` with target type and artifacts
2. `QaEngineService` runs multiple validation passes:
   - Workflow JSON structure validation
   - n8n-specific schema validation
   - Credential and integration validation
   - Business consistency checks
   - Prompt quality checks
   - Duplicate detection
3. Compiles issues and recommendations
4. Returns `QaResultDto` with overall pass/fail status

**Input DTO:**
```typescript
interface QaRequestDto {
  targetId: string;
  targetType: 'workflow' | 'employee' | 'agent' | 'prompt' | 'integration';
  workflowJson?: object;
  integrations?: any[];
  employees?: any[];
  workflows?: any[];
  prompts?: any[];
}
```

**Output DTO:**
- `qa.status` — 'pass' | 'fail' | 'warning'
- `qa.issues[]` — detailed issue descriptions
- `qa.recommendations[]` — remediation suggestions

**API:** `POST /api/qa/evaluate`

---

### 3.9 Solution Architect

**Purpose:** Design a complete solution architecture — module definitions, integration points, recommended employees/agents/workflows, data flow diagrams, and security zones — from business analysis results.

**Why it exists:** Serves as the bridge between business analysis and implementation, ensuring a coherent architectural blueprint before code/workflow generation begins.

**How it works:**
1. Receives `SolutionArchitectureRequestDto` referencing a business analysis
2. `SolutionArchitectService` designs the architecture:
   - Breaks requirements into modules
   - Defines integration points between modules
   - Recommends specific employee/agent/workflow types
   - Builds data flow diagrams
   - Defines security zones and access levels
3. Returns `SolutionArchitectureResultDto`

**Input DTO:**
```typescript
interface SolutionArchitectureRequestDto {
  businessAnalysisId: string;
  requirements: string[];
  industry?: string;
  businessType?: string;
  automationType?: string;
}
```

**Output DTO:**
```typescript
interface SolutionArchitectureModel {
  modules: ArchitectureModule[];
  integrationPoints: IntegrationPoint[];
  recommendations: {
    employees: string[];
    agents: string[];
    workflows: string[];
  };
  dataFlows: DataFlow[];
  securityZones: SecurityZone[];
}
```

**API:** `POST /api/solution-architect/design`

---

### 3.10 Deployment Manager

**Purpose:** Orchestrate deployment of generated artifacts across multiple targets — n8n, Supabase, client workspace, and marketplace — with logging and rollback support.

**Why it exists:** After generation, artifacts need to be deployed to running environments. This module coordinates that process with error handling and rollback.

**How it works:**
1. Receives `DeploymentManagerInputDto`
2. `DeploymentManagerService` validates the request
3. Delegates to specialized deployment services:
   - `N8NDeploymentService` — deploys workflows to n8n
   - `SupabaseDeploymentService` — persists data to Supabase
   - `WorkspaceDeploymentService` — creates client workspace
   - `MarketplaceDeploymentService` — publishes to marketplace
4. `DeploymentLogger` records each step
5. On failure, `RollbackService` reverses completed steps
6. Returns `DeploymentReportDto`

**Input DTO:**
```typescript
interface DeploymentManagerInputDto {
  organizationId: string;
  strategy?: 'rolling' | 'blue-green' | 'canary';
  target?: 'all' | 'n8n' | 'supabase' | 'workspace' | 'marketplace';
  workfloadId?: string;
}
```

**Output DTO:**
- `deployment_id`, `status`
- `employee_deployed`, `agents_deployed`
- `workflow_deployed`, `knowledge_installed`
- `marketplace_published`, `client_workspace_created`
- `deployment_url`, `logs[]`

**API:** `POST /api/ai-factory/deploy`

**Database table:** `workflow_deployments`

---

### 3.11 Marketplace Publisher

**Purpose:** Publish generated assets (workflows, employees, agents) to the marketplace and recommend relevant assets to users.

**Why it exists:** Enables a marketplace ecosystem where AI-generated automation assets can be shared, sold, and reused across organizations.

**How it works:**
1. **Publishing:** `MarketplacePublisherService` receives `MarketplacePublishRequestDto`, creates a `MarketplaceListingModel`, publishes to `supabase_marketplace` or `n8n_workflows` based on target
2. **Recommendations:** `MarketplaceIntelligenceService` recommends assets based on industry, company size, department, and business goals

**Input DTO (publish):**
```typescript
interface MarketplacePublishRequestDto {
  assetId: string;
  marketplace: 'supabase_marketplace' | 'n8n_workflows';
  assetType: 'workflow' | 'employee' | 'agent' | 'template';
  assetName: string;
  description: string;
  category?: string;
  industry?: string;
  tags?: string[];
  price?: number;
}
```

**APIs:**
- `POST /api/marketplace/publish`
- `POST /api/marketplace/recommend`

---

### 3.12 Integration Manager

**Purpose:** Register, update, and manage third-party integrations (API keys, credentials, endpoints) with health checking and credential rotation.

**Why it exists:** AI employees and workflows need to connect to external services (CRM, calendar, email, etc.). This module securely stores and manages those integrations.

**How it works:**
1. `IntegrationManagerService` stores integration configs with encrypted credentials
2. Supports register, update, find-by-org, health check, and credential rotation
3. **NOTE:** Currently uses BASE64 encoding (not AES-256-GCM from crypto.ts — the encryption module exists but is not wired to this service)

**Input DTOs:**
```typescript
interface RegisterIntegrationDto {
  organizationId: string;
  name: string;
  type: IntegrationType;
  credentials: Record<string, string>;
  endpoint?: string;
  config?: Record<string, any>;
}

interface UpdateIntegrationDto {
  name?: string;
  credentials?: Record<string, string>;
  endpoint?: string;
  config?: Record<string, any>;
}
```

**Output DTO:**
- `IntegrationConfigDto` — id, name, type, endpoint, masked credentials, status, health

**Current limitation:** Credentials are base64-encoded, not AES-256-GCM encrypted as the crypto.ts module provides. This is a security gap.

---

## 4. API Endpoints

### 4.1 Health & System

| Method | Endpoint | Purpose | Called By |
|--------|----------|---------|-----------|
| GET | `/api/health` | Overall system health | Monitoring, load balancers |
| GET | `/api/health/ai-provider` | AI provider connectivity | Monitoring |
| GET | `/api/health/supabase` | Supabase DB connectivity | Monitoring |
| GET | `/api/health/prompt-engine` | Prompt engine status | Monitoring |
| GET | `/api/health/workflow-generator` | Workflow generator status | Monitoring |
| GET | `/api/health/business-analyzer` | Business analyzer status | Monitoring |
| GET | `/api/health/employee-generator` | Employee generator status | Monitoring |
| GET | `/api/health/agent-generator` | Agent generator status | Monitoring |
| GET | `/api/health/workflow-analyzer` | Workflow analyzer status | Monitoring |
| GET | `/api/health/template-search` | Template search status | Monitoring |

**Note:** Current health check implementations check only `NODE_ENV` — they are effectively client-side mocks.

### 4.2 AI Factory — Generation

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/ai-factory/business-analyzer` | Analyze a business | `{ industry, businessName, goal, requirements }` | `BusinessAnalyzerResponseDto` |
| POST | `/api/ai-factory/employee-generator` | Generate an AI employee | `{ industry, automation_type, business_name, requirements }` | `EmployeeGeneratorResponseDto` |
| POST | `/api/ai-factory/agent-generator` | Generate AI agents | `{ employee_name, industry, department, ... }` | `AgentGeneratorResponseDto` |
| POST | `/api/ai-factory/prompt-generator` | Generate AI prompts | `{ organizationId, employee?, agent?, ... }` | `PromptPackageDto` |
| POST | `/api/ai-factory/knowledge-generator` | Generate knowledge base | `{ organizationId, title?, content?, ... }` | `KnowledgeGeneratorResponseDto` |
| POST | `/api/ai-factory/deploy` | Deploy everything | `{ organizationId, strategy?, target?, ... }` | `DeploymentReportDto` |
| POST | `/api/ai-factory/workflow-analyzer` | Analyze a workflow | `{ workflow_json, workflow_id? }` | `WorkflowAnalyzerAnalysisDto` |
| POST | `/api/ai-factory/template-search` | Search templates | `{ query, filters?, ... }` | Template search results |
| POST | `/api/ai-factory/workflow-generate` | Generate a workflow | `{ organizationId, employeeId?, ... }` | `WorkflowGeneratorResponseDto` |

### 4.3 QA & Architecture

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/qa/evaluate` | QA evaluation | `{ targetId, targetType, ... }` | `QaResultDto` |
| POST | `/api/solution-architect/design` | Solution architecture design | `{ businessAnalysisId, requirements[], ... }` | `SolutionArchitectureResultDto` |

### 4.4 Marketplace

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/marketplace/publish` | Publish to marketplace | `{ assetId, marketplace, assetType, ... }` | `MarketplacePublishResultDto` |
| POST | `/api/marketplace/recommend` | Get recommendations | `{ industry, companySize, ... }` | Marketplace recommendations |

### 4.5 Template Library

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/template-library/scan` | Scan template library for new/indexed workflows |
| GET | `/api/template-library/stats` | Get template library statistics |

### 4.6 n8n Management

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/n8n/deploy` | Deploy workflow to n8n |
| POST | `/api/n8n/update` | Update workflow in n8n |
| POST | `/api/n8n/activate` | Activate workflow in n8n |
| POST | `/api/n8n/deactivate` | Deactivate workflow in n8n |
| POST | `/api/n8n/execute` | Execute a workflow |
| DELETE | `/api/n8n/workflow/:id` | Delete workflow from n8n |
| GET | `/api/n8n/workflow/:id` | Get workflow status |
| GET | `/api/n8n/health` | n8n health check |
| POST | `/api/n8n/credentials/sync` | Sync credentials to n8n |

### 4.7 Admin

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/import-workflows` | Import workflows from filesystem to Supabase |

### 4.8 Production Use Cases

| Use Case | Endpoints Called | Description |
|----------|-----------------|-------------|
| **New customer onboarding** | business-analyzer → solution-architect → employee-generator → agent-generator → workflow-generator → qa/evaluate → deploy | Full pipeline from business analysis to deployment |
| **Quick employee generation** | employee-generator → deploy | Skip analysis, generate and deploy an employee directly |
| **Workflow-only generation** | template-search → workflow-generate → qa/evaluate → n8n/deploy | Search templates, generate missing one, QA it, deploy to n8n |
| **Marketplace publishing** | workflow-analyzer → qa/evaluate → marketplace/publish | Analyze existing workflow, QA it, publish to marketplace |
| **Template library scanning** | template-library/scan → workflow-analyzer (per workflow) | Scan directory, analyze each workflow, index for search |

---

## 5. Integrations

### 5.1 OpenRouter / AI Providers

**Role:** Central AI gateway — all AI calls (analysis, generation, prompting) route through this abstraction layer.

**Architecture:**

```
┌──────────────────────────────────────────────────┐
│                  AIProvider interface             │
│  ┌────────────────────────────────────────────┐  │
│  │  generate(prompt, options): Response       │  │
│  │  stream(prompt, options): AsyncIterable    │  │
│  │  health(): HealthStatus                   │  │
│  │  getFeatures(): ModelFeatures[]           │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
            ▲              ▲              ▲
            │              │              │
    ┌───────┴───────┐ ┌───┴────┐ ┌───────┴───────┐
    │ OpenRouterClient│ │OpenAI  │ │ Anthropic     │
    │ (default)      │ │Client  │ │ Client        │
    └───────────────┘ └────────┘ └───────────────┘
                                       ▲
                                ┌──────┴──────┐
                                │GeminiClient │
                                └─────────────┘
```

**ProviderFactory (Singleton):**
- Creates and caches provider instances
- Supports `switchProvider()` at runtime
- Reads provider keys from env vars

**ModelRegistry:**
- Maintains model lists with costs per token
- Defines fallback chains (e.g., if GPT-4 fails → Claude Opus → Gemini Pro)
- Token estimation and cost calculation

**ModelSelector:**
- Selects models by criteria: `cheapest`, `bestValue`, `byTaskType`
- Considers token limits, cost, and capability

**Environment variables:**
```
OPENROUTER_API_KEY        # Required
OPENROUTER_BASE_URL       # Optional (default: https://openrouter.ai/api/v1)
OPENROUTER_TIMEOUT_MS     # Optional (default: 30000)
OPENROUTER_RETRIES        # Optional (default: 3)
OPENROUTER_MODEL          # Optional
OPENAI_API_KEY            # Optional
ANTHROPIC_API_KEY         # Optional
GEMINI_API_KEY            # Optional
```

**Error handling:** Retry chain with fallback — if primary provider fails, tries fallback models/providers automatically.

### 5.2 Supabase (PostgreSQL + pgvector)

**Role:** Primary database — stores all generated artifacts, business analyses, employee definitions, workflow templates, deployment records, and supports vector similarity search via pgvector.

**Connection:**
- `createSupabaseClient()` creates an authenticated client using the service role key
- Used in individual modules (business-analyzer, employee-generator, agent-generator) which create their own client instances

**Environment variables:**
```
SUPABASE_URL                 # Required
SUPABASE_ANON_KEY            # Optional (if service key present)
SUPABASE_SERVICE_ROLE_KEY    # Required
```

**Key tables:** See [Section 9 — Database Schema](#9-database-schema)

**Vector search function:**
```sql
match_templates(query_embedding, similarity_threshold, result_count)
-- Uses cosine similarity via pgvector
```

**Current usage:** Only business-analyzer, employee-generator, and agent-generator use Supabase repositories. All other modules use in-memory storage.

### 5.3 n8n Workflow Engine

**Role:** Execution engine — all generated workflows are deployed to the n8n instance, which handles scheduling, execution, webhook listening, and credential management.

**N8nClient capabilities:**
- `deploy(workflowJson)` — Create/update workflow
- `activate(workflowId)` — Activate workflow (start listening)
- `deactivate(workflowId)` — Deactivate workflow
- `delete(workflowId)` — Remove workflow
- `execute(workflowId, data)` — Trigger manual execution
- `getStatus(workflowId)` — Get execution status
- `syncCredentials(credentials)` — Sync external credentials to n8n
- `health()` — n8n health check

**Environment variables:**
```
N8N_URL / N8N_BASE_URL   # Required - n8n instance URL
N8N_API_KEY               # Required - n8n API authentication key
N8N_TIMEOUT_MS            # Optional (default: 30000)
```

**Workflow library:** 21 pre-built n8n workflow JSON files in `workflows/`:
- **Core:** 00-master-controller
- **Sales pipeline:** 01-lead-capture, 02-property-matching, 03-followup, 04-calendar-booking, 05-deal-pipeline
- **Operations:** 06-agent-assignment, 07-notifications, 08-crm-manager, 09-customer-support
- **Knowledge:** 10-knowledge-base-sync
- **Factory:** 20-automation-factory-request-handler, 21-approve-and-save-template

**Current limitation:** `N8nDeploymentService` contains placeholder implementations that always return `true` — actual API calls are not fully wired.

### 5.4 Marketplace

**Role:** Asset marketplace — stores published workflows, employees, agents, and templates for reuse/sharing across organizations.

**Environment variable:**
```
MARKETPLACE_BASE_URL    # Optional - marketplace URL
```

**Current state:** Publish and recommend endpoints exist with in-memory storage. No persistent marketplace database or external marketplace service is connected.

### 5.5 Template Library

**Role:** Local library of workflow templates that powers the template search and reuse system.

**Path:** `template-library/source/` — contains workflow JSON files that are indexed on-demand.

**Environment variable:**
```
WORKFLOWS_ROOT    # Optional - workflows directory path
```

**TemplateIndexerService:**
- Scans template library directory
- Analyzes each workflow via `WorkflowAnalyzerService`
- Generates hash-based embeddings (not true vector embeddings)
- Builds an in-memory search index

**TemplateSearchService:**
- Loads templates from the index
- Scores them against query criteria
- Returns reuse/merge/generate recommendation

### 5.6 Credential Sync

**Role:** Synchronize external service credentials to the n8n credential store so deployed workflows can authenticate.

**Service:** `CredentialSyncService` — wraps the n8n credential API.

**Current state:** Endpoint exists at `POST /api/n8n/credentials/sync` but the underlying implementation in `N8nClient.syncCredentials()` has placeholder behavior.

---

## 6. Communication Flows

### 6.1 AI Factory ↔ n8n

```
┌──────────────────┐          HTTP REST          ┌────────────────────┐
│   AI Factory     │◄──────────────────────────►│     n8n Instance    │
│                  │  POST /api/n8n/deploy       │                    │
│  N8nClient ──────┤────────────────────────────►│  POST /workflow    │
│                  │  POST /api/n8n/activate     │                    │
│  Deployment ─────┤────────────────────────────►│  POST /workflow/:id/activate │
│  Service         │  POST /api/n8n/execute      │                    │
│                  │────────────────────────────►│  POST /workflow/:id/execute  │
│  Credential ─────┤  POST /api/n8n/credentials/sync│                 │
│  Sync Service    │────────────────────────────►│  POST /credentials  │
│                  │  GET /api/n8n/workflow/:id  │                    │
│                  │◄────────────────────────────│  GET /workflow/:id │
└──────────────────┘                             └────────────────────┘
```

**Data flow for deployment:**
1. AI Factory generates `workflow_json` (n8n-compatible)
2. N8nDeploymentService calls N8nClient.deploy(workflowJson)
3. n8n creates/updates the workflow, returns workflow ID
4. AI Factory stores the deployment mapping in `workflow_deployments` table
5. Optionally activates the workflow

### 6.2 AI Factory ↔ Supabase

```
┌──────────────────┐        Supabase JS Client      ┌────────────────────┐
│   AI Factory     │◄──────────────────────────────►│     Supabase        │
│                  │                                  │   (PostgreSQL +     │
│  Service ────────┤  createSupabaseClient()         │    pgvector)       │
│  Layer           │────────────────────────────────►│                    │
│                  │                                  │  Tables:           │
│  ┌─ Business     │  .from('business_analysis')     │  business_analysis │
│  │  Analyzer     │  .insert(analysis) ────────────►│  ai_employees      │
│  │               │                                  │  ai_skills         │
│  ├─ Employee     │  .from('ai_employees')          │  automation_templates │
│  │  Generator    │  .upsert(employee) ────────────►│  workflow_deployments │
│  │               │                                  │  organizations    │
│  ├─ Agent        │  .from('ai_employees')          │  users            │
│  │  Generator    │  .insert(agents) ──────────────►│  ... (25+ tables)  │
│  │               │                                  │                    │
│  └─ Workflow     │  .rpc('match_templates', {      │  Function:         │
│     Generator    │    query_embedding,              │  match_templates() │
│                  │    similarity_threshold}) ──────►│  (pgvector cosine  │
│                  │                                  │   similarity)      │
└──────────────────┘                                  └────────────────────┘
```

**Key points:**
- Modules create their own Supabase client instances (no shared connection pool)
- Service role key is used for all operations (bypasses RLS)
- Only 3 modules have Supabase repositories; all others use in-memory

### 6.3 AI Factory ↔ OpenRouter

```
┌──────────────────┐         HTTP (fetch)         ┌──────────────────────┐
│   AI Factory     │◄────────────────────────────►│    OpenRouter API     │
│                  │                               │                      │
│  AIProvider ─────┤  POST /api/v1/chat/completions│  Routes to:          │
│  interface       │──────────────────────────────►│  ┌─ OpenAI (GPT-4o)  │
│                  │                               │  ├─ Anthropic (Claude)│
│  OpenRouter ─────┤  Headers:                     │  └─ Gemini (Pro)     │
│  Client          │  Authorization: Bearer <key>  │                      │
│                  │  X-Title: AI Factory          │  Response includes:  │
│  Retry ──────────┤  Content-Type: application/json│  - generated text   │
│  Chain           │                               │  - token usage      │
│                  │  Supports SSE streaming       │  - model info       │
│  Fallback ───────┤  (GET /api/v1/models)         │                      │
│                  │──────────────────────────────►│  GET models list    │
└──────────────────┘                               └──────────────────────┘
```

**Retry & fallback chain:**
1. Primary model configured (e.g., `gpt-4o`)
2. If 4xx/5xx/timeout → retry (configurable, default 3)
3. If all retries fail → try fallback model (e.g., `claude-opus`)
4. If fallback fails → try second fallback (e.g., `gemini-pro`)
5. If all fail → return error to caller

---

## 7. Complete Customer Journey

### Phase 1: Business Analysis

```
Customer submits ──▶ Business Analyzer ──▶ AI analyzes ──▶ Returns strategic
requirements      │  Module              │  business       │  roadmap with
                  │                      │  context        │  opportunities,
                  │                      │  pain points    │  ROI estimates,
                  │                      │  departments    │  AI recommendations
                  ▼                      ▼                  ▼
           POST /api/ai-factory/     Gemini Provider     BusinessAnalyzer
           business-analyzer         processes prompt    ResponseDto
```

### Phase 2: Solution Architecture

```
Business Analysis ──▶ Solution Architect ──▶ Designs blueprint ──▶ Architecture
ID passed in       │  Module              │  with modules,     │  with employees,
                   │                      │  integrations,    │  agents, workflows
                   │                      │  security zones   │  recommendations
                   ▼                      ▼                    ▼
            POST /api/solution-        Analyzes            SolutionArchitecture
            architect/design           requirements        ResultDto
```

### Phase 3: Employee Generation

```
Architecture ──▶ Employee Generator ──▶ AI creates full ──▶ AI Employee
recommends     │  Module              │  employee spec    │  saved to DB
employee type  │                      │  with prompt,     │  (ai_employees)
               │                      │  skills, tools,   │
               │                      │  personality,     │
               │                      │  security rules   │
               ▼                      ▼                    ▼
        POST /api/ai-factory/      GeminiProvider       EmployeeGenerator
        employee-generator         generates 27 fields  ResponseDto
```

### Phase 4: Agent Generation

```
Employee ──▶ Agent Generator ──▶ AI creates multi-agent ──▶ Agents saved
definition  │  Module            │  system with roles,      │  to DB
passed in   │                    │  hierarchy, comms,       │
            │                    │  error handling           │
            ▼                    ▼                           ▼
     POST /api/ai-factory/   GeminiProvider              AgentGenerator
     agent-generator         generates agent array       ResponseDto
```

### Phase 5: Workflow Generation

```
Employee + Agents ──▶ Workflow Generator ──▶ AI generates ──▶ n8n-compatible
+ requirements      │  Module              │  n8n workflow  │  workflow JSON
                    │                      │  with nodes,   │
                    │                      │  connections,  │
                    │                      │  credentials   │
                    ▼                      ▼                  ▼
             POST /api/workflow-        NodeBuilder,       WorkflowGenerator
             generate                   ConnectionBuilder  ResponseDto
```

### Phase 6: Prompt & Knowledge Generation

```
Workflow + Employee ──▶ Prompt Generator ──▶ Optimized prompt    ──▶ Prompt
                      │  Module            │  package for each    │  package
                      │                    │  employee/agent      │
                      ▼                     ▼                      ▼
               POST /api/ai-factory/     PromptBuilder,         PromptPackageDto
               prompt-generator          PromptOptimizer

Employee ──▶ Knowledge Generator ──▶ Knowledge base with ──▶ Searchable
requirements  │  Module              │  documents, chunks,   │  knowledge base
              │                      │  embeddings, metadata  │
              ▼                      ▼                        ▼
       POST /api/ai-factory/      DocumentParser,          KnowledgeGenerator
       knowledge-generator         ChunkService             ResponseDto
```

### Phase 7: Quality Assurance

```
All artifacts ──▶ QA Engine ──▶ Validates structure, ──▶ Pass/Fail with
passed in      │  Module      │  consistency,         │  issues and
               │              │  security             │  recommendations
               ▼              ▼                       ▼
        POST /api/qa/       Multi-pass validation   QaResultDto
        evaluate             engine
```

### Phase 8: Deployment

```
Approved artifacts ──▶ Deployment Manager ──▶ Orchestrates to: ──▶ Deployment
                     │  Module               │  n8n (workflows)  │  Report
                     │                       │  Supabase (data)  │
                     │                       │  Workspace (UI)   │
                     │                       │  Marketplace      │
                     ▼                       ▼                    ▼
              POST /api/ai-factory/       N8NDeployment,        Deployment
              deploy                      SupabaseDeployment,   ReportDto
                                           Workspace, Marketplace
```

---

## 8. Environment Variables Reference

| Variable | Required | Default | Description | Used By |
|----------|----------|---------|-------------|---------|
| `SUPABASE_URL` | **Yes** | — | Supabase project URL | Supabase client |
| `SUPABASE_ANON_KEY` | No | — | Supabase anonymous/public key | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | — | Supabase service role key (admin access) | Supabase client |
| `OPENROUTER_API_KEY` | **Yes** | — | OpenRouter API authentication key | OpenRouter client |
| `OPENROUTER_BASE_URL` | No | `https://openrouter.ai/api/v1` | OpenRouter API base URL | OpenRouter client |
| `OPENROUTER_TIMEOUT_MS` | No | `30000` | Request timeout to OpenRouter (ms) | OpenRouter client |
| `OPENROUTER_RETRIES` | No | `3` | Number of retry attempts | OpenRouter client |
| `OPENROUTER_MODEL` | No | — | Default model to use | OpenRouter client |
| `OPENAI_API_KEY` | No | — | OpenAI API key (fallback provider) | OpenAI client |
| `ANTHROPIC_API_KEY` | No | — | Anthropic API key (fallback provider) | Anthropic client |
| `GEMINI_API_KEY` | No | — | Google Gemini API key (fallback provider) | Gemini client |
| `N8N_URL` / `N8N_BASE_URL` | **Yes** | — | n8n instance base URL | N8nClient |
| `N8N_API_KEY` | **Yes** | — | n8n API authentication key | N8nClient |
| `N8N_TIMEOUT_MS` | No | `30000` | Request timeout to n8n (ms) | N8nClient |
| `JWT_SECRET` | **Yes** | — | JWT signing secret for auth tokens | Auth middleware |
| `PORT` | No | `3000` | Express server port | server.ts |
| `APP_BASE_URL` | No | — | Application base URL | General |
| `APP_NAME` | No | — | Application name | General |
| `ENCRYPTION_KEY` | No | *(internal default)* | Key for credential encryption | crypto.ts |
| `MARKETPLACE_BASE_URL` | No | — | Marketplace external URL | Marketplace module |
| `WORKFLOWS_ROOT` | No | — | Workflows directory path | Template indexer |
| `NODE_ENV` | No | — | Environment (`development`, `production`, `test`) | Health checks, general |

**Security note:** The `.env` file contains production API keys. Ensure it is excluded from version control and access-restricted in production.

---

## 9. Database Schema

### Entity Relationship Overview

```
organizations
  └─ users
  └─ contacts
  └─ deals
  └─ properties
  └─ tasks
  └─ pipelines
  └─ conversations
  └─ ai_employees
  │    └─ ai_employee_skills
  │    └─ ai_assignments
  │    └─ ai_memory
  │    └─ ai_logs
  │    └─ ai_actions
  ├─ knowledge_bases
  │    └─ knowledge_documents
  ├─ automation_categories
  ├─ automation_templates (pgvector)
  │    └─ template_versions
  │    └─ template_reviews
  ├─ automation_requests
  ├─ business_analysis
  ├─ workflow_deployments
  │    └─ workflow_logs
  ├─ workflow_import_logs
  ├─ system_settings
  └─ database_version
```

### Table Details

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `organizations` | Client organizations | id, name, settings, created_at |
| `users` | Platform users | id, org_id, email, role, settings |
| `contacts` | CRM contacts | id, org_id, name, email, phone, property_interest |
| `conversations` | AI chat history | id, org_id, user_id, messages, context |
| `ai_employees` | AI employee/agent definitions | id, org_id, name, role, system_prompt, personality, skills, tools, security_rules, permissions, kpis, settings, memory_config, model_config, status |
| `ai_skills` | Skill taxonomy | id, name, category, description |
| `ai_employee_skills` | Employee-skill mapping | employee_id, skill_id, proficiency |
| `ai_assignments` | Employee assignment tracking | id, employee_id, org_id, assigned_to, status, metrics |
| `knowledge_bases` | Knowledge base containers | id, org_id, name, type, config |
| `knowledge_documents` | Documents within knowledge bases | id, knowledge_base_id, title, content, embedding, metadata, chunks |
| `ai_memory` | Agent memory storage | id, agent_id, session_id, key, value, context, timestamp |
| `ai_logs` | AI usage logs | id, agent_id, org_id, action, tokens_used, cost, duration |
| `ai_actions` | AI action definitions | id, agent_id, name, trigger, action_type, config |
| `automation_categories` | Workflow category taxonomy | id, name, parent_id, description |
| `automation_templates` | Template library (with pgvector) | id, name, description, workflow_json, embedding (vector), category, industry, tags, metadata, scores |
| `template_versions` | Version history for templates | id, template_id, version, workflow_json, changelog |
| `template_reviews` | Marketplace reviews & ratings | id, template_id, user_id, rating, review |
| `automation_requests` | Client automation requests | id, org_id, requirements, status, assigned_employee |
| `workflow_deployments` | Deployment tracking | id, workflow_id, org_id, status, target, config, url, logs |
| `workflow_logs` | Execution logs | id, deployment_id, execution_id, status, result, duration |
| `business_analysis` | Business analysis results | id, org_id, industry, business_name, goal, requirements, analysis_json, confidence, status |
| `workflow_import_logs` | Workflow import audit | id, workflow_id, filename, content_hash, status, imported_at |
| `system_settings` | Platform-wide settings | key, value, type, description |
| `database_version` | Schema version tracking | version, applied_at, checksum |

### Key Database Function

```sql
match_templates(
  query_embedding vector(1536),  -- embedding to search for
  similarity_threshold float,     -- minimum similarity (e.g., 0.7)
  result_count int               -- max results (e.g., 10)
) RETURNS TABLE (
  id uuid,
  name text,
  description text,
  similarity float
)
-- Uses cosine similarity (<=> operator) via pgvector extension
-- Filters results above similarity_threshold
-- Orders by similarity DESC
-- Limits to result_count
```

---

## 10. AI Prompts Reference

### 10.1 Business Analyzer Prompt

**Target:** Generative AI model (Gemini)

**Prompt structure:**
```
You are an expert business analyst and AI automation consultant specializing in [industry].
Analyze the following business and provide a detailed automation and AI strategy.

Business Name: [businessName]
Industry: [industry]
Goal: [goal]
Requirements: [requirements]

Provide your analysis as structured JSON with the following fields:
{
  "company_summary": "...",
  "industry": "...",
  "department_analysis": {
    "department_name": {
      "functions": [...],
      "pain_points": [...],
      "automation_potential": "low|medium|high"
    },
    ...
  },
  "pain_points": [...],
  "automation_opportunities": [...],
  "ai_opportunities": [...],
  "suggested_employees": [...],
  "suggested_agents": [...],
  "suggested_workflows": [...],
  "suggested_integrations": [...],
  "kpis": [...],
  "roi_estimate": "...",
  "complexity": "low|medium|high",
  "estimated_build_time": "...",
  "estimated_cost": "...",
  "confidence": 0.0-1.0
}
```

### 10.2 Employee Generator Prompt

**Target:** Generative AI model (Gemini)

**Prompt structure:**
```
You are an expert AI employee designer. Create a detailed AI employee for a business.

Industry: [industry]
Automation Type: [automation_type]
Business Name: [business_name]
Requirements: [requirements]

Generate a complete AI employee specification in JSON with these 27 fields:
- employee_name, department, role, description
- system_prompt (detailed base system prompt)
- personality (tone, style, behavior patterns)
- skills (technical and soft skills)
- goals (primary and secondary objectives)
- responsibilities (day-to-day tasks)
- limitations (boundaries and constraints)
- knowledge_base (required reference materials)
- required_tools, required_integrations
- required_agents, required_workflows
- memory (short-term, long-term configuration)
- recommended_models
- openai_settings, gemini_settings, claude_settings
- tools (function definitions)
- function_calls (API call definitions)
- vector_search_settings (RAG configuration)
- security_rules, permissions
- kpis, escalation_rules
```

### 10.3 Agent Generator Prompt

**Target:** Generative AI model (Gemini)

**Prompt structure:**
```
You are an expert multi-agent system architect. Design a team of AI agents
that work together under an AI employee.

Employee Name: [employee_name]
Industry: [industry]
Department: [department]
Required Workflows: [workflows]
Required Integrations: [integrations]
Required Tools: [tools]

Generate an array of agents, each with:
{
  "agents": [
    {
      "agent_name": "...",
      "role": "...",
      "description": "...",
      "system_prompt": "...",
      "goals": [...],
      "tools": [...],
      "permissions": {...},
      "memory": {...},
      "llm": "...",
      "trigger_events": [...],
      "required_workflows": [...],
      "required_integrations": [...],
      "personality": {...},
      "communication_rules": {...},
      "error_handling": {...},
      "retry_logic": {...}
    }
  ]
}
```

### 10.4 Prompt Generator Prompts

**Target:** Generative AI model (Gemini)

**Prompt types supported:**
- `employee` — system prompt for an AI employee
- `agent` — system prompt for an AI agent
- `workflow` — instruction prompt for a workflow
- `knowledge` — knowledge extraction prompt
- `qa` — quality assurance prompt

**Optimization:** PromptOptimizer adjusts for:
- Model-specific token limits (e.g., 128K for Gemini, 200K for Claude)
- Format preferences (JSON, markdown, plain text)
- Tone (professional, friendly, technical)
- Language (English, Spanish, etc.)

---

## 11. Background Processes

### 11.1 Continuous Learning Service

**File:** `src/services/automation-import/continuous-learning.ts`

**Purpose:** Monitor the template library directory for changes and automatically re-index workflows.

**How it triggers:**
- Currently called via API (`POST /api/template-library/scan`)
- Designed to run on a schedule (cron), but no scheduler is configured

**What it does:**
1. Scans `template-library/source/` directory
2. Detects new, modified, and removed files
3. For new/modified: imports workflow, generates analysis, creates embeddings
4. For removed: removes from index
5. Updates `workflow_import_logs` table

**Current state:** Functional but requires manual/manual-trigger activation.

### 11.2 Workflow Import Service

**File:** `src/services/automation-import/workflow-import.ts`

**Purpose:** Bulk import workflow JSON files from the filesystem to Supabase.

**Process:**
1. Reads workflow JSON files from `workflows/` directory
2. Generates content hash for duplicate detection
3. Checks `automation_templates` table for existing content hash
4. Inserts new templates with version tracking
5. Logs to `workflow_import_logs`

**CLI:** `src/cli/import-workflows.ts` — command-line interface for the import process.

### 11.3 Template Indexer Service

**File:** `src/services/automation-import/template-indexer.ts`

**Purpose:** Build and maintain a searchable index of all workflow templates.

**Process:**
1. Scans `template-library/source/` directory
2. For each workflow JSON:
   - Calls `WorkflowAnalyzerService` to extract metadata
   - Generates hash-based embedding
   - Stores in in-memory index
3. Powers the template search functionality

**Current limitation:** Uses hash-based "embeddings" (not real vector embeddings from an embedding model). This means semantic search quality is limited.

---

## 12. Production Flows

### 12.1 Full Pipeline Flow

```
1. Customer submits requirements via web/app
2. POST /api/ai-factory/business-analyzer
   ├── Validate input
   ├── GeminiBusinessAnalyzer.analyze()
   ├── SupabaseBusinessAnalysisRepository.save()
   └── Return analysis with AI recommendations

3. POST /api/solution-architect/design
   ├── Load business analysis
   ├── SolutionArchitectService.design()
   ├── Build modules, integration points, security zones
   └── Return architecture blueprint

4. POST /api/ai-factory/employee-generator
   ├── For each recommended employee type
   ├── GeminiEmployeeGenerator.generate()
   ├── SupabaseEmployeeRepository.save()
   └── Return employee definitions

5. POST /api/ai-factory/agent-generator
   ├── For each employee
   ├── GeminiAgentGenerator.generate()
   ├── CommunicationPlanner.build()
   ├── HierarchyBuilder.build()
   ├── Save each agent
   └── Return agent configurations

6. POST /api/workflow-generate
   ├── For each required workflow
   ├── NodeBuilder.build() → 5 standard nodes
   ├── ConnectionBuilder.build()
   ├── WorkflowValidator.validate()
   ├── WorkflowSerializer.serialize()
   └── Return n8n-compatible workflow JSON

7. POST /api/ai-factory/prompt-generator
   ├── For each employee and agent
   ├── PromptBuilder.build()
   ├── PromptOptimizer.optimize()
   ├── PromptValidator.validate()
   └── Return prompt packages

8. POST /api/ai-factory/knowledge-generator
   ├── Parse/generate knowledge content
   ├── DocumentParser.parse()
   ├── ChunkService.chunk()
   ├── EmbeddingService.embed()
   └── Return knowledge base

9. POST /api/qa/evaluate
   ├── Validate workflow JSON structure
   ├── Check credentials and integrations
   ├── Verify business consistency
   ├── Check prompt quality
   └── Return pass/fail with issues

10. POST /api/ai-factory/deploy (if QA passed)
    ├── N8NDeploymentService.deploy()
    ├── SupabaseDeploymentService.deploy()
    ├── WorkspaceDeploymentService.deploy()
    ├── MarketplaceDeploymentService.publish()
    └── Return deployment report with URLs
```

### 12.2 Error Handling Strategy

| Layer | Error Type | Handling |
|-------|-----------|----------|
| API Routes | Validation errors | Return 400 with field-level error details |
| API Routes | Missing env vars | Return 500 with descriptive message |
| Services | AI provider failure | Retry with fallback chain, then return 502 |
| Services | Supabase failure | Log error, return 503 with retry suggestion |
| Deployment | Partial failure | Rollback completed steps, return partial failure report |
| QA | Validation failure | Return 200 with `status: "fail"` and remediation list |
| All layers | Unhandled exceptions | Express error middleware → 500 with correlation ID |

### 12.3 Production Deployment Topology

```
                          ┌─────────────┐
                          │  Load       │
                          │  Balancer   │
                          └──────┬──────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼────┐ ┌────▼────┐ ┌─────▼────┐
              │ Express  │ │ Express │ │ Express  │
              │ Instance │ │ Instance│ │ Instance │
              │  1       │ │  2      │ │  3       │
              └─────┬────┘ └────┬────┘ └────┬────┘
                    │            │            │
                    └────────────┼────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
        ┌─────▼──────┐   ┌──────▼──────┐   ┌───────▼──────┐
        │  Supabase  │   │    n8n      │   │  OpenRouter  │
        │ (PostgreSQL│   │  (Workflow  │   │  (AI Gateway)│
        │  + Vector) │   │   Engine)   │   │              │
        └────────────┘   └─────────────┘   └──────────────┘
```

---

## 13. Architecture Diagrams

### 13.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CUSTOMER INTERFACES                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │   Web    │  │  Mobile  │  │   CLI    │  │   n8n Webhooks       │   │
│  │   App    │  │   App    │  │  Tools   │  │   (trigger flows)    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘   │
│       │              │              │                    │               │
└───────┼──────────────┼──────────────┼────────────────────┼───────────────┘
        │              │              │                    │
        ▼              ▼              ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXPRESS API LAYER                                │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Routes: /api/ai-factory/*, /api/qa/*, /api/n8n/*, /api/health/*│   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  Middleware: JSON parser, CORS (implied), error handler                  │
│  Missing: Authentication, rate limiting, input sanitization, CSRF       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI FACTORY CORE LAYER                            │
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │   Business   │ │   Solution   │ │   Employee   │ │    Agent     │  │
│  │   Analyzer   │ │  Architect   │ │   Generator  │ │  Generator   │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │   Workflow   │ │   Workflow   │ │    Prompt    │ │  Knowledge   │  │
│  │   Generator  │ │   Analyzer   │ │   Generator  │ │  Generator   │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  QA Engine   │ │  Deployment  │ │  Marketplace │ │ Integration  │  │
│  │              │ │   Manager    │ │   Publisher  │ │   Manager    │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE SERVICES LAYER                      │
│                                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────────────┐   │
│  │  AI Provider   │  │  n8n Client    │  │  Supabase Client        │   │
│  │  (OpenRouter,  │  │  (REST API)    │  │  (Service Role + JWT)   │   │
│  │   OpenAI,      │  └────────────────┘  └─────────────────────────┘   │
│  │   Anthropic,   │                                                    │
│  │   Gemini)      │  ┌────────────────┐  ┌─────────────────────────┐   │
│  └────────────────┘  │  Automation    │  │  Shared Utilities       │   │
│                       │  Import + CL  │  │  (crypto, cache,        │   │
│                       └────────────────┘  │  semantic-search, etc) │   │
│                                           └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────────────────┐   │
│  │   Supabase   │    │  n8n Engine  │    │  OpenRouter AI Gateway │   │
│  │ (PostgreSQL  │    │ (Workflows)  │    │  → OpenAI, Anthropic,  │   │
│  │  + pgvector) │    │              │    │    Gemini, etc.        │   │
│  └──────────────┘    └──────────────┘    └────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.2 Module Internal Architecture (Generic Pattern)

```
┌──────────────────────────────────────────────────┐
│              MODULE NAME (e.g., Business Analyzer)│
│                                                    │
│  ┌──────────────┐    ┌──────────────────────┐     │
│  │  Input DTO   │───▶│  Validation Layer    │     │
│  └──────────────┘    │  (validators.ts)     │     │
│                       └──────────┬───────────┘     │
│                                  │                  │
│                       ┌──────────▼───────────┐     │
│                       │  Service Layer       │     │
│                       │  (service.ts)        │     │
│                       │  - orchestrates      │     │
│                       │  - calls provider    │     │
│                       │  - calls repository  │     │
│                       └──┬─────────────┬─────┘     │
│                          │             │            │
│              ┌───────────▼──┐   ┌──────▼───────┐  │
│              │ AI Provider   │   │ Repository    │  │
│              │ (GeminiClient)│   │ (SupabaseRepo)│  │
│              └──────────────┘   └──────────────┘  │
│                                                    │
│  ┌──────────────┐    ┌──────────────────────┐     │
│  │ Output DTO   │◀───│  Response Builder    │     │
│  └──────────────┘    └──────────────────────┘     │
└──────────────────────────────────────────────────┘
```

### 13.3 Data Flow: Request to Deployment

```
┌──────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│Client│     │  API     │     │ Service  │     │ Provider │     │   DB     │
│      │     │ Router   │     │          │     │ (Gemini) │     │(Supabase)│
└──┬───┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
   │              │                 │                 │               │
   │  POST /api/  │                 │                 │               │
   │  ai-factory/ │                 │                 │               │
   │  business-   │                 │                 │               │
   │  analyzer    │                 │                 │               │
   │─────────────▶│                 │                 │               │
   │              │  Validate DTO  │                 │               │
   │              │  (400 if bad)  │                 │               │
   │              │                 │                 │               │
   │              │  Call Service  │                 │               │
   │              │────────────────▶│                 │               │
   │              │                 │  Build Prompt   │               │
   │              │                 │────────────────▶│               │
   │              │                 │                 │  LLM Call     │
   │              │                 │                 │  (retry +     │
   │              │                 │                 │   fallback)   │
   │              │                 │                 │───▶ ───▶     │
   │              │                 │                 │◀─── ◀───     │
   │              │                 │  Parse Response │               │
   │              │                 │◀────────────────│               │
   │              │                 │                 │               │
   │              │                 │  Save to DB     │               │
   │              │                 │─────────────────────────────────▶│
   │              │                 │◀─────────────────────────────────│
   │              │  Return DTO    │                 │               │
   │              │◀────────────────│                 │               │
   │  Response    │                 │                 │               │
   │◀─────────────│                 │                 │               │
   │              │                 │                 │               │
```

### 13.4 Workflow Generation: Node Structure

```
Generated workflow (n8n-compatible JSON):

┌──────────────────┐
│  Node 1: Webhook │  Trigger — receives incoming HTTP request
│  Trigger         │  (path, method, options)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Node 2: Set     │  Context — sets execution variables
│  Context         │  (organizationId, employeeId, etc.)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Node 3: IF      │  Decision — conditional branching
│  Decision        │  (if condition then path A else path B)
└──┬───────────┬───┘
   │           │
   ▼           ▼
┌────────┐ ┌────────┐
│ Path A │ │ Path B │
│ Action │ │ Action │
└───┬────┘ └───┬────┘
    │           │
    └─────┬─────┘
          │
          ▼
┌──────────────────┐
│  Node 4: HTTP    │  Action — makes external API call
│  Request         │  (method, URL, headers, body)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Node 5: Code    │  Persist — stores data to Supabase
│  Persist         │  (JavaScript code block)
└──────────────────┘
```

---

## 14. Security Assessment & Scores

### 14.1 Security Assessment

| Area | Status | Risk | Recommendation |
|------|--------|------|----------------|
| **Authentication** | ❌ Not implemented | **Critical** | Add JWT validation middleware to all routes |
| **Authorization** | ❌ Not implemented | **Critical** | Implement role-based access control (RBAC) |
| **Encryption** | ⚠️ crypto.ts has AES-256-GCM but IntegrationManager uses base64 only | **High** | Wire crypto.ts into IntegrationManager |
| **API Key Exposure** | ⚠️ Keys in .env, service role key used directly | **High** | Use JWT with limited claims; rotate keys; consider vault |
| **Rate Limiting** | ❌ Not implemented | **Medium** | Add express-rate-limit middleware |
| **Input Sanitization** | ❌ Not implemented | **Medium** | Sanitize all user inputs before prompt construction |
| **CSRF Protection** | ❌ Not implemented | **Medium** | Add CSRF tokens for cookie-based auth |
| **SQL Injection** | ✅ Supabase JS client uses parameterized queries | **Low** | Maintain current approach |
| **Helmet/Headers** | ❌ Not applied | **Low** | Add helmet for security headers |
| **Secrets in Code** | ✅ No hardcoded secrets | **Good** | Maintain current approach |

### 14.2 Architecture Scores

| Category | Score | Notes |
|----------|-------|-------|
| **Modularity** | 9/10 | Strong separation of concerns, clear module boundaries |
| **Extensibility** | 8/10 | Provider pattern, repository pattern, easy to add modules |
| **Code Quality** | 7/10 | TypeScript throughout, but some TODOs and placeholders |
| **Test Coverage** | 5/10 | Tests exist for some modules, not all |
| **Security** | 3/10 | No auth, no rate limiting, base64 not encryption |
| **Persistence** | 5/10 | Only 3 modules use real DB; rest are in-memory |
| **Documentation** | 8/10 | Good code structure, this document fills remaining gaps |
| **Resilience** | 6/10 | Retry/fallback for AI calls, but no circuit breaker |
| **Monitoring** | 4/10 | Health endpoints exist but are client-side mocks |
| **Deployment** | 5/10 | Deployment orchestration exists but n8n integration is placeholder |
| **Overall** | **6.0/10** | Solid architecture foundation; production-readiness requires auth, security, persistence, and integration wiring |

### 14.3 Critical Path Items for Production

1. **Authentication & Authorization** — Add JWT middleware, RBAC, and session management
2. **Encryption** — Wire AES-256-GCM into IntegrationManager for credential storage
3. **Supabase Repositories** — Convert all in-memory repositories to real Supabase implementations
4. **n8n Integration** — Complete N8nClient implementation beyond placeholders
5. **Health Checks** — Implement real health checks (DB ping, provider ping, n8n ping)
6. **Background Scheduler** — Add cron/scheduler for ContinuousLearningService
7. **Vector Embeddings** — Replace hash-based embeddings with real embedding model (e.g., text-embedding-3-small)
8. **Rate Limiting & Input Sanitization** — Protect against abuse and injection
9. **Test Coverage** — Add tests for all modules, especially integration tests
10. **Error Monitoring** — Add structured logging and monitoring (e.g., Sentry, DataDog)

---

*This document was generated as part of the AI Real Estate Sales Employee v3.0 (AI Factory) backend architecture review. For questions or updates, contact the project lead.*
