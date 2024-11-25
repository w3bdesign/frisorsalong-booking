<template>
  <div class="p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-semibold text-gray-900">Bestillinger</h1>

      <!-- Debug Info (temporary) -->
      <div class="mb-4 p-4 bg-gray-100 rounded">
        <p>Totalt antall bestillinger: {{ bookingStore.bookings.length }}</p>
        <p>Aktive bestillinger: {{ activeBookings.length }}</p>
      </div>

      <!-- Bookings Table -->
      <div class="mt-8 flex flex-col">
        <div class="-my-2 overflow-x-auto">
          <div class="inline-block min-w-full py-2 align-middle">
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Dato og tid
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Kunde
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Tjeneste
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Ansatt
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Handlinger</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-if="bookingStore.isLoading">
                    <td
                      colspan="6"
                      class="px-3 py-4 text-sm text-gray-500 text-center"
                    >
                      Laster bestillinger...
                    </td>
                  </tr>
                  <tr v-else-if="bookingStore.error">
                    <td
                      colspan="6"
                      class="px-3 py-4 text-sm text-red-500 text-center"
                    >
                      {{ bookingStore.error }}
                    </td>
                  </tr>
                  <tr v-else-if="!bookingStore.bookings.length">
                    <td
                      colspan="6"
                      class="px-3 py-4 text-sm text-gray-500 text-center"
                    >
                      Ingen bestillinger funnet
                    </td>
                  </tr>
                  <tr
                    v-for="booking in activeBookings"
                    :key="booking.id"
                    class="hover:bg-gray-50"
                  >
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ formatDateTime(booking.startTime) }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ booking.customerName }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ booking.serviceName }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {{ booking.employeeName }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <span :class="getStatusClass(booking.status)">
                        {{ getStatusText(booking.status) }}
                      </span>
                    </td>
                    <td
                      class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                    >
                      <button
                        v-if="booking.status === 'pending'"
                        @click="handleConfirm(booking.id)"
                        class="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Bekreft
                      </button>
                      <button
                        v-if="booking.status === 'confirmed'"
                        @click="handleComplete(booking.id)"
                        class="text-green-600 hover:text-green-900 mr-4"
                      >
                        Fullfør
                      </button>
                      <button
                        @click="openEditModal(booking)"
                        class="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Rediger
                      </button>
                      <button
                        @click="handleCancel(booking.id)"
                        class="text-red-600 hover:text-red-900"
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
    </div>

    <!-- Edit Modal -->
    <BookingEditModal
      :is-open="isEditModalOpen"
      :booking="selectedBooking"
      @close="closeEditModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useBookingStore } from "../stores/bookings";
import { useOrdersStore } from "../stores/orders";
import BookingEditModal from "../components/BookingEditModal.vue";
import type { BookingView } from "../types";

const bookingStore = useBookingStore();
const ordersStore = useOrdersStore();
const isEditModalOpen = ref(false);
const selectedBooking = ref<BookingView | null>(null);

// Filter to show active bookings (pending or confirmed)
const activeBookings = computed(() => {
  return bookingStore.bookings.filter(
    (booking) => booking.status === "pending" || booking.status === "confirmed"
  );
});

const formatDateTime = (dateTime: string) => {
  try {
    const date = new Date(dateTime);
    return new Intl.DateTimeFormat("nb-NO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Dato ikke tilgjengelig";
  }
};

const getStatusClass = (status: string) => {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
  };
  return `inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
    classes[status as keyof typeof classes] || "bg-gray-100 text-gray-800"
  }`;
};

const getStatusText = (status: string) => {
  const statusMap = {
    pending: "Venter",
    confirmed: "Bekreftet",
    cancelled: "Kansellert",
    completed: "Fullført",
  };
  return statusMap[status as keyof typeof statusMap] || "Ukjent";
};

const openEditModal = (booking: BookingView) => {
  selectedBooking.value = booking;
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  selectedBooking.value = null;
  isEditModalOpen.value = false;
};

const handleSave = async (updatedBooking: Partial<BookingView>) => {
  if (!selectedBooking.value?.id) return;

  const success = await bookingStore.updateBooking(
    selectedBooking.value.id,
    updatedBooking
  );
  if (success) {
    closeEditModal();
  }
};

const handleConfirm = async (id: string | number) => {
  const success = await bookingStore.updateBooking(id, { status: "confirmed" });
  if (success) {
    console.log("Booking confirmed");
  }
};

const handleComplete = async (id: string | number) => {
  if (
    !confirm(
      "Er du sikker på at du vil markere denne bestillingen som fullført?"
    )
  ) {
    return;
  }

  console.log("Starting completion for booking:", id);
  const success = await bookingStore.completeBooking(id);
  if (success) {
    console.log("Booking completed successfully");
    // Force refresh both bookings and orders
    console.log("Refreshing bookings and orders...");
    await Promise.all([
      bookingStore.fetchDashboardStats(true),
      ordersStore.fetchOrders(true),
    ]);
    console.log("Refresh complete");
  } else {
    console.error("Failed to complete booking");
  }
};

const handleCancel = async (id: string | number) => {
  if (!confirm("Er du sikker på at du vil kansellere denne bestillingen?")) {
    return;
  }

  const success = await bookingStore.cancelBooking(id);
  if (success) {
    console.log("Bestilling kansellert");
  }
};

onMounted(() => {
  bookingStore.fetchDashboardStats();
});
</script>
