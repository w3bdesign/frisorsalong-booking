import { defineStore } from "pinia";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "./auth";
import router from "../router";
import type { Order } from "../types";

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const CACHE_DURATION = 300000; // 5 minutes

export const useOrdersStore = defineStore("orders", {
  state: (): OrdersState => ({
    orders: [],
    loading: false,
    error: null,
    lastFetched: null,
  }),

  actions: {
    shouldRefetch(): boolean {
      if (!this.lastFetched) return true;
      return Date.now() - this.lastFetched > CACHE_DURATION;
    },

    async fetchOrders(forceRefresh = false) {
      // Return cached data if it's still fresh
      if (!forceRefresh && !this.shouldRefetch() && this.orders.length > 0) {
        this.loading = false; // Ensure loading is false when using cache
        return;
      }

      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated || !authStore.token) {
          router.push({ name: "Login" });
          return;
        }

        // Only set loading to true if we're actually fetching
        this.loading = true;
        
        // Ensure the Authorization header is set
        axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

        console.log('Fetching orders from API...');
        const response = await axios.get<Order[]>(
          `${import.meta.env.VITE_API_URL}/orders`
        );
        console.log('Orders received:', response.data);
        
        this.orders = response.data;
        this.lastFetched = Date.now();

        // Log the first order's date if available
        if (this.orders.length > 0) {
          console.log('First order completed at:', new Date(this.orders[0].completedAt).toISOString());
        }
      } catch (error) {
        console.error('Error details:', error);
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
        console.error("Error fetching orders:", error);
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    }
  },

  getters: {
    getOrdersByDate: (state) => {
      return (startDate: Date, endDate: Date) => {
        return state.orders.filter(order => {
          const orderDate = new Date(order.completedAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
      };
    },

    getOrdersByEmployee: (state) => {
      return (employeeId: string | null) => {
        if (!employeeId) return state.orders;
        return state.orders.filter(order => 
          order.booking.employee.id === employeeId
        );
      };
    },

    getEmployeeStats: (state) => {
      const stats = new Map<string, { count: number; revenue: number; employeeName: string }>();
      
      state.orders.forEach(order => {
        const employee = order.booking.employee;
        const employeeId = employee.id;
        const currentStats = stats.get(employeeId) || {
          count: 0,
          revenue: 0,
          employeeName: `${employee.user.firstName} ${employee.user.lastName}`
        };

        currentStats.count += 1;
        currentStats.revenue += parseFloat(order.totalAmount);
        stats.set(employeeId, currentStats);
      });

      return Array.from(stats.entries()).map(([id, data]) => ({
        id,
        ...data
      }));
    },

    getTotalRevenue: (state) => {
      return state.orders.reduce((total, order) => {
        return total + parseFloat(order.totalAmount);
      }, 0);
    },

    getOrderCount: (state) => {
      return state.orders.length;
    }
  }
});
