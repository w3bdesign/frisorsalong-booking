import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface Employee {
  id: string
  name: string
  color: string
  isActive: boolean
}

export interface WaitingSlot {
  id: string
  customerName?: string
  estimatedTime?: number
  assignedTo?: string
}

interface QueueResponse {
  count: number
  customers: Array<{
    firstName: string
    estimatedWaitingTime: number
  }>
}

export const useDisplayStore = defineStore('display', () => {
  // Keep employees hardcoded as per requirements
  const employees = ref<Employee[]>([
    {
      id: '1',
      name: 'Gladys',
      color: 'bg-sky-400',
      isActive: true,
    },
    {
      id: '2',
      name: 'Veronika',
      color: 'bg-fuchsia-400',
      isActive: true,
    },
  ])

  const waitingSlots = ref<WaitingSlot[]>([])
  const lastUpdate = ref(new Date())
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)
  const waitingCount = ref(0)

  const CACHE_DURATION = 30000 // 30 seconds

  const shouldRefetch = computed(() => {
    if (!lastFetched.value) return true
    return Date.now() - lastFetched.value > CACHE_DURATION
  })

  const activeEmployees = computed(() => {
    return employees.value.filter((emp) => emp.isActive)
  })

  // Check if any slots are available based on waiting count
  const hasAvailableSlot = computed(() => {
    return waitingCount.value < activeEmployees.value.length
  })

  const updateLastUpdate = () => {
    lastUpdate.value = new Date()
  }

  const generateWaitingSlots = (
    count: number,
    customers: Array<{ firstName: string; estimatedWaitingTime: number }>,
  ) => {
    return customers.map((customer, index) => ({
      id: `slot-${index + 1}`,
      customerName: customer.firstName,
      estimatedTime: customer.estimatedWaitingTime,
      assignedTo: employees.value[index % employees.value.length].id,
    }))
  }

  const fetchWaitingSlots = async (forceRefresh = false) => {
    console.log('Fetching waiting slots...')
    // Return cached data if it's still fresh
    if (!forceRefresh && !shouldRefetch.value && waitingSlots.value.length > 0) {
      console.log('Using cached data')
      return
    }

    try {
      isLoading.value = true
      error.value = null

      console.log('Fetching from API...')
      const response = await axios.get<QueueResponse>(
        'http://localhost:3000/bookings/upcoming/count',
      )
      console.log('API response:', response.data)

      // Update the waiting count
      waitingCount.value = response.data.count

      // Generate slots based on actual customers
      waitingSlots.value = generateWaitingSlots(response.data.count, response.data.customers)

      lastFetched.value = Date.now()
      updateLastUpdate()
      console.log('Updated waiting slots:', waitingSlots.value)
    } catch (err) {
      console.error('Error fetching waiting slots:', err)
      error.value = 'Kunne ikke hente venteliste'
      // Ensure waitingSlots is always an array even on error
      waitingSlots.value = []
      waitingCount.value = 0
    } finally {
      isLoading.value = false
    }
  }

  // Start polling for updates
  let pollInterval: number | null = null

  const startPolling = () => {
    console.log('Starting polling...')
    if (pollInterval) {
      console.log('Polling already active')
      return
    }

    // Initial fetch
    fetchWaitingSlots()

    // Then poll every 30 seconds
    pollInterval = window.setInterval(() => {
      console.log('Polling interval triggered')
      fetchWaitingSlots()
    }, CACHE_DURATION)
  }

  const stopPolling = () => {
    console.log('Stopping polling...')
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  // Cleanup function to be called when component unmounts
  const cleanup = () => {
    stopPolling()
  }

  return {
    employees,
    waitingSlots,
    lastUpdate,
    activeEmployees,
    hasAvailableSlot,
    isLoading,
    error,
    waitingCount,
    shouldRefetch,
    fetchWaitingSlots,
    updateLastUpdate,
    startPolling,
    stopPolling,
    cleanup,
  }
})
