import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useServicesStore } from '../services'

// Mock service data
const mockServices = [
  {
    id: '1',
    name: 'Haircut',
    description: 'Basic haircut',
    duration: 30,
    price: '300',
    isActive: true,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
]

describe('Services Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia())

    // Reset all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('Initial State', () => {
    it('should have empty initial state', async () => {
      // Mock fetch before creating store
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        }),
      )

      const store = useServicesStore()

      // Initial state should show loading
      expect(store.isLoading).toBe(true)
      expect(store.services).toEqual([])
      expect(store.error).toBe(null)
      expect(store.selectedService).toBe(null)

      // Wait for the initial fetch to complete
      await new Promise((resolve) => setImmediate(resolve))

      // After fetch completes
      expect(store.isLoading).toBe(false)
      expect(store.services).toEqual([])
      expect(store.error).toBe(null)
      expect(store.selectedService).toBe(null)
    })
  })

  describe('fetchServices', () => {
    it('should fetch services successfully', async () => {
      // Mock successful fetch response before creating store
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockServices),
        }),
      )

      const store = useServicesStore()
      await store.fetchServices()

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/services')
      expect(store.services).toEqual(mockServices)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('should handle fetch error', async () => {
      // Mock failed fetch response before creating store
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
        }),
      )

      const store = useServicesStore()
      await store.fetchServices()

      expect(store.services).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Failed to fetch services')
    })

    it('should handle network error', async () => {
      // Mock network error before creating store
      global.fetch = vi.fn().mockImplementation(() => Promise.reject(new Error('Network error')))

      const store = useServicesStore()
      await store.fetchServices()

      expect(store.services).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Network error')
    })
  })

  describe('selectService', () => {
    it('should select a service', async () => {
      // Mock fetch before creating store
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        }),
      )

      const store = useServicesStore()

      // Wait for the initial fetch to complete
      await new Promise((resolve) => setImmediate(resolve))

      store.selectService(mockServices[0])
      expect(store.selectedService).toEqual(mockServices[0])
    })
  })

  describe('clearSelection', () => {
    it('should clear selected service', async () => {
      // Mock fetch before creating store
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        }),
      )

      const store = useServicesStore()

      // Wait for the initial fetch to complete
      await new Promise((resolve) => setImmediate(resolve))

      store.selectService(mockServices[0])
      expect(store.selectedService).toEqual(mockServices[0])

      store.clearSelection()
      expect(store.selectedService).toBe(null)
    })
  })
})
