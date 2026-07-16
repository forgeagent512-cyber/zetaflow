import { randomUUID } from 'node:crypto';
export class PromptVersionManager {
    versions = new Map();
    saveVersion(promptName, content, changelog, createdBy) {
        const existing = this.versions.get(promptName) ?? [];
        const version = String(existing.length + 1);
        const entry = {
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
    getVersion(promptName, version) {
        const existing = this.versions.get(promptName);
        if (!existing || existing.length === 0)
            return null;
        if (!version)
            return existing[existing.length - 1];
        return existing.find((v) => v.version === version) ?? null;
    }
    listVersions(promptName) {
        return this.versions.get(promptName) ?? [];
    }
    rollback(promptName, version) {
        const target = this.getVersion(promptName, version);
        if (!target)
            return null;
        return this.saveVersion(promptName, target.content, `rollback to version ${version}`, target.createdBy);
    }
}
