<template>
  <div class="p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-semibold text-gray-900">Bestillinger</h1>

      <!-- Bookings Table -->
      <div class="mt-8 flex flex-col">
        <div class="-my-2 overflow-x-auto">
          <div class="inline-block min-w-full py-2 align-middle">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
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
                    v-for="booking in bookingStore.bookings"
                    :key="booking.id"
                    class="hover:bg-gray-50"
                  >
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ formatDateTime(booking.startTime) }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ booking.customerName }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ booking.serviceName }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ booking.employeeName }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <span :class="getStatusClass(booking.status)">
                        {{ getStatusText(booking.status) }}
                      </span>
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        @click="editBooking(booking)"
                        class="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Rediger
                      </button>
                      <button
                        @click="deleteBooking(booking.id)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Slett
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
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useBookingStore } from "../stores/bookings";
import axios from "axios";

const bookingStore = useBookingStore();

const formatDateTime = (dateTime: string) => {
  try {
    const date = new Date(dateTime);
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
};

const getStatusClass = (status: string) => {
  const classes = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return `inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
    classes[status as keyof typeof classes]
  }`;
};

const getStatusText = (status: string) => {
  const statusMap = {
    PENDING: "Venter",
    CONFIRMED: "Bekreftet",
    CANCELLED: "Kansellert",
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const editBooking = (booking: any) => {
  // TODO: Implement edit functionality
  console.log("Rediger bestilling:", booking);
};

const deleteBooking = async (id: number) => {
  if (!confirm("Er du sikker på at du vil slette denne bestillingen?")) return;

  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/bookings/${id}`);
    await bookingStore.fetchDashboardStats();
  } catch (err) {
    console.error("Feil ved sletting av bestilling:", err);
  }
};

onMounted(() => {
  bookingStore.fetchDashboardStats();
});
</script>
