<template>
  <div class="p-4">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Fullførte bestillinger</h1>
        <button
          @click="refreshData"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Oppdater
        </button>
      </div>

      <!-- Date Picker -->
      <div class="mb-6 bg-white p-4 rounded-lg shadow">
        <label class="block text-sm font-medium text-gray-700 mb-2">Velg dato</label>
        <input
          type="date"
          v-model="selectedDate"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      
      <!-- Chart -->
      <div class="mb-8 bg-white p-4 rounded-lg shadow">
        <OrdersChart :orders="filteredOrders" />
      </div>

      <!-- Loading and Error States -->
      <div v-if="loading" class="text-center py-4">
        Laster bestillinger...
      </div>
      
      <div v-else-if="error" class="text-red-500 py-4">
        {{ error }}
      </div>
      
      <div v-else-if="filteredOrders.length === 0" class="text-center py-4">
        Ingen fullførte bestillinger funnet for valgt dato.
      </div>

      <!-- Orders Table -->
      <div v-else class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kunde
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tjeneste
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Varighet
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pris
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fullført
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notater
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ order.booking.customer.firstName }} {{ order.booking.customer.lastName }}
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
                {{ order.notes || '-' }}
              </td>
            </tr>
            <!-- Total Row -->
            <tr class="bg-gray-50">
              <td colspan="3" class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useOrdersStore } from '../stores/orders'
import { storeToRefs } from 'pinia'
import OrdersChart from '../components/OrdersChart.vue'

const ordersStore = useOrdersStore()
const { orders, loading, error } = storeToRefs(ordersStore)

// Set up periodic refresh
let refreshInterval: number | null = null;

// Date handling
const selectedDate = ref(new Date().toISOString().split('T')[0])

const filteredOrders = computed(() => {
  if (!selectedDate.value) return orders.value;
  
  return orders.value.filter(order => {
    const orderDate = new Date(order.completedAt).toISOString().split('T')[0];
    return orderDate === selectedDate.value;
  });
});

const totalAmount = computed(() => {
  return filteredOrders.value.reduce((sum, order) => {
    return sum + parseFloat(order.totalAmount);
  }, 0);
});

function formatTime(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nb-NO', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Tid ikke tilgjengelig';
  }
}

function formatPrice(price: string | number): string {
  try {
    const amount = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting price:', error);
    return 'NOK -';
  }
}

function refreshData() {
  ordersStore.fetchOrders(true);
}

onMounted(() => {
  ordersStore.fetchOrders();
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
