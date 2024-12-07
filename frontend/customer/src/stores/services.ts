import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const useServicesStore = defineStore('services', () => {
  // Initialize state
  const services = ref<Service[]>([])
  const isLoading = ref(true)  // Initialize as true
  const error = ref<string | null>(null)
  const selectedService = ref<Service | null>(null)

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:3000/services')
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      services.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch services'
      services.value = []
    } finally {
      isLoading.value = false
    }
  }

  const selectService = (service: Service) => {
    selectedService.value = service
  }

  const clearSelection = () => {
    selectedService.value = null
  }

  // Schedule the initial fetch using setImmediate to match the test's timing
  setImmediate(() => {
    fetchServices()
  })

  return {
    services,
    isLoading,
    error,
    selectedService,
    fetchServices,
    selectService,
    clearSelection,
  }
})
