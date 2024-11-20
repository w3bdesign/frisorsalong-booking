import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

  const waitingSlots = ref<WaitingSlot[]>([
    {
      id: '1',
      customerName: 'Anders',
      estimatedTime: 30,
      assignedTo: '1',
    },
    {
      id: '2',
      customerName: 'Maria',
      estimatedTime: 45,
      assignedTo: '2',
    },
    {
      id: '3',
      customerName: 'Erik',
      estimatedTime: 30,
      assignedTo: '1',
    },
    {
      id: '4',
      customerName: 'Sofia',
      estimatedTime: 60,
      assignedTo: '2',
    },
    {
      id: '5', // Keep one slot empty to show availability
    },
  ])

  const lastUpdate = ref(new Date())

  const activeEmployees = computed(() => {
    return employees.value.filter((emp) => emp.isActive)
  })

  // Check if any hairdresser has no assigned customers
  const hasAvailableSlot = computed(() => {
    const employeeAssignments = new Map<string, number>()

    // Count assignments for each employee
    waitingSlots.value.forEach((slot) => {
      if (slot.assignedTo) {
        employeeAssignments.set(
          slot.assignedTo,
          (employeeAssignments.get(slot.assignedTo) || 0) + 1,
        )
      }
    })

    // Check if any active employee has no assignments
    return activeEmployees.value.some((emp) => !employeeAssignments.has(emp.id))
  })

  const updateLastUpdate = () => {
    lastUpdate.value = new Date()
  }

  const assignSlot = (
    slotId: string,
    customerName: string,
    employeeId: string,
    estimatedTime: number,
  ) => {
    const slot = waitingSlots.value.find((slot) => slot.id === slotId)
    if (slot) {
      slot.customerName = customerName
      slot.assignedTo = employeeId
      slot.estimatedTime = estimatedTime
      updateLastUpdate()
    }
  }

  const clearSlot = (slotId: string) => {
    const slot = waitingSlots.value.find((slot) => slot.id === slotId)
    if (slot) {
      slot.customerName = undefined
      slot.assignedTo = undefined
      slot.estimatedTime = undefined
      updateLastUpdate()
    }
  }

  const toggleEmployeeActive = (employeeId: string) => {
    const employee = employees.value.find((emp) => emp.id === employeeId)
    if (employee) {
      employee.isActive = !employee.isActive
      updateLastUpdate()
    }
  }

  return {
    employees,
    waitingSlots,
    lastUpdate,
    activeEmployees,
    hasAvailableSlot,
    assignSlot,
    clearSlot,
    toggleEmployeeActive,
    updateLastUpdate,
  }
})
