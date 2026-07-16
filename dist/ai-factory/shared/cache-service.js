export class CacheService {
    cache = new Map();
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    set(key, value, ttlMs = 60_000) {
        this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    }
    invalidate(pattern) {
        if (!pattern) {
            this.clear();
            return;
        }
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }
    clear() {
        this.cache.clear();
    }
}
