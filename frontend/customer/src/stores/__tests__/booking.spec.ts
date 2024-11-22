import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBookingStore } from '../booking'

// Mock booking data
const mockBooking = {
  serviceId: '1',
  time: '2023-12-24T10:00:00',
  phoneNumber: '12345678',
}

const mockBookingResponse = {
  ...mockBooking,
  status: 'pending' as const,
}

describe('Booking Store', () => {
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
    it('should have empty initial state', () => {
      const store = useBookingStore()

      expect(store.currentBooking).toBe(null)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe('createBooking', () => {
    it('should create booking successfully', async () => {
      // Mock successful fetch response
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBookingResponse),
        }),
      )

      const store = useBookingStore()
      await store.createBooking(mockBooking)

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify(mockBooking),
      })
      expect(store.currentBooking).toEqual(mockBookingResponse)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('should handle fetch error', async () => {
      // Mock failed fetch response
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
        }),
      )

      const store = useBookingStore()

      await expect(store.createBooking(mockBooking)).rejects.toThrow('Failed to create booking')

      expect(store.currentBooking).toBe(null)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Failed to create booking')
    })

    it('should handle network error', async () => {
      // Mock network error
      global.fetch = vi.fn().mockImplementation(() => Promise.reject(new Error('Network error')))

      const store = useBookingStore()

      await expect(store.createBooking(mockBooking)).rejects.toThrow('Network error')

      expect(store.currentBooking).toBe(null)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Network error')
    })
  })

  describe('clearBooking', () => {
    it('should clear current booking and error', async () => {
      // First create a booking
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBookingResponse),
        }),
      )

      const store = useBookingStore()
      await store.createBooking(mockBooking)

      // Verify booking was created
      expect(store.currentBooking).toEqual(mockBookingResponse)

      // Clear the booking
      store.clearBooking()

      // Verify state is cleared
      expect(store.currentBooking).toBe(null)
      expect(store.error).toBe(null)
    })
  })
})
