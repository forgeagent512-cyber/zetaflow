import type { PromptGeneratorInputDto, PromptPackageDto } from './prompt-generator.dto.js';

export interface GeneratedPromptRecord {
  id: string;
  organizationId: string;
  employeeId?: string;
  agentId?: string;
  promptName: string;
  promptType: string;
  systemPrompt: string;
  developerPrompt: string;
  assistantPrompt: string;
  promptJson: Record<string, unknown>;
  version: string;
  status: 'active' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface PromptRepository {
  findByName(promptName: string): Promise<GeneratedPromptRecord | null>;
  save(record: GeneratedPromptRecord): Promise<GeneratedPromptRecord>;
}

export interface PromptGeneratorProvider {
  generate(input: PromptGeneratorInputDto): Promise<PromptPackageDto>;
}
