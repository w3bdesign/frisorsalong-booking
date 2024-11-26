import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TVDisplayView from '../TVDisplayView.vue'
import { useDisplayStore } from '../../stores/display'
import axios from 'axios'

vi.mock('axios')
vi.mock('../../stores/display', () => ({
  useDisplayStore: vi.fn(),
}))

describe('TVDisplayView', () => {
  const mockEmployees = [
    { id: '1', name: 'Gladys', color: 'bg-sky-400', isActive: true },
    { id: '2', name: 'Veronika', color: 'bg-fuchsia-400', isActive: true },
  ]

  const mockWaitingSlots = [
    {
      id: 'slot-1',
      customerName: 'Vada',
      estimatedTime: 0,
      assignedTo: '1',
    },
    {
      id: 'slot-2',
      customerName: 'Lavinia',
      estimatedTime: 45,
      assignedTo: '2',
    },
  ]

  const createMockStore = (overrides = {}) => ({
    hasAvailableSlot: false,
    activeEmployees: mockEmployees,
    waitingSlots: mockWaitingSlots,
    lastUpdate: new Date('2024-01-01T12:00:00'),
    updateLastUpdate: vi.fn(),
    employees: mockEmployees,
    startPolling: vi.fn(),
    stopPolling: vi.fn(),
    cleanup: vi.fn(),
    isLoading: false,
    error: null,
    waitingCount: 2,
    fetchWaitingSlots: vi.fn(),
    ...overrides,
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00'))

    // Mock store with default values
    vi.mocked(useDisplayStore).mockReturnValue(createMockStore())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('displays correct status when slots are available', () => {
    vi.mocked(useDisplayStore).mockReturnValue(createMockStore({
      hasAvailableSlot: true,
    }))

    const wrapper = mount(TVDisplayView)
    expect(wrapper.find('h1').text()).toBe('Ledig')
    expect(wrapper.find('h1').classes()).toContain('text-[#c2ff00]')
  })

  it('displays correct status when no slots are available', () => {
    vi.mocked(useDisplayStore).mockReturnValue(createMockStore({
      hasAvailableSlot: false,
    }))

    const wrapper = mount(TVDisplayView)
    expect(wrapper.find('h1').text()).toBe('Opptatt')
    expect(wrapper.find('h1').classes()).toContain('text-red-500')
  })

  it('renders waiting list correctly', () => {
    const wrapper = mount(TVDisplayView)
    const waitingSlots = wrapper.findAll('.space-y-16 > div')

    expect(waitingSlots).toHaveLength(mockWaitingSlots.length)

    // Check first slot (Vada)
    const firstSlot = waitingSlots[0]
    expect(firstSlot.text()).toContain('Vada')
    expect(firstSlot.text()).toContain('0 min')
    expect(firstSlot.find('.w-8.h-8').classes()).toContain('bg-sky-400')

    // Check second slot (Lavinia)
    const secondSlot = waitingSlots[1]
    expect(secondSlot.text()).toContain('Lavinia')
    expect(secondSlot.text()).toContain('45 min')
    expect(secondSlot.find('.w-8.h-8').classes()).toContain('bg-fuchsia-400')
  })

  it('displays active employees correctly', () => {
    const wrapper = mount(TVDisplayView)
    const employeeElements = wrapper.findAll('[data-testid="employee"]')

    expect(employeeElements).toHaveLength(mockEmployees.length)
    expect(wrapper.text()).toContain('2 frisører på jobb')

    mockEmployees.forEach((employee, index) => {
      const element = employeeElements[index]
      expect(element.text()).toContain(employee.name)
      expect(element.find(`.${employee.color}`).exists()).toBe(true)
    })
  })

  it('formats last update time correctly', () => {
    const wrapper = mount(TVDisplayView)
    expect(wrapper.text()).toContain('12:00:00')
  })

  it('starts polling on mount and cleans up on unmount', () => {
    const mockStartPolling = vi.fn()
    const mockCleanup = vi.fn()
    vi.mocked(useDisplayStore).mockReturnValue(createMockStore({
      startPolling: mockStartPolling,
      cleanup: mockCleanup,
    }))

    const wrapper = mount(TVDisplayView)
    expect(mockStartPolling).toHaveBeenCalled()

    wrapper.unmount()
    expect(mockCleanup).toHaveBeenCalled()
  })
})
