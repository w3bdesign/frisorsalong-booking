import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Booking {
  serviceId: string
  date: string
  time: string
  customerId?: string
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
      // TODO: Implement API call
      currentBooking.value = {
        ...booking,
        status: 'pending',
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create booking'
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
