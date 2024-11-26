import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDisplayStore } from '../display'
import axios from 'axios'

vi.mock('axios')

describe('Display Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        count: 2,
        customers: [
          {
            firstName: 'Vada',
            estimatedWaitingTime: 0,
          },
          {
            firstName: 'Lavinia',
            estimatedWaitingTime: 45,
          },
        ],
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
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

    it('initializes with empty waiting slots', () => {
      const store = useDisplayStore()
      expect(store.waitingSlots).toHaveLength(0)
    })
  })

  describe('Computed Properties', () => {
    it('returns active employees correctly', () => {
      const store = useDisplayStore()
      expect(store.activeEmployees).toHaveLength(2)

      // Manually set one employee to inactive
      store.employees[0].isActive = false
      expect(store.activeEmployees).toHaveLength(1)
      expect(store.activeEmployees[0].id).toBe('2')
    })

    it('correctly determines if slots are available', async () => {
      const store = useDisplayStore()

      // Initially no slots, so should be available
      expect(store.hasAvailableSlot).toBe(true)

      // Fetch waiting slots
      await store.fetchWaitingSlots()

      // With 2 customers and 2 employees, should be unavailable
      expect(store.hasAvailableSlot).toBe(false)

      // Mock fewer customers
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: {
          count: 1,
          customers: [
            {
              firstName: 'Vada',
              estimatedWaitingTime: 0,
            },
          ],
        },
      })

      // Fetch updated slots
      await store.fetchWaitingSlots(true)

      // With 1 customer and 2 employees, should be available
      expect(store.hasAvailableSlot).toBe(true)
    })
  })

  describe('Methods', () => {
    it('fetches waiting slots correctly', async () => {
      const store = useDisplayStore()
      await store.fetchWaitingSlots()

      expect(store.waitingSlots).toHaveLength(2)
      expect(store.waitingSlots[0]).toMatchObject({
        customerName: 'Vada',
        estimatedTime: 0,
      })
      expect(store.waitingSlots[1]).toMatchObject({
        customerName: 'Lavinia',
        estimatedTime: 45,
      })
    })

    it('updates lastUpdate timestamp', () => {
      const store = useDisplayStore()
      const initialTimestamp = store.lastUpdate.getTime()

      vi.advanceTimersByTime(1000) // Advance time by 1 second
      store.updateLastUpdate()
      expect(store.lastUpdate.getTime()).toBeGreaterThan(initialTimestamp)
    })
  })
})
