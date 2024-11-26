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
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const waitingCount = ref(0)

  const activeEmployees = computed(() => {
    return employees.value.filter((emp) => emp.isActive)
  })

  const hasAvailableSlot = computed(() => {
    return waitingCount.value < activeEmployees.value.length
  })

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
    try {
      isLoading.value = true
      error.value = null

      const response = await axios.get<QueueResponse>(
        'http://localhost:3000/bookings/upcoming/count',
      )

      waitingCount.value = response.data.count
      waitingSlots.value = generateWaitingSlots(response.data.count, response.data.customers)
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
    activeEmployees,
    hasAvailableSlot,
    isLoading,
    error,
    waitingCount,
    fetchWaitingSlots,
  }
})
