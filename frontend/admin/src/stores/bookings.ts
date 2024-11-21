import { defineStore } from "pinia";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "./auth";
import router from "../router";

interface Booking {
  id: number | string;
  customerName: string;
  employeeName: string;
  serviceName: string;
  startTime: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  notes?: string;
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
          router.push({ name: "Login" });
          return;
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

    async fetchUpcomingBookings() {
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.token) {
          router.push({ name: "Login" });
          return;
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
        
        // Refresh the bookings list after successful cancellation
        await this.fetchDashboardStats();
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

    async updateBooking(id: number | string, data: Partial<Booking>) {
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.token) {
          router.push({ name: "Login" });
          return false;
        }

        // Ensure the Authorization header is set
        axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

        await axios.put(`${import.meta.env.VITE_API_URL}/bookings/${id}`, data);
        
        // Refresh the bookings list after successful update
        await this.fetchDashboardStats();
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
