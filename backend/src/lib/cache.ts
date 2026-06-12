/**
 * Redis-backed cache with in-memory fallback for dev.
 * Works across multiple instances (horizontal scaling).
 */

import Redis from 'ioredis'

export const DEFAULT_TTL = 300 // seconds

// ── Redis client ─────────────────────────────────────────────────────────────

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  const url = process.env.REDIS_URL
  if (!url || url.includes('localhost')) return null // use in-memory in dev without local Redis
  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: false,
      lazyConnect: true,
      connectTimeout: 3000,
    })
    redis.on('error', () => { redis = null }) // fall back gracefully
    return redis
  } catch {
    return null
  }
}

// ── In-memory fallback ───────────────────────────────────────────────────────

const store = new Map<string, { data: unknown; expiresAt: number }>()

// ── Public API ───────────────────────────────────────────────────────────────

export async function fromCache<T>(key: string): Promise<T | null> {
  const r = getRedis()
  if (r) {
    try {
      const val = await r.get(key)
      return val ? (JSON.parse(val) as T) : null
    } catch { /* fall through */ }
  }
  // in-memory fallback
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { store.delete(key); return null }
  return entry.data as T
}

export async function toCache(key: string, data: unknown, ttl = DEFAULT_TTL) {
  const r = getRedis()
  if (r) {
    try {
      await r.set(key, JSON.stringify(data), 'EX', ttl)
      return
    } catch { /* fall through */ }
  }
  // in-memory fallback
  store.set(key, { data, expiresAt: Date.now() + ttl * 1000 })
}

export async function invalidatePrefix(prefix: string) {
  const r = getRedis()
  if (r) {
    try {
      const keys = await r.keys(`${prefix}*`)
      if (keys.length) await r.del(...keys)
      return
    } catch { /* fall through */ }
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}

export async function invalidateKey(key: string) {
  const r = getRedis()
  if (r) { try { await r.del(key) } catch { /* */ } }
  store.delete(key)
}

export function cacheStats() {
  return { backend: redis ? 'redis' : 'memory', size: store.size }
}
