<template>
  <div class="max-w-lg mx-auto">
    <h2 class="heading-1 text-gradient text-center py-6">Reserver time</h2>

    <div v-if="!selectedService" class="card text-center py-12">
      <p class="text-gray-600 mb-6">Please select a service first</p>
      <button @click="$router.push('/')" class="btn-secondary">Browse Services</button>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Service Summary -->
      <div class="card bg-gradient-to-br from-white to-gray-50">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Selected Service</h3>
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xl font-bold text-gray-900">{{ selectedService.name }}</p>
            <p class="text-gray-600 mt-1">Duration: {{ selectedService.duration }} minutes</p>
          </div>
          <p class="text-xl font-bold text-gradient">
            {{
              new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(
                selectedService.price,
              )
            }}
          </p>
        </div>
      </div>

      <!-- Time Slots -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Choose Your Time</h3>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="relative p-4 text-left border rounded-xl transition-all duration-200"
            :class="
              selectedTimeSlot?.time === 'now'
                ? 'border-primary-500 bg-primary-50 text-primary-900'
                : 'border-gray-200 hover:border-primary-300'
            "
            @click="selectedTimeSlot = { time: 'now', waitTime: '5-10 min' }"
          >
            <div class="font-bold text-lg mb-1">Right Now</div>
            <div class="text-sm opacity-75">5-10 min wait</div>
            <div v-if="selectedTimeSlot?.time === 'now'" class="absolute top-2 right-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-primary-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </button>

          <button
            type="button"
            class="relative p-4 text-left border rounded-xl transition-all duration-200"
            :class="
              selectedTimeSlot?.time === 'next'
                ? 'border-primary-500 bg-primary-50 text-primary-900'
                : 'border-gray-200 hover:border-primary-300'
            "
            @click="selectedTimeSlot = { time: 'next', waitTime: '15-20 min' }"
          >
            <div class="font-bold text-lg mb-1">Next Available</div>
            <div class="text-sm opacity-75">15-20 min wait</div>
            <div v-if="selectedTimeSlot?.time === 'next'" class="absolute top-2 right-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-primary-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Phone Number -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Your Phone Number</h3>
        <input
          type="tel"
          v-model="phoneNumber"
          required
          placeholder="+46 XXX XXX XXX"
          class="input text-lg"
          :class="{ 'ring-2 ring-red-500 border-red-500': error }"
        />
        <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isLoading || !selectedTimeSlot"
        class="btn-primary w-full text-lg"
      >
        <span v-if="isLoading">Processing...</span>
        <span v-else> Continue to Payment </span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useServicesStore } from '@/stores/services'
import { useBookingStore } from '@/stores/booking'

const router = useRouter()
const servicesStore = useServicesStore()
const bookingStore = useBookingStore()

const { selectedService } = servicesStore
const { isLoading, error } = bookingStore

// Form data
const phoneNumber = ref('')
const selectedTimeSlot = ref<{ time: string; waitTime: string } | null>(null)

const handleSubmit = async () => {
  if (!selectedService || !selectedTimeSlot.value) return

  try {
    await bookingStore.createBooking({
      serviceId: selectedService.id,
      time: selectedTimeSlot.value.time,
      phoneNumber: phoneNumber.value,
    })

    router.push('/payment')
  } catch (err) {
    // Error handling is managed by the store
  }
}
</script>
