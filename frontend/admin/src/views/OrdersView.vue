<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Fullførte bestillinger</h1>
    
    <div v-if="loading" class="text-center py-4">
      Laster bestillinger...
    </div>
    
    <div v-else-if="error" class="text-red-500 py-4">
      {{ error }}
    </div>
    
    <div v-else-if="orders.length === 0" class="text-center py-4">
      Ingen fullførte bestillinger funnet.
    </div>
    
    <div v-else class="grid gap-4">
      <div v-for="order in orders" :key="order.id" 
           class="bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <h3 class="font-semibold text-lg">
              {{ order.booking.customer.firstName }} {{ order.booking.customer.lastName }}
            </h3>
            <p class="text-gray-700">{{ order.booking.service.name }}</p>
            <p class="text-gray-600">Varighet: {{ order.booking.service.duration }} minutter</p>
          </div>
          <div class="text-right">
            <p class="font-bold">{{ formatPrice(order.totalAmount) }}</p>
            <p class="text-gray-600">{{ formatDate(order.completedAt) }}</p>
            <p class="text-gray-600">Bestilling: {{ formatBookingDate(order.booking.startTime) }}</p>
          </div>
        </div>
        <div class="mt-2 text-gray-600" v-if="order.notes">
          <p>Notater: {{ order.notes }}</p>
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
    return 'Dato ikke tilgjengelig'
  }

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Dato ikke tilgjengelig'
  }
}

function formatBookingDate(dateString: string): string {
  if (!dateString || !isValidDate(dateString)) {
    return 'Dato ikke tilgjengelig'
  }

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('nb-NO', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Dato ikke tilgjengelig'
  }
}

function formatPrice(price: string): string {
  try {
    const amount = parseFloat(price)
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  } catch (error) {
    console.error('Error formatting price:', error)
    return 'NOK -'
  }
}

onMounted(() => {
  ordersStore.fetchOrders()
})
</script>
