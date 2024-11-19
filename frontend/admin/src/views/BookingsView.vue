<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="py-6">
      <h1 class="text-2xl font-semibold text-gray-900">Bookings</h1>
      
      <!-- Bookings Table -->
      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Time</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Service</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Employee</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-if="isLoading">
                    <td colspan="7" class="px-3 py-4 text-sm text-gray-500 text-center">
                      Loading bookings...
                    </td>
                  </tr>
                  <tr v-else-if="error">
                    <td colspan="7" class="px-3 py-4 text-sm text-red-500 text-center">
                      {{ error }}
                    </td>
                  </tr>
                  <tr v-else-if="!bookings.length">
                    <td colspan="7" class="px-3 py-4 text-sm text-gray-500 text-center">
                      No bookings found
                    </td>
                  </tr>
                  <tr v-for="booking in bookings" :key="booking.id" class="hover:bg-gray-50">
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ formatDate(booking.date) }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ formatTime(booking.time) }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ booking.customer.name }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ booking.service.name }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ booking.employee.name }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <span :class="getStatusClass(booking.status)">
                        {{ booking.status }}
                      </span>
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        @click="editBooking(booking)"
                        class="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        @click="deleteBooking(booking.id)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
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
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Customer {
  id: number
  name: string
  email: string
}

interface Service {
  id: number
  name: string
  duration: number
  price: number
}

interface Employee {
  id: number
  name: string
  email: string
}

interface Booking {
  id: number
  date: string
  time: string
  customer: Customer
  service: Service
  employee: Employee
  status: 'pending' | 'confirmed' | 'cancelled'
}

const bookings = ref<Booking[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const fetchBookings = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await axios.get<Booking[]>(`${import.meta.env.VITE_API_URL}/bookings`)
    bookings.value = response.data
  } catch (err) {
    error.value = 'Failed to load bookings'
    console.error('Error fetching bookings:', err)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatTime = (time: string) => {
  return time
}

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return `inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${classes[status as keyof typeof classes]}`
}

const editBooking = (booking: Booking) => {
  // TODO: Implement edit functionality
  console.log('Edit booking:', booking)
}

const deleteBooking = async (id: number) => {
  if (!confirm('Are you sure you want to delete this booking?')) return
  
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/bookings/${id}`)
    bookings.value = bookings.value.filter(booking => booking.id !== id)
  } catch (err) {
    error.value = 'Failed to delete booking'
    console.error('Error deleting booking:', err)
  }
}

onMounted(() => {
  fetchBookings()
})
</script>
