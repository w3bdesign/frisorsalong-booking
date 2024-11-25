import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import type { Order } from "../types";
import { useAuthStore } from "./auth";
import router from "../router";

export const useOrdersStore = defineStore("orders", () => {
  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchOrders() {
    loading.value = true;
    error.value = null;
    try {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.token) {
        router.push({ name: "Login" });
        return;
      }

      axios.defaults.headers.common["Authorization"] =
        `Bearer ${authStore.token}`;
      const response = await axios.get<Order[]>(
        `${import.meta.env.VITE_API_URL}/orders`
      );
      orders.value = response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          const authStore = useAuthStore();
          authStore.logout();
          router.push({ name: "Login" });
          error.value = "Økt utløpt. Vennligst logg inn igjen.";
        } else {
          error.value =
            err.response?.data?.message || "Kunne ikke hente bestillinger";
        }
      } else {
        error.value =
          err instanceof Error ? err.message : "Kunne ikke hente bestillinger";
      }
      console.error("Error fetching orders:", err);
    } finally {
      loading.value = false;
    }
  }

  async function deleteOrder(id: string) {
    try {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.token) {
        router.push({ name: "Login" });
        return false;
      }

      axios.defaults.headers.common["Authorization"] =
        `Bearer ${authStore.token}`;
      await axios.delete(`${import.meta.env.VITE_API_URL}/orders/${id}`);

      // Refresh the orders list after successful deletion
      await fetchOrders();
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          const authStore = useAuthStore();
          authStore.logout();
          router.push({ name: "Login" });
          error.value = "Økt utløpt. Vennligst logg inn igjen.";
        } else {
          error.value =
            err.response?.data?.message || "Kunne ikke slette bestilling";
        }
      } else {
        error.value =
          err instanceof Error ? err.message : "Kunne ikke slette bestilling";
      }
      console.error("Error deleting order:", err);
      return false;
    }
  }

  return {
    orders,
    loading,
    error,
    fetchOrders,
    deleteOrder,
  };
});
