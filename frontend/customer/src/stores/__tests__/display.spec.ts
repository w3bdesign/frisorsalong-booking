import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDisplayStore } from '../display'

describe('Display Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Setup fake timers
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial State', () => {
    it('initializes with correct employees', () => {
      const store = useDisplayStore()
      expect(store.employees).toHaveLength(2)
      expect(store.employees[0]).toMatchObject({
        id: '1',
        name: 'Gladys',
        color: 'bg-sky-400',
        isActive: true,
      })
      expect(store.employees[1]).toMatchObject({
        id: '2',
        name: 'Veronika',
        color: 'bg-fuchsia-400',
        isActive: true,
      })
    })

    it('initializes with correct waiting slots', () => {
      const store = useDisplayStore()
      expect(store.waitingSlots).toHaveLength(5)
      expect(store.waitingSlots[0]).toMatchObject({
        id: '1',
        customerName: 'Anders',
        estimatedTime: 30,
        assignedTo: '1',
      })
    })
  })

  describe('Computed Properties', () => {
    it('returns active employees correctly', () => {
      const store = useDisplayStore()
      expect(store.activeEmployees).toHaveLength(2)

      // Toggle one employee to inactive
      store.toggleEmployeeActive('1')
      expect(store.activeEmployees).toHaveLength(1)
      expect(store.activeEmployees[0].id).toBe('2')
    })

    it('correctly determines if slots are available', () => {
      const store = useDisplayStore()
      // Initially all active employees have assignments
      expect(store.hasAvailableSlot).toBe(false)

      // Clear all slots for employee 1 to make them available
      store.clearSlot('1')
      store.clearSlot('3')
      expect(store.hasAvailableSlot).toBe(true)
    })
  })

  describe('Methods', () => {
    it('assigns a slot correctly', () => {
      const store = useDisplayStore()
      store.assignSlot('5', 'John', '1', 45)

      const slot = store.waitingSlots.find((s) => s.id === '5')
      expect(slot).toMatchObject({
        id: '5',
        customerName: 'John',
        assignedTo: '1',
        estimatedTime: 45,
      })
    })

    it('clears a slot correctly', () => {
      const store = useDisplayStore()
      store.clearSlot('1')

      const slot = store.waitingSlots.find((s) => s.id === '1')
      expect(slot).toMatchObject({
        id: '1',
        customerName: undefined,
        assignedTo: undefined,
        estimatedTime: undefined,
      })
    })

    it('toggles employee active status', () => {
      const store = useDisplayStore()
      const initialStatus = store.employees[0].isActive

      store.toggleEmployeeActive('1')
      expect(store.employees[0].isActive).toBe(!initialStatus)

      store.toggleEmployeeActive('1')
      expect(store.employees[0].isActive).toBe(initialStatus)
    })

    it('updates lastUpdate timestamp', () => {
      const store = useDisplayStore()
      const initialTimestamp = store.lastUpdate.getTime()

      vi.advanceTimersByTime(1000) // Advance time by 1 second
      store.updateLastUpdate()
      expect(store.lastUpdate.getTime()).toBeGreaterThan(initialTimestamp)
    })

    it('updates lastUpdate when modifying slots or employees', () => {
      const store = useDisplayStore()
      const initialTimestamp = store.lastUpdate.getTime()

      vi.advanceTimersByTime(1000) // Advance time by 1 second
      store.assignSlot('5', 'John', '1', 45)
      expect(store.lastUpdate.getTime()).toBeGreaterThan(initialTimestamp)

      vi.advanceTimersByTime(1000) // Advance time by another second
      const secondTimestamp = store.lastUpdate.getTime()
      store.clearSlot('1')
      expect(store.lastUpdate.getTime()).toBeGreaterThan(secondTimestamp)

      vi.advanceTimersByTime(1000) // Advance time by another second
      const thirdTimestamp = store.lastUpdate.getTime()
      store.toggleEmployeeActive('1')
      expect(store.lastUpdate.getTime()).toBeGreaterThan(thirdTimestamp)
    })
  })
})
