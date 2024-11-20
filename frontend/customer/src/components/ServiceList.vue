<template>
  <div class="max-w-4xl mx-auto p-4">
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">Our Services</h2>

    <div v-if="isLoading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="animate-pulse">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
      {{ error }}
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2">
      <div
        v-for="service in services"
        :key="service.id"
        class="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-transform hover:scale-105"
        :class="{ 'ring-2 ring-primary-500': selectedService?.id === service.id }"
        @click="selectService(service)"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold text-gray-800">{{ service.name }}</h3>
          <span class="text-lg font-medium text-primary-600">
            {{
              new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(
                service.price,
              )
            }}
          </span>
        </div>
        <p class="text-gray-600 mb-3">{{ service.description }}</p>
        <div class="text-sm text-gray-500">Duration: {{ service.duration }} minutes</div>
      </div>
    </div>

    <div
      v-if="selectedService"
      class="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4"
    >
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h4 class="font-medium text-gray-800">Selected: {{ selectedService.name }}</h4>
          <p class="text-sm text-gray-600">
            {{
              new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(
                selectedService.price,
              )
            }}
            · {{ selectedService.duration }} minutes
          </p>
        </div>
        <div class="flex gap-3">
          <button @click="clearSelection" class="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button
            @click="$emit('proceed')"
            class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Continue Booking
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useServicesStore } from '@/stores/services'

const emit = defineEmits<{
  (e: 'proceed'): void
}>()

const servicesStore = useServicesStore()
const {
  services,
  isLoading,
  error,
  selectedService,
  fetchServices,
  selectService,
  clearSelection,
} = servicesStore

onMounted(() => {
  fetchServices()
})
</script>
