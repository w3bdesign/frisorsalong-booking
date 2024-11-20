import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Service {
  id: string
  name: string
  description: string
  duration: number // in minutes
  price: number
}

// Mock data
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Quick Cut',
    description:
      'A quick and efficient haircut for those on the go. Perfect for maintaining your current style.',
    duration: 20,
    price: 299,
  },
  {
    id: '2',
    name: 'Style Cut',
    description:
      'Complete haircut and styling service. Includes consultation for the perfect look.',
    duration: 30,
    price: 399,
  },
  {
    id: '3',
    name: 'Beard Trim',
    description: 'Professional beard trimming and shaping to keep your facial hair looking sharp.',
    duration: 15,
    price: 199,
  },
  {
    id: '4',
    name: 'Full Service',
    description:
      'Complete package including haircut, beard trim, and styling. Our premium service.',
    duration: 45,
    price: 549,
  },
]

export const useServicesStore = defineStore('services', () => {
  const services = ref<Service[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedService = ref<Service | null>(null)

  const fetchServices = async () => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      services.value = mockServices
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
