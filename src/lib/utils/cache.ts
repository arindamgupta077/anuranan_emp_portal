/**
 * Client-side cache utility for storing page data
 * This helps reduce unnecessary re-fetches when navigating between pages
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class ClientCache {
  private cache: Map<string, CacheEntry<any>>
  private defaultTTL: number

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map()
    this.defaultTTL = defaultTTL
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiresAt = now + (ttl || this.defaultTTL)
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    
    // Check if cache has expired
    if (now > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    const now = Date.now()
    
    if (now > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys())
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    })
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    const keys = Array.from(this.cache.keys())
    
    keys.forEach(key => {
      const entry = this.cache.get(key)
      if (entry && now > entry.expiresAt) {
        this.cache.delete(key)
      }
    })
  }
}

// Create a singleton instance
export const clientCache = new ClientCache()

// Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    clientCache.cleanup()
  }, 5 * 60 * 1000)
}

// Cache key generators for different pages
export const cacheKeys = {
  dashboard: (userId: string) => `dashboard-${userId}`,
  tasks: (userId: string, status?: string) => `tasks-${userId}-${status || 'all'}`,
  selfTasks: (userId: string) => `self-tasks-${userId}`,
  leaves: (userId: string) => `leaves-${userId}`,
  admin: () => `admin-data`,
  reports: (filters?: string) => `reports-${filters || 'all'}`,
  profile: (userId: string) => `profile-${userId}`,
}
