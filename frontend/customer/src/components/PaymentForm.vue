<template>
  <div class="max-w-lg mx-auto">
    <h2 class="heading-1 text-gradient text-center py-6">Betaling</h2>

    <div v-if="!currentBooking" class="card text-center py-12">
      <p class="text-gray-600 mb-6">Ingen aktiv bestilling funnet</p>
      <button @click="$router.push('/')" class="btn-secondary">Tilbake til tjenester</button>
    </div>

    <div v-else>
      <!-- Payment Terminal Screen -->
      <div v-if="!isPaid" class="card bg-gradient-to-br from-white to-gray-50 space-y-8">
        <div class="text-center">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>

          <div class="text-5xl font-bold text-gradient mb-4">
            {{
              new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(
                selectedService?.price || 0,
              )
            }}
          </div>

          <p class="text-gray-600">Klar for betaling</p>
        </div>

        <div class="pt-4">
          <button
            @click="handlePayment"
            :disabled="isLoading"
            class="w-full btn-primary text-lg py-6"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg
                class="animate-spin h-5 w-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Behandler...
            </span>
            <span v-else>Trykk for å betale</span>
          </button>
        </div>

        <p class="text-center text-sm text-gray-500">
          Trykk på knappen for å simulere kortbetaling
        </p>
      </div>

      <!-- Success Screen -->
      <div v-else class="card bg-gradient-to-br from-white to-gray-50 space-y-8 text-center">
        <div class="text-green-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-20 w-20 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Betaling vellykket!</h3>
          <p class="text-gray-600">Din time er bekreftet for:</p>
          <p class="text-xl font-medium text-primary-600 mt-2">
            {{ currentBooking.time }}
          </p>
        </div>

        <div class="pt-4">
          <button @click="$router.push('/')" class="btn-secondary">Tilbake til forsiden</button>
        </div>
      </div>

      <div
        v-if="error"
        class="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-center"
      >
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'
import { useServicesStore } from '@/stores/services'

const router = useRouter()
const bookingStore = useBookingStore()
const servicesStore = useServicesStore()

const { currentBooking, isLoading, error } = bookingStore
const { selectedService } = servicesStore

const isPaid = ref(false)

// Simulate payment processing
const handlePayment = async () => {
  if (!currentBooking) return

  try {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    isPaid.value = true
  } catch (err) {
    console.error('Payment failed:', err)
  }
}
</script>
