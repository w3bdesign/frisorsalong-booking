<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <Button
              @click="closeModal"
              variant="secondary"
              size="sm"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
            >
              <span class="sr-only">Lukk</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg font-semibold leading-6 text-gray-900">
                Bestillingsdetaljer
              </h3>
              <div class="mt-4 space-y-4">
                <!-- Customer -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Kunde</label>
                  <p class="mt-1 text-sm text-gray-900">{{ booking?.customerName }}</p>
                </div>

                <!-- Employee -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Ansatt</label>
                  <p class="mt-1 text-sm text-gray-900">{{ booking?.employeeName }}</p>
                </div>

                <!-- Service -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tjeneste</label>
                  <p class="mt-1 text-sm text-gray-900">{{ booking?.serviceName }}</p>
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Status</label>
                  <p class="mt-1">
                    <span
                      :class="[
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        getStatusColor(booking?.status)
                      ]"
                    >
                      {{ getStatusText(booking?.status) }}
                    </span>
                  </p>
                </div>

                <!-- Date and Time -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Dato og tid</label>
                  <p class="mt-1 text-sm text-gray-900">{{ formatDateTime(booking?.startTime) }}</p>
                </div>

                <!-- Notes -->
                <div v-if="booking?.notes">
                  <label class="block text-sm font-medium text-gray-700">Notater</label>
                  <p class="mt-1 text-sm text-gray-900">{{ booking?.notes }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 sm:mt-4 sm:flex sm:justify-end">
            <Button
              @click="closeModal"
              variant="secondary"
            >
              Lukk
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BookingView } from '../types';
import Button from './base/Button.vue';

defineProps<{
  isOpen: boolean;
  booking: BookingView | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const getStatusColor = (status: string | undefined): string => {
  switch (status?.toUpperCase()) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "COMPLETED":
      return "bg-blue-100 text-blue-800";
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
    case "COMPLETED":
      return "Fullført";
    default:
      return "Ukjent";
  }
};

const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '';
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
};

const closeModal = () => {
  emit('close');
};
</script>
