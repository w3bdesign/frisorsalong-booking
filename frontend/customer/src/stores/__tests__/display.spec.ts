import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDisplayStore } from '../display'
import axios from 'axios'

vi.mock('axios')

describe('Display Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('manages employees', () => {
    const store = useDisplayStore()

    // Check initial state
    expect(store.employees).toHaveLength(2)
    expect(store.activeEmployees).toHaveLength(2)

    // Test employee deactivation
    store.employees[0].isActive = false
    expect(store.activeEmployees).toHaveLength(1)
  })

  it('manages waiting slots', async () => {
    // Setup mock API response
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        count: 1,
        customers: [{ firstName: 'Test', estimatedWaitingTime: 15 }],
      },
    })

    const store = useDisplayStore()

    // Check initial state
    expect(store.waitingSlots).toHaveLength(0)
    expect(store.waitingCount).toBe(0)

    // Fetch data
    await store.fetchWaitingSlots()

    // Check updated state
    expect(store.waitingSlots).toHaveLength(1)
    expect(store.waitingCount).toBe(1)
    expect(store.waitingSlots[0]).toMatchObject({
      customerName: 'Test',
      estimatedTime: 15,
    })
  })

  it('handles API errors', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('API Error'))
    const store = useDisplayStore()

    await store.fetchWaitingSlots()

    expect(store.error).toBe('Kunne ikke hente venteliste')
    expect(store.waitingSlots).toHaveLength(0)
  })

  it('calculates slot availability', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        count: 3, // More customers than employees
        customers: [
          { firstName: 'Test1', estimatedWaitingTime: 10 },
          { firstName: 'Test2', estimatedWaitingTime: 20 },
          { firstName: 'Test3', estimatedWaitingTime: 30 },
        ],
      },
    })

    const store = useDisplayStore()

    // Initially available (no customers)
    expect(store.hasAvailableSlot).toBe(true)

    // After fetching (more customers than employees)
    await store.fetchWaitingSlots()
    expect(store.hasAvailableSlot).toBe(false)
  })
})
