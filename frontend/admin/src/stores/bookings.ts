import { defineStore } from "pinia";
import { useOrdersStore } from "./orders";
import api, { extractErrorMessage } from "../lib/api";
import type { BookingView } from "../types";

interface BookingsState {
  bookings: BookingView[];
  totalBookings: number;
  todayBookings: number;
  upcomingBookings: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const CACHE_DURATION = 60000; // 60 seconds

export const useBookingStore = defineStore("bookings", {
  state: (): BookingsState => ({
    bookings: [],
    totalBookings: 0,
    todayBookings: 0,
    upcomingBookings: 0,
    isLoading: false,
    error: null,
    lastFetched: null,
  }),

  actions: {
    shouldRefetch(): boolean {
      if (!this.lastFetched) return true;
      return Date.now() - this.lastFetched > CACHE_DURATION;
    },

    async fetchDashboardStats(forceRefresh = false) {
      if (!forceRefresh && !this.shouldRefetch() && this.bookings.length > 0) {
        this.isLoading = false;
        return;
      }

      try {
        this.isLoading = true;

        const response = await api.get<BookingView[]>("/bookings/upcoming");
        
        this.bookings = response.data;
        this.lastFetched = Date.now();
        this.calculateMetrics();
      } catch (error) {
        this.error = extractErrorMessage(error, "Kunne ikke hente bestillinger");
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUpcomingBookings(forceRefresh = false) {
      if (!forceRefresh && !this.shouldRefetch() && this.bookings.length > 0) {
        this.isLoading = false;
        return;
      }

      try {
        this.isLoading = true;

        const response = await api.get<BookingView[]>("/bookings/upcoming");
        
        this.bookings = response.data;
        this.lastFetched = Date.now();
      } catch (error) {
        this.error = extractErrorMessage(error, "Kunne ikke hente kommende bestillinger");
      } finally {
        this.isLoading = false;
      }
    },

    async completeBooking(id: number | string) {
      try {
        const ordersStore = useOrdersStore();

        await api.put(`/bookings/${id}/complete`);
        
        // Force refresh both bookings and orders
        await Promise.all([
          this.fetchDashboardStats(true),
          ordersStore.fetchOrders(true)
        ]);
        
        return true;
      } catch (error) {
        this.error = extractErrorMessage(error, "Kunne ikke fullføre bestilling");
        return false;
      }
    },

    async cancelBooking(id: number | string) {
      try {
        await api.put(`/bookings/${id}/cancel`);
        
        // Force refresh the bookings list after cancellation
        await this.fetchDashboardStats(true);
        return true;
      } catch (error) {
        this.error = extractErrorMessage(error, "Kunne ikke kansellere bestilling");
        return false;
      }
    },

    async updateBooking(id: number | string, data: Partial<BookingView>) {
      try {
        await api.put(`/bookings/${id}`, data);
        
        // Force refresh the bookings list after update
        await this.fetchDashboardStats(true);
        return true;
      } catch (error) {
        this.error = extractErrorMessage(error, "Kunne ikke oppdatere bestilling");
        return false;
      }
    },

    calculateMetrics() {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      this.totalBookings = this.bookings.length;
      this.todayBookings = this.bookings.filter(
        (booking) =>
          new Date(booking.startTime).toDateString() === today.toDateString(),
      ).length;
      this.upcomingBookings = this.bookings.length; // All bookings from /bookings/upcoming are upcoming
    },
  },
});
