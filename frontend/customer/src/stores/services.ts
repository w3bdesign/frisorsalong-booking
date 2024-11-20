import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Service {
  id: string
  name: string
  description: string
  duration: number // in minutes
  price: number
}

export const useServicesStore = defineStore('services', () => {
  const services = ref<Service[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedService = ref<Service | null>(null)

  const fetchServices = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('http://localhost:3000/services', {
        headers: {
          accept: '*/*',
        },
      })
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
