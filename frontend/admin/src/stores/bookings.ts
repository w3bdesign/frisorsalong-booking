import { defineStore } from "pinia";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "./auth";

interface Booking {
  id: number;
  customerName: string;
  employeeName: string;
  serviceName: string;
  startTime: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
}

interface BookingsState {
  bookings: Booking[];
  totalBookings: number;
  todayBookings: number;
  upcomingBookings: number;
  isLoading: boolean;
  error: string | null;
}

export const useBookingStore = defineStore("bookings", {
  state: (): BookingsState => ({
    bookings: [],
    totalBookings: 0,
    todayBookings: 0,
    upcomingBookings: 0,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchDashboardStats() {
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.token) {
          throw new Error("Authentication required");
        }

        // Ensure the Authorization header is set
        axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

        this.isLoading = true;
        const response = await axios.get<Booking[]>(
          `${import.meta.env.VITE_API_URL}/bookings/upcoming`,
        );
        this.bookings = response.data;
        this.calculateMetrics();
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            this.error = "Session expired. Please login again.";
          } else {
            this.error = error.response?.data?.message || "Failed to fetch bookings";
          }
        } else {
          this.error =
            error instanceof Error ? error.message : "Failed to fetch bookings";
        }
        console.error("Error fetching bookings:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUpcomingBookings() {
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.token) {
          throw new Error("Authentication required");
        }

        // Ensure the Authorization header is set
        axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

        this.isLoading = true;
        const response = await axios.get<Booking[]>(
          `${import.meta.env.VITE_API_URL}/bookings/upcoming`,
        );
        this.bookings = response.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            this.error = "Session expired. Please login again.";
          } else {
            this.error = error.response?.data?.message || "Failed to fetch upcoming bookings";
          }
        } else {
          this.error =
            error instanceof Error
              ? error.message
              : "Failed to fetch upcoming bookings";
        }
        console.error("Error fetching upcoming bookings:", error);
      } finally {
        this.isLoading = false;
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
