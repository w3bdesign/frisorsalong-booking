import { defineStore } from 'pinia'
import { ref } from 'vue'

// TODO: This should be stored securely and provided by environment variables
const SHOP_CODE = 'SHOP123'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface Booking {
  serviceId: string
  firstName: string
  phoneNumber?: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

export interface CreateWalkInBookingParams {
  serviceId: string
  firstName: string
  phoneNumber?: string
  isPaid: boolean
}

export const useBookingStore = defineStore('booking', () => {
  const currentBooking = ref<Booking | null>(null)
  const pendingBooking = ref<Omit<CreateWalkInBookingParams, 'isPaid'> | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const setPendingBooking = (booking: Omit<CreateWalkInBookingParams, 'isPaid'>) => {
    pendingBooking.value = booking
  }

  const createWalkInBooking = async (booking: CreateWalkInBookingParams) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/bookings/walk-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shop-Code': SHOP_CODE,
          accept: '*/*',
        },
        body: JSON.stringify({
          serviceId: booking.serviceId,
          firstName: booking.firstName,
          phoneNumber: booking.phoneNumber,
          isPaid: booking.isPaid,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to create booking')
      }

      const data = await response.json()
      currentBooking.value = data
      pendingBooking.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create booking'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  const clearBooking = () => {
    currentBooking.value = null
    pendingBooking.value = null
    error.value = null
  }

  return {
    currentBooking,
    pendingBooking,
    isLoading,
    error,
    setPendingBooking,
    createWalkInBooking,
    clearBooking,
  }
})
