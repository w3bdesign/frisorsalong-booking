<template>
  <div class="p-6" data-test="dashboard-view">
    <div class="max-w-7xl mx-auto">
      <!-- Navigation -->
      <div class="mb-6 flex space-x-4">
        <RouterLink
          to="/bookings"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Se alle bestillinger
        </RouterLink>
        <RouterLink
          to="/orders"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Se fullførte bestillinger
        </RouterLink>
      </div>

      <!-- Statistics Cards -->
      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
        data-test="statistics-cards"
      >
        <div class="bg-white rounded-lg shadow p-6" data-test="total-bookings">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Totale bestillinger</h3>
          <p class="text-3xl font-bold text-indigo-600">
            {{ bookingStore.totalBookings }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow p-6" data-test="today-bookings">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Dagens bestillinger
          </h3>
          <p class="text-3xl font-bold text-indigo-600">
            {{ bookingStore.todayBookings }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow p-6" data-test="upcoming-bookings">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Kommende bestillinger
          </h3>
          <p class="text-3xl font-bold text-indigo-600">
            {{ bookingStore.upcomingBookings }}
          </p>
        </div>
      </div>

      <!-- Bookings Table -->
      <div class="bg-white rounded-lg shadow" data-test="bookings-table">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold text-gray-900">Nylige bestillinger</h2>
            <button
              @click="bookingStore.fetchDashboardStats"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              data-test="refresh-button"
            >
              Oppdater
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <div
            v-if="bookingStore.isLoading"
            class="p-6 text-center text-gray-500"
            data-test="loading-state"
          >
            Laster bestillinger...
          </div>
          <div
            v-else-if="bookingStore.error"
            class="p-6 text-center text-red-500"
            data-test="error-state"
          >
            {{ bookingStore.error }}
          </div>
          <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Kunde
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ansatt
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tjeneste
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Dato og tid
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="booking in bookingStore.bookings"
                :key="booking.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ booking.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ booking.customerName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ booking.employeeName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ booking.serviceName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDateTime(booking.startTime) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      getStatusColor(booking.status),
                    ]"
                  >
                    {{ getStatusText(booking.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    class="text-indigo-600 hover:text-indigo-900 mr-4"
                    @click="$emit('view-booking', booking.id)"
                    data-test="view-button"
                  >
                    Se
                  </button>
                  <button
                    class="text-red-600 hover:text-red-900"
                    @click="$emit('cancel-booking', booking.id)"
                    data-test="cancel-button"
                  >
                    Kanseller
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useBookingStore } from "../stores/bookings";
import { RouterLink } from 'vue-router';

const bookingStore = useBookingStore();

const getStatusColor = (status: "CONFIRMED" | "PENDING" | "CANCELLED"): string => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
  }
};

const getStatusText = (status: "CONFIRMED" | "PENDING" | "CANCELLED"): string => {
  switch (status) {
    case "CONFIRMED":
      return "Bekreftet";
    case "PENDING":
      return "Venter";
    case "CANCELLED":
      return "Kansellert";
  }
};

function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Dato ikke tilgjengelig';
  }
}

defineEmits<{
  (e: "view-booking", id: number): void;
  (e: "cancel-booking", id: number): void;
}>();

onMounted(() => {
  bookingStore.fetchDashboardStats();
});
</script>
