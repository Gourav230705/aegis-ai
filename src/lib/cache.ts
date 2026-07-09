export class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, { value: T; expiresAt: number }>;

  constructor(capacity: number = 100) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    // Refresh LRU
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key: string, value: T, ttlMs: number = 60000): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first item in Map iterator)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

// Global instance for tool caching
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const evidenceCache = new LRUCache<any>(500);
