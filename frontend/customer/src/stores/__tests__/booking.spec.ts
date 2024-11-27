import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBookingStore } from '../booking'

// Mock booking data
const mockBooking = {
  serviceId: '1',
  firstName: 'Test',
  phoneNumber: '12345678',
  isPaid: true,
}

const mockBookingResponse = {
  id: '1',
  serviceId: '1',
  firstName: 'Test',
  phoneNumber: '12345678',
  status: 'confirmed' as const,
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
      expect(store.pendingBooking).toBe(null)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe('createWalkInBooking', () => {
    it('should create walk-in booking successfully', async () => {
      // Mock successful fetch response
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBookingResponse),
        }),
      )

      const store = useBookingStore()
      await store.createWalkInBooking(mockBooking)

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/bookings/walk-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shop-Code': 'SHOP123',
          accept: '*/*',
        },
        body: JSON.stringify({
          serviceId: mockBooking.serviceId,
          firstName: mockBooking.firstName,
          phoneNumber: mockBooking.phoneNumber,
          isPaid: mockBooking.isPaid,
        }),
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
          json: () => Promise.resolve({ message: 'Failed to create booking' }),
        }),
      )

      const store = useBookingStore()

      await expect(store.createWalkInBooking(mockBooking)).rejects.toThrow(
        'Failed to create booking',
      )

      expect(store.currentBooking).toBe(null)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Failed to create booking')
    })

    it('should handle network error', async () => {
      // Mock network error
      global.fetch = vi.fn().mockImplementation(() => Promise.reject(new Error('Network error')))

      const store = useBookingStore()

      await expect(store.createWalkInBooking(mockBooking)).rejects.toThrow('Network error')

      expect(store.currentBooking).toBe(null)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Network error')
    })
  })

  describe('setPendingBooking', () => {
    it('should set pending booking', () => {
      const store = useBookingStore()
      const pendingBooking = {
        serviceId: '1',
        firstName: 'Test',
        phoneNumber: '12345678',
      }

      store.setPendingBooking(pendingBooking)
      expect(store.pendingBooking).toEqual(pendingBooking)
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
      await store.createWalkInBooking(mockBooking)

      // Verify booking was created
      expect(store.currentBooking).toEqual(mockBookingResponse)

      // Clear the booking
      store.clearBooking()

      // Verify state is cleared
      expect(store.currentBooking).toBe(null)
      expect(store.pendingBooking).toBe(null)
      expect(store.error).toBe(null)
    })
  })
})
