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
            <h3 class="font-semibold">{{ order.customerName }}</h3>
            <p class="text-gray-600">{{ order.service }}</p>
            <p class="text-sm text-gray-500">Employee: {{ order.employeeName }}</p>
          </div>
          <div class="text-right">
            <p class="font-bold">${{ order.price }}</p>
            <p class="text-sm text-gray-500">{{ formatDate(order.date) }}</p>
          </div>
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  ordersStore.fetchOrders()
})
</script>
