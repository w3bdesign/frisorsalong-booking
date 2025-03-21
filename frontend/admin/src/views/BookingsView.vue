<template>
  <div class="p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Bestillinger</h1>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card
          title="Totalt antall bestillinger"
          :value="bookingStore.bookings.length"
          color="indigo"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </template>
        </Card>

        <Card
          title="Aktive bestillinger"
          :value="activeBookings.length"
          color="green"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </Card>
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
                      <div class="flex justify-end space-x-2">
                        <Button
                          v-if="booking.status.toUpperCase() === 'PENDING'"
                          @click="handleConfirm(booking.id)"
                          variant="primary"
                          size="sm"
                        >
                          Bekreft
                        </Button>
                        <Button
                          v-if="booking.status.toUpperCase() === 'CONFIRMED'"
                          @click="handleComplete(booking.id)"
                          variant="primary"
                          size="sm"
                        >
                          Fullfør
                        </Button>
                        <Button
                          @click="openEditModal(booking)"
                          variant="secondary"
                          size="sm"
                        >
                          Rediger
                        </Button>
                        <Button
                          @click="handleCancel(booking.id)"
                          variant="danger"
                          size="sm"
                        >
                          Kanseller
                        </Button>
                      </div>
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
import Button from "../components/base/Button.vue";
import Card from "../components/base/Card.vue";
import type { BookingView } from "../types";

const bookingStore = useBookingStore();
const ordersStore = useOrdersStore();
const isEditModalOpen = ref(false);
const selectedBooking = ref<BookingView | null>(null);

// Filter to show active bookings (pending or confirmed)
const activeBookings = computed(() => {
  return bookingStore.bookings.filter(
    (booking) => 
      booking.status.toUpperCase() === "PENDING" || 
      booking.status.toUpperCase() === "CONFIRMED"
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
  const upperStatus = status.toUpperCase();
  const classes = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    COMPLETED: "bg-blue-100 text-blue-800",
  };
  return `inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
    classes[upperStatus as keyof typeof classes] || "bg-gray-100 text-gray-800"
  }`;
};

const getStatusText = (status: string) => {
  const upperStatus = status.toUpperCase();
  const statusMap = {
    PENDING: "Venter",
    CONFIRMED: "Bekreftet",
    CANCELLED: "Kansellert",
    COMPLETED: "Fullført",
  };
  return statusMap[upperStatus as keyof typeof statusMap] || "Ukjent";
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
  const success = await bookingStore.updateBooking(id, { status: "CONFIRMED" });
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
      bookingStore.fetchUpcomingBookings(true),
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
  bookingStore.fetchUpcomingBookings();
});
</script>
