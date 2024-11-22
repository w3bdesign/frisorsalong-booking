import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWaitingStore } from '../waiting'
import { flushPromises } from '@vue/test-utils'

describe('Waiting Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    // Mock fetch for all tests
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(0),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('initializes with default values', () => {
      const store = useWaitingStore()
      expect(store.queueStatus).toMatchObject({
        peopleWaiting: 0,
        estimatedWaitTime: 0,
      })
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('Computed Properties', () => {
    it('formats wait time correctly with only minutes', () => {
      const store = useWaitingStore()
      store.queueStatus.estimatedWaitTime = 45
      expect(store.formattedWaitTime).toBe('45min')
    })

    it('formats wait time correctly with hours and minutes', () => {
      const store = useWaitingStore()
      store.queueStatus.estimatedWaitTime = 90 // 1h 30min
      expect(store.formattedWaitTime).toBe('1h 30min')
    })
  })

  describe('API Methods', () => {
    it('fetches queue status successfully', async () => {
      const mockResponse = 3 // 3 people waiting
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const store = useWaitingStore()
      await store.fetchQueueStatus()

      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.queueStatus).toMatchObject({
        peopleWaiting: 3,
        estimatedWaitTime: 90, // 3 people * 30 minutes
      })
      expect(store.queueStatus.lastUpdated).toBeDefined()
    })

    it('handles fetch error correctly with Error instance', async () => {
      const errorMessage = 'Failed to fetch queue status'
      global.fetch = vi.fn().mockRejectedValue(new Error(errorMessage))

      const store = useWaitingStore()
      await store.fetchQueueStatus()

      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(errorMessage)
      expect(store.queueStatus).toMatchObject({
        peopleWaiting: 0,
        estimatedWaitTime: 0,
      })
    })

    it('handles fetch error correctly with non-Error instance', async () => {
      const errorMessage = 'Network error'
      global.fetch = vi.fn().mockRejectedValue(errorMessage)

      const store = useWaitingStore()
      await store.fetchQueueStatus()

      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Failed to fetch queue status')
      expect(store.queueStatus).toMatchObject({
        peopleWaiting: 0,
        estimatedWaitTime: 0,
      })
    })

    it('handles non-ok response correctly', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      })

      const store = useWaitingStore()
      await store.fetchQueueStatus()

      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Failed to fetch queue status')
    })
  })

  describe('Polling', () => {
    it('starts polling and fetches initial data', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(0),
      })
      global.fetch = fetchMock

      const store = useWaitingStore()
      store.startPolling(1000)
      await flushPromises()

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('continues polling at specified interval', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(0),
      })
      global.fetch = fetchMock

      const store = useWaitingStore()
      store.startPolling(1000) // 1 second interval
      await flushPromises()
      expect(fetchMock).toHaveBeenCalledTimes(1)

      // Advance timer by 2 seconds
      await vi.advanceTimersByTimeAsync(2000)
      await flushPromises()
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('returns interval ID that can be cleared', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(0),
      })
      global.fetch = fetchMock

      const store = useWaitingStore()
      const intervalId = store.startPolling(1000)
      await flushPromises()
      expect(fetchMock).toHaveBeenCalledTimes(1)

      clearInterval(intervalId)
      await vi.advanceTimersByTimeAsync(2000)
      await flushPromises()
      expect(fetchMock).toHaveBeenCalledTimes(1) // No additional calls after clearing
    })
  })
})
