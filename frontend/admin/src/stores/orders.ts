import { defineStore } from "pinia";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "./auth";
import type { Order } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

interface EmployeeStats {
  id: string;
  count: number;
  revenue: number;
}

export const useOrdersStore = defineStore("orders", {
  state: (): OrdersState => ({
    orders: [],
    loading: false,
    error: null,
  }),

  getters: {
    getOrdersByEmployee: (state) => (employeeId: string) => {
      return state.orders.filter(
        (order) => order.booking.employee.id === employeeId
      );
    },

    getEmployeeStats: (state) => {
      const stats = new Map<string, EmployeeStats>();

      state.orders.forEach((order) => {
        const employeeId = order.booking.employee.id;
        const amount = parseFloat(order.totalAmount);

        if (!stats.has(employeeId)) {
          stats.set(employeeId, {
            id: employeeId,
            count: 0,
            revenue: 0,
          });
        }

        const employeeStats = stats.get(employeeId)!;
        employeeStats.count++;
        employeeStats.revenue += amount;
      });

      return Array.from(stats.values());
    },
  },

  actions: {
    async fetchOrders(forceRefresh = false) {
      try {
        if (this.loading && !forceRefresh) return;

        this.loading = true;
        this.error = null;

        const authStore = useAuthStore();
        let endpoint = `${API_URL}/orders`;

        // If user is an employee, use the employee-specific endpoint
        if (!authStore.isAdmin && authStore.user?.id) {
          endpoint = `${API_URL}/orders/employee/${authStore.user.id}`;
        }

        const response = await axios.get<Order[]>(endpoint);
        this.orders = response.data;
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (error instanceof AxiosError && error.response?.status === 403) {
          this.error = "Ingen tilgang: Du har ikke tillatelse til å se disse ordrene";
        } else {
          this.error = "Kunne ikke hente ordrer. Vennligst prøv igjen senere.";
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
