<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Completed Orders</h1>
    
    <div v-if="loading" class="text-center py-4">
      Loading orders...
    </div>
    
    <div v-else-if="error" class="text-red-500 py-4">
      {{ error }}
    </div>
    
    <div v-else-if="orders.length === 0" class="text-center py-4">
      No completed orders found.
    </div>
    
    <div v-else class="grid gap-4">
      <div v-for="order in orders" :key="order.id" 
           class="bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-semibold">
              {{ order.booking.customer.firstName }} {{ order.booking.customer.lastName }}
            </h3>
            <p class="text-gray-600">{{ order.booking.service.name }}</p>
            <p class="text-sm text-gray-500">
              Service Duration: {{ order.booking.service.duration }} minutes
            </p>
          </div>
          <div class="text-right">
            <p class="font-bold">${{ order.totalAmount }}</p>
            <p class="text-sm text-gray-500">{{ formatDate(order.completedAt) }}</p>
            <p class="text-sm text-gray-500">Booking: {{ formatDate(order.booking.startTime) }}</p>
          </div>
        </div>
        <div class="mt-2 text-sm text-gray-600">
          <p v-if="order.notes">Notes: {{ order.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOrdersStore } from '../stores/orders'
import { storeToRefs } from 'pinia'

const ordersStore = useOrdersStore()
const { orders, loading, error } = storeToRefs(ordersStore)

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

function formatDate(dateString: string): string {
  if (!dateString || !isValidDate(dateString)) {
    return 'Date not available'
  }

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Date not available'
  }
}

onMounted(() => {
  ordersStore.fetchOrders()
})
</script>
