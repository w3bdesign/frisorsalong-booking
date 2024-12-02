<template>
  <div class="p-4">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Fullførte bestillinger</h1>
        <Button
          @click="refreshData"
          variant="primary"
          :loading="loading"
        >
          Oppdater
        </Button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{{ error }}</span>
      </div>

      <!-- Filters -->
      <div class="mb-6 bg-white p-4 rounded-lg shadow space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Velg dato</label
          >
          <input
            type="date"
            v-model="selectedDate"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <!-- Chart -->
      <div class="mb-8 bg-white p-4 rounded-lg shadow">
        <OrdersChart :orders="filteredOrders" />
      </div>

      <!-- Loading and Error States -->
      <div v-if="loading" class="text-center py-4">
        Laster data...
      </div>

      <div v-else-if="error" class="text-red-500 py-4">
        {{ error }}
      </div>

      <div v-else-if="filteredOrders.length === 0" class="text-center py-4">
        Ingen fullførte bestillinger funnet for valgte filtre.
      </div>

      <!-- Orders Table -->
      <div v-else class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Kunde
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ansatt
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tjeneste
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Varighet
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Pris
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fullført
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Notater
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ order.booking.customer.firstName }}
                {{ order.booking.customer.lastName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ order.booking.employee.user.firstName }}
                {{ order.booking.employee.user.lastName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ order.booking.service.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ order.booking.service.duration }} minutter
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatPrice(order.totalAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatTime(order.completedAt) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ order.notes || "-" }}
              </td>
            </tr>
            <!-- Total Row -->
            <tr class="bg-gray-50">
              <td
                colspan="4"
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
              >
                Total
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
              >
                {{ formatPrice(totalAmount) }}
              </td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useOrdersStore } from "../stores/orders";
import { useAuthStore } from "../stores/auth";
import { storeToRefs } from "pinia";
import OrdersChart from "../components/OrdersChart.vue";
import Button from "../components/base/Button.vue";

const ordersStore = useOrdersStore();
const authStore = useAuthStore();
const { orders, loading, error } = storeToRefs(ordersStore);

// Set up periodic refresh
let refreshInterval: number | null = null;

// Date handling - initialize with today's date in local timezone
const today = new Date();
const selectedDate = ref(today.toISOString().split("T")[0]);

const filteredOrders = computed(() => {
  let filtered = orders.value;

  // Filter by date
  if (selectedDate.value) {
    const selectedDateObj = new Date(selectedDate.value);
    const startOfDay = new Date(
      selectedDateObj.getFullYear(),
      selectedDateObj.getMonth(),
      selectedDateObj.getDate()
    );
    const endOfDay = new Date(
      selectedDateObj.getFullYear(),
      selectedDateObj.getMonth(),
      selectedDateObj.getDate(),
      23,
      59,
      59,
      999
    );

    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.completedAt);
      return orderDate >= startOfDay && orderDate <= endOfDay;
    });
  }

  return filtered;
});

const totalAmount = computed(() => {
  return filteredOrders.value.reduce((sum, order) => {
    return sum + parseFloat(order.totalAmount);
  }, 0);
});

function formatTime(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Tid ikke tilgjengelig";
  }
}

function formatPrice(price: string | number): string {
  try {
    const amount = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting price:", error);
    return "NOK -";
  }
}

function refreshData() {
  ordersStore.fetchOrders(true);
}

// Watch for filter changes to log filtering info
watch([selectedDate, orders], () => {
  console.log("Filtering debug:");
  console.log("Selected date:", selectedDate.value);
  console.log("Total orders:", orders.value.length);
  console.log("Filtered orders:", filteredOrders.value.length);
});

onMounted(async () => {
  await ordersStore.fetchOrders();
  
  // Set up periodic refresh every 5 minutes
  refreshInterval = window.setInterval(() => {
    ordersStore.fetchOrders();
  }, 300000); // 5 minutes in milliseconds
});

onUnmounted(() => {
  if (refreshInterval !== null) {
    clearInterval(refreshInterval);
  }
});
</script>
