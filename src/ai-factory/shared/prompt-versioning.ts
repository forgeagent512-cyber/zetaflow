import { randomUUID } from 'node:crypto';

export interface PromptVersion {
  id: string;
  promptName: string;
  version: string;
  content: string;
  changelog: string;
  createdAt: string;
  createdBy?: string;
}

export class PromptVersionManager {
  private versions = new Map<string, PromptVersion[]>();

  saveVersion(promptName: string, content: string, changelog: string, createdBy?: string): PromptVersion {
    const existing = this.versions.get(promptName) ?? [];
    const version = String(existing.length + 1);
    const entry: PromptVersion = {
      id: randomUUID(),
      promptName,
      version,
      content,
      changelog,
      createdAt: new Date().toISOString(),
      createdBy
    };
    existing.push(entry);
    this.versions.set(promptName, existing);
    return entry;
  }

  getVersion(promptName: string, version?: string): PromptVersion | null {
    const existing = this.versions.get(promptName);
    if (!existing || existing.length === 0) return null;
    if (!version) return existing[existing.length - 1];
    return existing.find((v) => v.version === version) ?? null;
  }

  listVersions(promptName: string): PromptVersion[] {
    return this.versions.get(promptName) ?? [];
  }

  rollback(promptName: string, version: string): PromptVersion | null {
    const target = this.getVersion(promptName, version);
    if (!target) return null;
    return this.saveVersion(promptName, target.content, `rollback to version ${version}`, target.createdBy);
  }
}
