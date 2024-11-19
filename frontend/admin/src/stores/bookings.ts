import { defineStore } from 'pinia'
import axios from 'axios'

interface Booking {
  id: number
  customerName: string
  employeeName: string
  serviceName: string
  startTime: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
}

interface BookingsState {
  bookings: Booking[]
  totalBookings: number
  todayBookings: number
  upcomingBookings: number
  isLoading: boolean
  error: string | null
}

export const useBookingStore = defineStore('bookings', {
  state: (): BookingsState => ({
    bookings: [],
    totalBookings: 0,
    todayBookings: 0,
    upcomingBookings: 0,
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchDashboardStats() {
      try {
        this.isLoading = true
        const response = await axios.get<Booking[]>(`${import.meta.env.VITE_API_URL}/bookings`)
        this.bookings = response.data
        this.calculateMetrics()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch bookings'
      } finally {
        this.isLoading = false
      }
    },

    async fetchUpcomingBookings() {
      try {
        this.isLoading = true
        const response = await axios.get<Booking[]>(`${import.meta.env.VITE_API_URL}/bookings/upcoming`)
        this.bookings = response.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch upcoming bookings'
      } finally {
        this.isLoading = false
      }
    },

    calculateMetrics() {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      this.totalBookings = this.bookings.length
      this.todayBookings = this.bookings.filter(booking => 
        new Date(booking.startTime).toDateString() === today.toDateString()
      ).length
      this.upcomingBookings = this.bookings.filter(booking =>
        new Date(booking.startTime) > today
      ).length
    }
  }
})
