<template>
  <div class="max-w-lg mx-auto p-4">
    <div class="bg-gray-100 rounded-lg p-8 shadow-lg" style="min-height: 400px">
      <!-- Payment Terminal Screen -->
      <div v-if="!isPaid" class="text-center space-y-6">
        <h2 class="text-2xl font-semibold text-gray-800">Payment Terminal</h2>

        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="text-4xl font-bold text-primary-600 mb-2">
            {{
              new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(
                selectedService?.price || 0,
              )
            }}
          </div>
          <p class="text-gray-600">Ready to pay</p>
        </div>

        <div class="pt-8">
          <button
            @click="handlePayment"
            :disabled="isLoading"
            class="w-full px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 text-lg font-medium"
          >
            <span v-if="isLoading">Processing...</span>
            <span v-else>Tap to Pay</span>
          </button>
        </div>

        <p class="text-sm text-gray-500 mt-4">Press the button to simulate card payment</p>
      </div>

      <!-- Success Screen -->
      <div v-else class="text-center space-y-6">
        <div class="text-green-600 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 class="text-2xl font-semibold text-gray-800">Payment Successful!</h2>

        <div class="text-gray-600">
          <p>Your appointment is confirmed for:</p>
          <p class="font-medium text-lg">{{ currentBooking?.time }}</p>
        </div>

        <div class="pt-8">
          <button
            @click="$router.push('/')"
            class="px-6 py-2 text-primary-600 hover:text-primary-700"
          >
            Return to Home
          </button>
        </div>
      </div>

      <div v-if="error" class="mt-4 text-red-600 text-sm text-center">
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
