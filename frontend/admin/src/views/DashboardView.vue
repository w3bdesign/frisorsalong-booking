<template>
  <div class="p-6" data-test="dashboard-view">
    <div class="max-w-7xl mx-auto">
      <!-- Navigation -->
      <div class="mb-6 flex space-x-4">
        <Button
          variant="primary"
          @click="navigateToBookings"
        >
          Se alle bestillinger
        </Button>
        <Button
          variant="primary"
          @click="navigateToOrders"
        >
          Se fullførte bestillinger
        </Button>
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
            <Button
              @click="handleRefresh"
              data-test="refresh-button"
              variant="primary"
              :loading="bookingStore.isLoading"
            >
              Oppdater
            </Button>
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
          <div
            v-else-if="!bookingStore.bookings.length"
            class="p-12 text-center"
            data-test="empty-state"
          >
            <h3 class="text-lg font-medium text-gray-900 mb-1">Ingen bestillinger</h3>
            <p class="text-sm text-gray-500">Det er ingen aktive bestillinger for øyeblikket.</p>
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
                      getStatusColor(booking.status)
                    ]"
                  >
                    {{ getStatusText(booking.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button
                    variant="secondary"
                    size="sm"
                    @click="handleView(booking)"
                    data-test="view-button"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Vis
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Booking Details Modal -->
    <BookingDetailsModal
      :is-open="isModalOpen"
      :booking="selectedBooking"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useBookingStore } from "../stores/bookings";
import BookingDetailsModal from "../components/BookingDetailsModal.vue";
import Button from "../components/base/Button.vue";

const router = useRouter();
const bookingStore = useBookingStore();
const isModalOpen = ref(false);
const selectedBooking = ref(null);

const navigateToBookings = () => {
  router.push('/bookings');
};

const navigateToOrders = () => {
  router.push('/orders');
};

const getStatusColor = (status: string | undefined): string => {
  switch (status?.toUpperCase()) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string | undefined): string => {
  switch (status?.toUpperCase()) {
    case "CONFIRMED":
      return "Bekreftet";
    case "PENDING":
      return "Venter";
    case "CANCELLED":
      return "Kansellert";
    default:
      return "Ukjent";
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

const handleRefresh = () => {
  bookingStore.fetchDashboardStats(true);
};

const handleView = (booking: any) => {
  selectedBooking.value = booking;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedBooking.value = null;
};

onMounted(() => {
  bookingStore.fetchDashboardStats();
});
</script>
