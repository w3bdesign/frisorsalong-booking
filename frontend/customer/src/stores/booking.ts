import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Booking {
  serviceId: string
  time: string
  phoneNumber: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

export const useBookingStore = defineStore('booking', () => {
  const currentBooking = ref<Booking | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const createBooking = async (booking: Omit<Booking, 'status'>) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify(booking),
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      const data = await response.json()
      currentBooking.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create booking'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  const clearBooking = () => {
    currentBooking.value = null
    error.value = null
  }

  return {
    currentBooking,
    isLoading,
    error,
    createBooking,
    clearBooking,
  }
})
