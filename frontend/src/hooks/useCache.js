import { useState, useEffect, useCallback } from 'react'

const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useCache(key, fetcher, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const duration = options.duration || CACHE_DURATION
  const enabled = options.enabled !== false

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return

    const cached = cache.get(key)
    const now = Date.now()

    if (!force && cached && (now - cached.timestamp < duration)) {
      setData(cached.data)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await fetcher()
      cache.set(key, { data: result, timestamp: now })
      setData(result)
    } catch (err) {
      setError(err)
      console.error(`Cache fetch error for ${key}:`, err)
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, duration, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const invalidate = useCallback(() => {
    cache.delete(key)
    fetchData(true)
  }, [key, fetchData])

  return { data, loading, error, refetch: invalidate }
}

export function clearCache(key) {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}
