import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import type { Order } from '../types'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOrders() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get<Order[]>(`${import.meta.env.VITE_API_URL}/orders`)
      orders.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching orders:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    loading,
    error,
    fetchOrders
  }
})
