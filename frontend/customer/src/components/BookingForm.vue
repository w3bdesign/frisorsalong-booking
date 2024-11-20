<template>
  <div class="max-w-lg mx-auto p-4">
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">Quick Booking</h2>

    <div v-if="!selectedService" class="text-center py-8">
      <p class="text-gray-600">Please select a service first</p>
      <button
        @click="$router.push('/')"
        class="mt-4 px-6 py-2 text-primary-600 hover:text-primary-700"
      >
        Browse Services
      </button>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <h3 class="text-lg font-medium text-gray-800 mb-2">Selected Service</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-medium text-gray-800">{{ selectedService.name }}</p>
              <p class="text-sm text-gray-600">Duration: {{ selectedService.duration }} minutes</p>
            </div>
            <p class="font-medium text-primary-600">
              {{
                new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(
                  selectedService.price,
                )
              }}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"> Select Time </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="slot in availableTimeSlots"
            :key="slot.time"
            type="button"
            @click="selectedTimeSlot = slot"
            class="p-3 text-center border rounded-lg transition-colors"
            :class="
              selectedTimeSlot?.time === slot.time
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-gray-300 hover:border-primary-500'
            "
          >
            <div class="font-medium">{{ slot.time }}</div>
            <div class="text-sm opacity-75">{{ slot.waitTime }}</div>
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"> Phone Number </label>
        <input
          type="tel"
          v-model="phoneNumber"
          required
          placeholder="+46 XXX XXX XXX"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div class="pt-4">
        <button
          type="submit"
          :disabled="isLoading || !selectedTimeSlot"
          class="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400"
        >
          <span v-if="isLoading">Processing...</span>
          <span v-else>
            Pay
            {{
              new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(
                selectedService.price,
              )
            }}
          </span>
        </button>
      </div>

      <div v-if="error" class="text-red-600 text-sm text-center">
        {{ error }}
      </div>
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

// Mock available time slots - this should come from the backend
const availableTimeSlots = [
  { time: 'Now', waitTime: '5 min wait' },
  { time: '10:00', waitTime: '15 min wait' },
  { time: '10:30', waitTime: '30 min wait' },
  { time: '11:00', waitTime: '45 min wait' },
  { time: '11:30', waitTime: '1h wait' },
  { time: '12:00', waitTime: '1.5h wait' },
]

const handleSubmit = async () => {
  if (!selectedService || !selectedTimeSlot.value) return

  try {
    await bookingStore.createBooking({
      serviceId: selectedService.id,
      time: selectedTimeSlot.value.time,
      phoneNumber: phoneNumber.value,
    })

    // Navigate to payment page after successful booking creation
    router.push('/payment')
  } catch (err) {
    // Error handling is managed by the store
  }
}
</script>
