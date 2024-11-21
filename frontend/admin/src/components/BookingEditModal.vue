<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              @click="closeModal"
              class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span class="sr-only">Lukk</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg font-semibold leading-6 text-gray-900">
                Rediger bestilling
              </h3>
              <div class="mt-4 space-y-4">
                <!-- Status -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    v-model="editedBooking.status"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="PENDING">Venter</option>
                    <option value="CONFIRMED">Bekreftet</option>
                    <option value="CANCELLED">Kansellert</option>
                  </select>
                </div>

                <!-- Date and Time -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Dato og tid</label>
                  <input
                    type="datetime-local"
                    :value="formatDateForInput(editedBooking.startTime)"
                    @input="handleDateChange"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Notater</label>
                  <textarea
                    v-model="editedBooking.notes"
                    rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="handleSave"
              class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
            >
              Lagre endringer
            </button>
            <button
              type="button"
              @click="closeModal"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Avbryt
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  booking: any | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', booking: any): void;
}>();

const editedBooking = ref<any>({});

watch(() => props.booking, (newBooking) => {
  if (newBooking) {
    editedBooking.value = { 
      ...newBooking,
      status: newBooking.status.toUpperCase()
    };
  }
}, { immediate: true });

const formatDateForInput = (dateString: string | undefined) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Format: YYYY-MM-DDThh:mm
    return date.toISOString().slice(0, 16);
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

const handleDateChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  editedBooking.value.startTime = input.value;
};

const closeModal = () => {
  emit('close');
};

const handleSave = () => {
  emit('save', editedBooking.value);
};
</script>
