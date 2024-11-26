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

// Inject for easier testing
const getCurrentTime = () => Date.now()

export const useDisplayStore = defineStore('display', () => {
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
  const lastUpdate = ref(getCurrentTime())
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)
  const waitingCount = ref(0)

  const CACHE_DURATION = 30000 // 30 seconds

  const shouldRefetch = computed(() => {
    if (!lastFetched.value) return true
    return getCurrentTime() - lastFetched.value > CACHE_DURATION
  })

  const activeEmployees = computed(() => {
    return employees.value.filter((emp) => emp.isActive)
  })

  const hasAvailableSlot = computed(() => {
    return waitingCount.value < activeEmployees.value.length
  })

  const updateLastUpdate = () => {
    lastUpdate.value = getCurrentTime()
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
    if (!forceRefresh && !shouldRefetch.value && waitingSlots.value.length > 0) {
      return
    }

    try {
      isLoading.value = true
      error.value = null

      const response = await axios.get<QueueResponse>(
        'http://localhost:3000/bookings/upcoming/count',
      )

      waitingCount.value = response.data.count
      waitingSlots.value = generateWaitingSlots(response.data.count, response.data.customers)
      lastFetched.value = getCurrentTime()
      updateLastUpdate()
    } catch (err) {
      error.value = 'Kunne ikke hente venteliste'
      waitingSlots.value = []
      waitingCount.value = 0
    } finally {
      isLoading.value = false
    }
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
  }
})
