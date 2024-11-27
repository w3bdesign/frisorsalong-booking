<template>
  <div class="max-w-lg mx-auto">
    <h2 class="heading-1 text-gradient text-center py-6">Reserver time</h2>

    <div v-if="!selectedService" class="card text-center py-12">
      <p class="text-gray-600 mb-6">Vennligst velg en tjeneste først</p>
      <button @click="$router.push('/')" class="btn-secondary">Se tjenester</button>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Service Summary -->
      <div class="card bg-gradient-to-br from-white to-gray-50">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Valgt tjeneste</h3>
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xl font-bold text-gray-900">{{ selectedService.name }}</p>
            <p class="text-gray-600 mt-1">Varighet: {{ selectedService.duration }} minutter</p>
          </div>
          <p class="text-xl font-bold text-gradient">
            {{
              new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(
                parseFloat(selectedService.price),
              )
            }}
          </p>
        </div>
      </div>

      <!-- Queue Status -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Ventetid</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xl font-bold text-gray-900">{{ calculateWaitTime }} minutter</p>
              <p class="text-gray-600 mt-1">{{ displayStore.waitingCount ?? 0 }} personer venter</p>
            </div>
            <div class="text-sm text-gray-500">
              {{ displayStore.activeEmployees.length }} frisører på jobb
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="card space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-800 mb-4">Ditt navn</h3>
          <input
            type="text"
            v-model="firstName"
            required
            placeholder="Fornavn"
            class="input text-lg"
          />
        </div>

        <div>
          <h3 class="text-lg font-medium text-gray-800 mb-4">Ditt telefonnummer (valgfritt)</h3>
          <input
            type="tel"
            v-model="phoneNumber"
            placeholder="+47 XXX XX XXX"
            class="input text-lg"
            :class="{ 'ring-2 ring-red-500 border-red-500': error }"
          />
          <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
        </div>
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="isLoading || !firstName" class="btn-primary w-full text-lg">
        <span v-if="isLoading">Behandler...</span>
        <span v-else>Fortsett til betaling</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useServicesStore } from '../stores/services'
import { useBookingStore } from '../stores/booking'
import { useDisplayStore } from '../stores/display'

const router = useRouter()
const servicesStore = useServicesStore()
const bookingStore = useBookingStore()
const displayStore = useDisplayStore()

const { selectedService } = servicesStore
const { isLoading, error } = bookingStore

// Form data
const firstName = ref('')
const phoneNumber = ref('')

// Calculate wait time based on queue and selected service
const calculateWaitTime = computed(() => {
  if (!selectedService || !displayStore.waitingSlots.length) return 0

  // Base wait time from current queue
  const queueWaitTime = displayStore.waitingSlots.reduce((total, slot) => {
    return total + (slot.estimatedTime || 0)
  }, 0)

  // Add selected service duration
  return queueWaitTime + selectedService.duration
})

const handleSubmit = async () => {
  if (!selectedService || !firstName.value) return

  // Set pending booking and navigate to payment
  bookingStore.setPendingBooking({
    serviceId: selectedService.id,
    firstName: firstName.value,
    phoneNumber: phoneNumber.value || undefined,
    startTime: new Date().toISOString(),
  })

  // Navigate to payment page
  router.push('/payment')
}
</script>
