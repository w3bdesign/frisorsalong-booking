import { defineStore } from "pinia";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "./auth";
import { useOrdersStore } from "./orders";
import router from "../router";
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
      // Return cached data if it's still fresh
      if (!forceRefresh && !this.shouldRefetch() && this.bookings.length > 0) {
        this.isLoading = false; // Ensure loading is false when using cache
        return;
      }

      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.token) {
          router.push({ name: "Login" });
          return;
        }

        // Only set loading to true if we're actually fetching
        this.isLoading = true;

        // Ensure the Authorization header is set
        axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

        const response = await axios.get<BookingView[]>(
          `${import.meta.env.VITE_API_URL}/bookings/upcoming`,
        );
        
        // Store the bookings directly
        this.bookings = response.data;
        this.lastFetched = Date.now();
        this.calculateMetrics();

        console.log('Fetched bookings:', this.bookings);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            router.push({ name: "Login" });
            this.error = "Økt utløpt. Vennligst logg inn igjen.";
          } else {
            this.error = error.response?.data?.message || "Kunne ikke hente bestillinger";
          }
        } else {
          this.error =
            error instanceof Error ? error.message : "Kunne ikke hente bestillinger";
        }
        console.error("Error fetching bookings:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUpcomingBookings(forceRefresh = false) {
      // Return cached data if it's still fresh
      if (!forceRefresh && !this.shouldRefetch() && this.bookings.length > 0) {
        this.isLoading = false; // Ensure loading is false when using cache
        return;
      }

      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.token) {
          router.push({ name: "Login" });
          return;
        }

        // Only set loading to true if we're actually fetching
        this.isLoading = true;

        // Ensure the Authorization header is set
        axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

        const response = await axios.get<BookingView[]>(
          `${import.meta.env.VITE_API_URL}/bookings/upcoming`,
        );
        
        // Store the bookings directly
        this.bookings = response.data;
        this.lastFetched = Date.now();

        console.log('Fetched upcoming bookings:', this.bookings);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            router.push({ name: "Login" });
            this.error = "Økt utløpt. Vennligst logg inn igjen.";
          } else {
            this.error = error.response?.data?.message || "Kunne ikke hente kommende bestillinger";
          }
        } else {
          this.error =
            error instanceof Error
              ? error.message
              : "Kunne ikke hente kommende bestillinger";
        }
        console.error("Error fetching upcoming bookings:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async completeBooking(id: number | string) {
      try {
        const authStore = useAuthStore();
        const ordersStore = useOrdersStore();
        
        if (!authStore.isAuthenticated || !authStore.token) {
          router.push({ name: "Login" });
          return false;
        }

        // Ensure the Authorization header is set
        axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

        console.log('Completing booking:', id);
        const response = await axios.put(`${import.meta.env.VITE_API_URL}/bookings/${id}/complete`);
        console.log('Complete booking response:', response.data);
        
        // Force refresh both bookings and orders
        await Promise.all([
          this.fetchDashboardStats(true),
          ordersStore.fetchOrders(true)
        ]);
        
        return true;
      } catch (error) {
        console.error('Error details:', error);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            router.push({ name: "Login" });
            this.error = "Økt utløpt. Vennligst logg inn igjen.";
          } else {
            this.error = error.response?.data?.message || "Kunne ikke fullføre bestilling";
          }
        } else {
          this.error =
            error instanceof Error ? error.message : "Kunne ikke fullføre bestilling";
        }
        console.error("Error completing booking:", error);
        return false;
      }
    },

    async cancelBooking(id: number | string) {
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.token) {
          router.push({ name: "Login" });
          return false;
        }

        // Ensure the Authorization header is set
        axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

        await axios.put(`${import.meta.env.VITE_API_URL}/bookings/${id}/cancel`);
        
        // Force refresh the bookings list after cancellation
        await this.fetchDashboardStats(true);
        return true;
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            router.push({ name: "Login" });
            this.error = "Økt utløpt. Vennligst logg inn igjen.";
          } else {
            this.error = error.response?.data?.message || "Kunne ikke kansellere bestilling";
          }
        } else {
          this.error =
            error instanceof Error ? error.message : "Kunne ikke kansellere bestilling";
        }
        console.error("Error canceling booking:", error);
        return false;
      }
    },

    async updateBooking(id: number | string, data: Partial<BookingView>) {
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.token) {
          router.push({ name: "Login" });
          return false;
        }

        // Ensure the Authorization header is set
        axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

        await axios.put(`${import.meta.env.VITE_API_URL}/bookings/${id}`, data);
        
        // Force refresh the bookings list after update
        await this.fetchDashboardStats(true);
        return true;
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            router.push({ name: "Login" });
            this.error = "Økt utløpt. Vennligst logg inn igjen.";
          } else {
            this.error = error.response?.data?.message || "Kunne ikke oppdatere bestilling";
          }
        } else {
          this.error =
            error instanceof Error ? error.message : "Kunne ikke oppdatere bestilling";
        }
        console.error("Error updating booking:", error);
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
